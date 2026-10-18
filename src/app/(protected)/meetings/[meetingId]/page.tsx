import IssueList from "@/app/_components/IssueList";
import React from "react";

type Props = {
  params: Promise<{ meetingId: string }>;
};

const MeetingDetails = async ({ params }: Props) => {
  const { meetingId } = await params;
  return <IssueList meetingId={meetingId} />;
};

export default MeetingDetails;
