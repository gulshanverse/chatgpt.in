import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "File is required" }, { status: 400 });
    if (file.size === 0) return NextResponse.json({ error: "File is empty" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File exceeds the 25 MB upload limit" }, { status: 413 });

    const client = new OpenAI({ apiKey });
    const uploaded = await client.files.create({ file, purpose: "user_data" });

    return NextResponse.json({ id: uploaded.id, name: file.name, type: file.type || "application/octet-stream", size: file.size });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload file" }, { status: 502 });
  }
}
