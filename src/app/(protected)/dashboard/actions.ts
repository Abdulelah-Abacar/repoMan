"use server";
import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateEmbedding } from "@/lib/gemini";
import { db } from "@/server/db";

const googleGpt = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue();

  const queryVector = await generateEmbedding(question);
  const vectorQuery = `[${queryVector.join(",")}]`;

  console.log("Query Vector:", queryVector);
  console.log("Vector Query:", vectorQuery);
  // WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .5

  const result = (await db.$queryRaw`
  SELECT "fileName", "sourceCode", "summary",
  1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
  FROM "SourceCodeEmbedding"
  WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > 0.3
  AND "projectId" = ${projectId}
  ORDER BY similarity DESC
  LIMIT 10;
  `) as { fileName: string; sourceCode: string; summary: string }[];

  let context = "";
  for (const row of result) {
    context += `File Name: ${row.fileName}\nSummary: ${row.summary}\nSource Code: ${row.sourceCode}\n\n`;
  }

  const prompt = `You are RepoMan, an AI assistant that helps developers by answering questions about their codebase. Use the following context from the codebase to answer the question as accurately as possible. If the context does not contain the answer, respond with "I don't know".

Context:
${context}
Question: ${question}
Answer:`;

  (async () => {
    const { textStream } = await streamText({
      model: googleGpt("gemini-2.0-flash"),
      prompt,
    });
    for await (const chunk of textStream) {
      stream.update(chunk);
    }

    stream.done();
  })();

  return {
    output: stream.value,
    filesReferences: result,
  };
}
