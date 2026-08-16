import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const encoder = new TextEncoder();
type HistoryMessage = { role: "user" | "assistant" | "system"; content: string };
type AttachmentInput = { fileId?: string; name?: string };
const MAX_CONTENT_LENGTH = 32_000;
const MAX_HISTORY_ITEMS = 30;
const MAX_HISTORY_MESSAGE_LENGTH = 32_000;
const MAX_ATTACHMENTS = 10;
const MAX_CONVERSATION_ID_LENGTH = 100;
const ALLOWED_MODELS = new Set(["gpt-5.6", "gpt-5.4", "gpt-5.4-mini"]);
const FILE_ID_PATTERN = /^file-[A-Za-z0-9_-]{1,200}$/;

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
  if (content.length > MAX_CONTENT_LENGTH) return NextResponse.json({ error: "Message is too long. Please keep it under 32,000 characters." }, { status: 413 });

  const rawConversationId = body.conversationId?.trim();
  if (rawConversationId && rawConversationId.length > MAX_CONVERSATION_ID_LENGTH) {
    return NextResponse.json({ error: "Conversation identifier is invalid" }, { status: 400 });
  }
  const conversationId = rawConversationId || crypto.randomUUID();

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((message): message is HistoryMessage => Boolean(message)
      && (message.role === "user" || message.role === "assistant" || message.role === "system")
      && typeof message.content === "string"
      && Boolean(message.content.trim()))
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));

  const rawAttachments = Array.isArray(body.attachments) ? body.attachments : [];
  const invalidAttachment = rawAttachments.some((attachment) => !attachment || typeof attachment.fileId !== "string" || !FILE_ID_PATTERN.test(attachment.fileId));
  if (invalidAttachment) return NextResponse.json({ error: "One or more attachments are invalid" }, { status: 400 });
  const attachments = rawAttachments.slice(0, MAX_ATTACHMENTS);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const suffix = attachments.length ? ` I also received ${attachments.length} uploaded file${attachments.length === 1 ? "" : "s"}.` : "";
    return new Response(
      streamResponse(conversationId, `I received your message: “${content}”.${suffix} Add OPENAI_API_KEY to enable live model responses.`),
      { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } },
    );
  }

  const requestedModel = body.model || process.env.OPENAI_MODEL || "gpt-5.6";
  const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : "gpt-5.6";

  const client = new OpenAI({ apiKey });
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

  try {
    const stream = await client.responses.create({ model, input, stream: true });
    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(sse("conversation", { conversationId }));
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") controller.enqueue(sse("token", { token: event.delta }));
            if (event.type === "response.completed") controller.enqueue(sse("done", { conversationId }));
            if (event.type === "response.failed") throw new Error("OpenAI response failed");
          }
          controller.close();
        } catch {
          // Fall back to a non-streaming Responses request. This protects the Vercel
          // deployment from transient upstream stream disconnects while preserving
          // the same SSE contract expected by the client.
          try {
            const fallback = await client.responses.create({ model, input, stream: false });
            const fallbackText = fallback.output_text?.trim();
            if (!fallbackText) throw new Error("Empty model response");
            for (const token of fallbackText.split(" ")) {
              controller.enqueue(sse("token", { token: `${token} ` }));
              await new Promise((resolve) => setTimeout(resolve, 8));
            }
            controller.enqueue(sse("done", { conversationId }));
            controller.close();
          } catch {
            controller.enqueue(sse("error", { error: "The model could not complete this response. Check the OpenAI project key, billing, and model access, then try again." }));
            controller.close();
          }
        }
      },
    });

    return new Response(responseStream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" } });
  } catch {
    return NextResponse.json({ error: "Unable to start the model response right now. Check the OpenAI project key, billing, and model access." }, { status: 502 });
  }
}
