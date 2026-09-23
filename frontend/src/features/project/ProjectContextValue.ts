import { createContext } from "react";
import type { ProjectSettings } from "./type";

type ProjectContextType = {
	settings: ProjectSettings | undefined;
	open: () => void;
	save: () => void;
	createNew: (settings: ProjectSettings) => void;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);
