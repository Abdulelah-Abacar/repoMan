import { env } from "@/env";
import { put } from "@vercel/blob";

export async function uploadAudio(
  audioFile: File,
  setProgress: (progress: number | ((prev: number) => number)) => void,
): Promise<{ url: string }> {
  try {
    setProgress(0);

    // Simulate progress since fetch doesn't provide upload progress
    const progressInterval = setInterval(() => {
      setProgress((prev: number): number => Math.min(prev + 10, 100));
    }, 200);

    const blob = await put(`audio_${Date.now()}-${audioFile.name}`, audioFile, {
      access: "public",
      contentType: audioFile.type,
      token: env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
    });

    clearInterval(progressInterval);
    setProgress(100);

    return { url: blob.url };
  } catch (error) {
    setProgress(0);
    throw error;
  }
}
