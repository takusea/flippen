import { createContext } from "react";
import type { ProjectSettings } from "./type";

export type ProjectContextValue = {
	settings: ProjectSettings | null;
	open: () => void;
	save: () => Promise<void>;
	createNew: (settings: ProjectSettings) => Promise<void>;
	updateSettings: (settings: ProjectSettings) => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);
