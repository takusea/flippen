import { use } from "react";
import { ProjectDialogsContext } from "./ProjectDialogsContextValue";

export const useProjectDialogs = () => {
	const projectDialogs = use(ProjectDialogsContext);

	if (projectDialogs == null) {
		throw new Error("ProjectDialogsContext is not provided");
	}

	return projectDialogs;
};
