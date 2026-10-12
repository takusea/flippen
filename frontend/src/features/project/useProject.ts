import { use } from "react";
import { ProjectContext } from "./ProjectContext";

export const useProject = () => {
	const project = use(ProjectContext);

	if (project == null) throw new Error("ProjectContext is not provided");

	return project;
};
