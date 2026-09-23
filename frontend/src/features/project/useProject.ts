import { use } from "react";
import { ProjectContext } from "./ProjectContextValue";

export const useProject = () => {
	const project = use(ProjectContext);

	if (project == null) throw new Error("Project is null");

	return project;
};
