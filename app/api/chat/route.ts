import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function developmentStream(conversationId: string, content: string) {
  const responseText = `I received your message: “${content}”. Add OPENAI_API_KEY to enable live model responses.`;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(sse("conversation", { conversationId }));
      for (const token of responseText.split(" ")) {
        controller.enqueue(sse("token", { token: `${token} ` }));
        await new Promise((resolve) => setTimeout(resolve, 8));
      }
      controller.enqueue(sse("done", { conversationId }));
      controller.close();
    },
  });
}

export async function POST(request: Request) {
  let body: { conversationId?: string; content?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) {
    return NextResponse.json({ error: "Message content is required" }, { status: 400 });
  }

  const conversationId = body.conversationId ?? crypto.randomUUID();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(developmentStream(conversationId, content), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = process.env.OPENAI_MODEL ?? "gpt-5.6";
    const stream = await client.responses.create({
      model,
      input: content,
      stream: true,
    });

    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(sse("conversation", { conversationId }));
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              controller.enqueue(sse("token", { token: event.delta }));
            }
            if (event.type === "response.completed") {
              controller.enqueue(sse("done", { conversationId }));
            }
          }
          controller.close();
        } catch (error) {
          controller.enqueue(sse("error", { error: error instanceof Error ? error.message : "Model stream failed" }));
          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start model response" },
      { status: 502 },
    );
  }
}
