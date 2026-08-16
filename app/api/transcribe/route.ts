import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });

  try {
    const form = await request.formData();
    const audio = form.get("audio");
    if (!(audio instanceof File)) return NextResponse.json({ error: "Audio file is required" }, { status: 400 });
    if (audio.size === 0) return NextResponse.json({ error: "Audio file is empty" }, { status: 400 });
    if (audio.size > 25 * 1024 * 1024) return NextResponse.json({ error: "Audio file is too large" }, { status: 413 });

    const client = new OpenAI({ apiKey });
    const transcription = await client.audio.transcriptions.create({
      file: audio,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to transcribe audio" },
      { status: 502 },
    );
  }
}
