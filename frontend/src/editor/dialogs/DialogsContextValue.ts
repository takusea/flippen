import { createContext } from "react";

export type AppDialog =
	| "createProject"
	| "editProjectSettings"
	| "exportProject"
	| "appearanceSettings"
	| "languageSettings"
	| "shortcutSettings"
	| "about";

export type DialogsContextValue = {
	open: (dialog: AppDialog) => void;
	close: () => void;
};

export const DialogsContext = createContext<DialogsContextValue | null>(null);
