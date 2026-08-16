export type UploadedChatFile = { id: string; clientId: string; name: string; type: string; size: number };

type QueuedChatFile = { file: File; clientId: string };
type UploadInput = File | QueuedChatFile;

let uploaded: UploadedChatFile[] = [];
let pending: Promise<void> = Promise.resolve();
const cancelled = new Set<string>();

function normalizeFile(input: UploadInput): QueuedChatFile {
  if (input instanceof File) return { file: input, clientId: `${input.name}:${input.size}:${input.lastModified}` };
  return input;
}

async function upload({ file, clientId }: QueuedChatFile): Promise<UploadedChatFile> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/files", { method: "POST", body: form });
  const data = (await response.json().catch(() => null)) as (Omit<UploadedChatFile, "clientId"> & { error?: string }) | null;
  if (!response.ok || !data?.id) throw new Error(data?.error || `Unable to upload ${file.name}`);
  return { id: data.id, clientId, name: data.name || file.name, type: data.type || file.type || "application/octet-stream", size: data.size || file.size };
}

export function queueChatFileUploads(inputs: UploadInput[]) {
  const files = inputs.map(normalizeFile);
  pending = pending.catch(() => undefined).then(async () => {
    const results = await Promise.allSettled(files.map(upload));
    for (const result of results) {
      if (result.status === "fulfilled" && !cancelled.has(result.value.clientId)) uploaded.push(result.value);
    }
    for (const file of files) cancelled.delete(file.clientId);
  });
  return pending;
}

export function cancelChatFileUpload(clientId: string) {
  cancelled.add(clientId);
  uploaded = uploaded.filter((file) => file.clientId !== clientId);
}

export async function consumeUploadedChatFiles(clientIds?: string[]) {
  await pending.catch(() => undefined);
  const allowed = clientIds ? new Set(clientIds) : null;
  const result = uploaded.filter((file) => !allowed || allowed.has(file.clientId));
  uploaded = allowed ? uploaded.filter((file) => !allowed.has(file.clientId)) : [];
  for (const file of result) cancelled.delete(file.clientId);
  if (!allowed) cancelled.clear();
  pending = Promise.resolve();
  return result;
}
