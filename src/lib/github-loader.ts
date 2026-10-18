import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { type Document } from "@langchain/core/documents";
import { generateEmbedding, summariesCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (
  path: string,
  octokit: Octokit,
  githubOwner: string,
  githubRepo: string,
  accumulator: number,
) => {
  const { data } = await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path,
  });
  if (!Array.isArray(data) && data.type === "file") {
    return accumulator + 1;
  }

  if (Array.isArray(data)) {
    let fileCount = 0;
    const directories: string[] = [];

    for (const item of data) {
      if (item.type === "dir") {
        directories.push(item.path);
      } else {
        fileCount++;
      }
    }

    if (directories.length > 0) {
      const directoryCounts = await Promise.all(
        directories.map((dirPath) =>
          getFileCount(dirPath, octokit, githubOwner, githubRepo, 0),
        ),
      );
      fileCount += directoryCounts.reduce((acc, count) => acc + count, 0);
    }

    return accumulator + fileCount;
  }

  return accumulator;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
  // console.log(githubUrl, githubOwner, githubRepo)
  const octokit = new Octokit({ auth: githubToken || "" });
  const githubOwner = githubUrl.split("/")[3];
  const githubRepo = githubUrl.split("/")[4];
  if (!githubOwner || !githubRepo) {
    return 0;
  }

  const fileCount = await getFileCount("", octokit, githubOwner, githubRepo, 0);

  return fileCount;
};

export const loadGithubRepo = async (
  githubUrl: string,
  githubToken?: string,
  branchName = "main",
) => {
  console.log(branchName);
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || "",
    branch: branchName,
    recursive: true,
    unknown: "warn",
    maxConcurrency: 5,
    ignoreFiles: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"],
  });
  const docs = await loader.load();
  return docs;
};

export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string,
  branchName?: string,
) => {
  const docs = await loadGithubRepo(githubUrl, githubToken, branchName);
  const allEmbeddings = await generateEmbeddings(docs);
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`procceing ${index} of ${allEmbeddings.length}`);
      if (!embedding) return;

      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          projectId,
          fileName: embedding.fileName,
          sourceCode: embedding.sourceCode,
          summary: embedding.summary,
        },
      });

      const embeddingString = `[${embedding.embedding.join(", ")}]`;
      await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embeddingString}::vector(768)
        WHERE "id" = ${sourceCodeEmbedding.id}
      `;
    }),
  );
};

const generateEmbeddings = async (docs: Document[]) => {
  return await Promise.all(
    docs.map(async (doc) => {
      const summary = await summariesCode(doc);
      const embedding = await generateEmbedding(summary);
      return {
        summary,
        embedding,
        sourceCode: JSON.stringify(doc.pageContent),
        fileName: doc.metadata?.source,
      };
    }),
  );
};
