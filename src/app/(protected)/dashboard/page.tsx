"use client";
import ArchiveButton from "@/app/_components/ArchiveButton";
import AskQuestionCard from "@/app/_components/AskQuestionCard";
import CommitLog from "@/app/_components/CommitLog";
import InviteButton from "@/app/_components/InviteButton";
import MeetingCard from "@/app/_components/MeetingCard";
import TeamMembers from "@/app/_components/TeamMembers";
import useProject from "@/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";

function DashboardPage() {
  const { project } = useProject();
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/* GitHub Link */}
        <div className="bg-primary w-fit rounded-md px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This project is linked to{" "}
                <Link
                  className="inline-flex items-center text-white/80 hover:underline"
                  href={project?.githubUrl ?? ""}
                  target="_blank"
                >
                  {project?.githubUrl}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4" />

        {/* Team, Invitation, Archive */}
        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteButton />
          <ArchiveButton />
        </div>
      </div>
      <div className="mt-4">
        {/* Ask & Meeting Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <AskQuestionCard />
          <MeetingCard />
        </div>
      </div>
      <div className="mt-8" />
      <CommitLog />
    </div>
  );
}

export default DashboardPage;
