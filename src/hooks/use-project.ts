import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const { data: projects } = api.project.getProjects.useQuery();
  const [projectId, setProjectId] = useLocalStorage("repoMan-projectId", " ");
  const project = projects?.find((p) => p.id === projectId);

  return { projects, project, setProjectId, projectId };
};

export default useProject;
