"use server";
import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLY_AI_API_KEY! });

function msToTime(ms: number) {
  const seconds = ms / 1000;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export const processMeeting = async (
  meetingUrl: string,
  meetingLag: string = "en",
) => {
  try {
    // Verify URL is accessible
    const headResponse = await fetch(meetingUrl, { method: "HEAD" });
    if (!headResponse.ok) {
      throw new Error(`URL not accessible: ${headResponse.status}`);
    }
    console.log("URL is accessible");

    const decodedUrl = decodeURIComponent(meetingUrl);
    const transcript = await client.transcripts.transcribe({
      audio: decodedUrl,
      auto_chapters: true,
    });

    if (transcript.status === "error") {
      throw new Error(`AssemblyAI error: ${transcript.error}`);
    }

    if (!transcript.text) throw new Error("No transcript found");

    const summaries =
      transcript.chapters?.map((chapter) => ({
        start: msToTime(chapter.start),
        end: msToTime(chapter.end),
        gist: chapter.gist,
        headline: chapter.headline,
        summary: chapter.summary,
      })) || [];

    return { summaries };
  } catch (error) {
    console.error("processMeeting error:", error);
    throw error;
  }
};
