import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_AUDIO_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Speech service is not configured" }, { status: 503 });

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    if (audio.size === 0) return NextResponse.json({ error: "Audio file is empty" }, { status: 400 });
    if (audio.size > MAX_AUDIO_SIZE) return NextResponse.json({ error: "Audio file is too large" }, { status: 413 });

    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      file: audio,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
    });

    const text = transcription.text?.trim();
    if (!text) return NextResponse.json({ error: "No speech was detected" }, { status: 422 });

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "Unable to transcribe audio right now" }, { status: 502 });
  }
}
