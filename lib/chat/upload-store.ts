export type UploadedChatFile = { id: string; name: string; type: string; size: number };

let uploaded: UploadedChatFile[] = [];
let pending: Promise<void> = Promise.resolve();

async function upload(file: File): Promise<UploadedChatFile> {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/files", { method: "POST", body: form });
  const data = (await response.json().catch(() => null)) as (UploadedChatFile & { error?: string }) | null;
  if (!response.ok || !data?.id) throw new Error(data?.error || `Unable to upload ${file.name}`);
  return { id: data.id, name: data.name || file.name, type: data.type || file.type || "application/octet-stream", size: data.size || file.size };
}

export function queueChatFileUploads(files: File[]) {
  pending = pending
    .catch(() => undefined)
    .then(async () => {
      const results = await Promise.allSettled(files.map(upload));
      for (const result of results) {
        if (result.status === "fulfilled") uploaded.push(result.value);
      }
    });
  return pending;
}

export async function consumeUploadedChatFiles() {
  await pending.catch(() => undefined);
  const result = uploaded;
  uploaded = [];
  pending = Promise.resolve();
  return result;
}
