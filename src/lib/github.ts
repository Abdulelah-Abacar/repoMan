import { Octokit } from "octokit";
import { db } from "@/server/db";
import axios from "axios";
import { aiSummariesCommit } from "./gemini";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

type Response = {
  hash: string;
  message: string;
  authorName: string;
  authorAvatar: string;
  date: string;
};

export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const { data } = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = data
    .sort(
      (a, b) =>
        new Date(b.commit.author!.date!).getTime() -
        new Date(a.commit.author!.date!).getTime(),
    )
    .slice(0, 10);

  return sortedCommits.map((commit) => ({
    hash: commit.sha,
    message: commit.commit.message,
    authorName: commit.commit.author!.name!,
    authorAvatar: commit.author?.avatar_url || "",
    date: commit.commit.author!.date!,
  }));
};

export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  const hashCommits = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    hashCommits,
  );
  const commitSummaries = await Promise.allSettled(
    unprocessedCommits.map(async (commit) => {
      return summariesCommit(githubUrl, commit.hash);
    }),
  );

  const summaries = commitSummaries.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    }
    return "";
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log("Creating commit with summary:", summary);
      return {
        hash: unprocessedCommits[index]!.hash,
        message: unprocessedCommits[index]!.message,
        authorName: unprocessedCommits[index]!.authorName,
        authorAvatar: unprocessedCommits[index]!.authorAvatar,
        date: unprocessedCommits[index]!.date,
        summary,
        projectId: projectId,
      };
    }),
  });
  return commits;
};

async function summariesCommit(githubUrl: string, commitHash: string) {
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });

  return (await aiSummariesCommit(data)) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });

  if (!project?.githubUrl) {
    throw new Error("Project GitHub URL not found");
  }

  return { project, githubUrl: project?.githubUrl };
}

async function filterUnprocessedCommits(
  projectId: string,
  commits: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
  });
  const unprocessedCommits = commits.filter(
    (commit) => !processedCommits.some((pc) => pc.hash === commit.hash),
  );
  return unprocessedCommits;
}
