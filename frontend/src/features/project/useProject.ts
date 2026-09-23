import { use } from "react";
import { ProjectContext } from "./ProjectContext";

export const useProject = () => {
	const project = use(ProjectContext);

	if (project == null) throw new Error("Project is null");

	return project;
};
