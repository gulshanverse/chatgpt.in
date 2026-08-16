import { NextResponse } from "next/server";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
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
  const responseText = `I received your message: “${content}”. Connect your permitted model provider here to replace this development response with real streaming inference.`;

  const stream = new ReadableStream<Uint8Array>({
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
