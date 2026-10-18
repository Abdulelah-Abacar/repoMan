"use client";
import MeetingCard from "@/app/_components/MeetingCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

const MeetingPage = () => {
  const { projectId } = useProject();
  const refetch = useRefetch();
  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 4000,
    },
  );
  return (
    <div>
      <MeetingCard />
      <div className="h6"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No meetings found</div>}
      {isLoading && <div>Loading....</div>}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`meetings/${meeting.id}`}
                    className={"text-sm font-semibold"}
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-yellow-500 text-white">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              <div className="gap-x02 flex items-center text-xs text-gray-500">
                <p className="whitespace-nowrap">
                  {meeting.createAt.toLocaleDateString()}
                  {" - "}
                </p>
                <p className="truncate">
                  {"  "}
                  {meeting.issues.length} Issues
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Link href={`meetings/${meeting.id}`}>
                <Button size={"sm"} variant={"outline"}>
                  View Meeting
                </Button>
              </Link>
              <Button
                size={"sm"}
                variant={"destructive"}
                disabled={deleteMeeting.isPending}
                onClick={() =>
                  deleteMeeting.mutate(
                    { meetingId: meeting.id },
                    {
                      onSuccess: () => {
                        toast.success("Meeting deleting successfully");
                        refetch();
                      },
                    },
                  )
                }
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingPage;
