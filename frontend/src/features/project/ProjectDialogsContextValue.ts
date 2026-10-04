import { createContext } from "react";

export type ProjectDialogsContextValue = {
	openCreateProjectDialog: () => void;
	openEditProjectSettingsDialog: () => void;
};

export const ProjectDialogsContext =
	createContext<ProjectDialogsContextValue | null>(null);
