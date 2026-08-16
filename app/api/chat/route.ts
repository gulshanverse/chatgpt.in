import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const encoder = new TextEncoder();
type HistoryMessage = { role: "user" | "assistant" | "system"; content: string };
type AttachmentInput = { fileId?: string; name?: string };

function sse(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function streamResponse(conversationId: string, responseText: string) {
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
  let body: { conversationId?: string; content?: string; history?: HistoryMessage[]; model?: string; attachments?: AttachmentInput[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content) return NextResponse.json({ error: "Message content is required" }, { status: 400 });

  const conversationId = body.conversationId ?? crypto.randomUUID();
  const history = (body.history ?? []).filter((message) => message.content.trim()).slice(-30);
  const attachments = (body.attachments ?? []).filter((attachment) => attachment.fileId);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const suffix = attachments.length ? ` I also received ${attachments.length} uploaded file${attachments.length === 1 ? "" : "s"}.` : "";
    return new Response(
      streamResponse(conversationId, `I received your message: “${content}”.${suffix} Add OPENAI_API_KEY to enable live model responses.`),
      { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } },
    );
  }

  try {
    const client = new OpenAI({ apiKey });
    const model = body.model || process.env.OPENAI_MODEL || "gpt-5.6";
    const input: OpenAI.Responses.ResponseInput = [
      ...history.map((message): OpenAI.Responses.ResponseInputItem => ({
        role: message.role === "system" ? "developer" : message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: [
          { type: "input_text", text: content },
          ...attachments.map((attachment) => ({ type: "input_file" as const, file_id: attachment.fileId! })),
        ],
      },
    ];
    const stream = await client.responses.create({ model, input, stream: true });

    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(sse("conversation", { conversationId }));
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") controller.enqueue(sse("token", { token: event.delta }));
            if (event.type === "response.completed") controller.enqueue(sse("done", { conversationId }));
          }
          controller.close();
        } catch (error) {
          controller.enqueue(sse("error", { error: error instanceof Error ? error.message : "Model stream failed" }));
          controller.close();
        }
      },
    });

    return new Response(responseStream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to start model response" }, { status: 502 });
  }
}
