"use client";

import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId, setProjectId } = useProject();
  const refetch = useRefetch();
  return (
    <Button
      size={"sm"}
      disabled={archiveProject.isPending}
      variant={"destructive"}
      onClick={() => {
        const confirm = window.confirm(
          "are you sure you want to archive this project",
        );
        if (confirm)
          archiveProject.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project Archived");
                refetch();
                setProjectId("");
              },
              onError: () => {
                toast.error("Failed to Archive Project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
