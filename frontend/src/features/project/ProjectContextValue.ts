import { createContext } from "react";
import type { ProjectSettings } from "./type";

export type ProjectContextValue = {
	settings: ProjectSettings | null;
	open: () => void;
	save: () => void;
	createNew: (settings: ProjectSettings) => void;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);
