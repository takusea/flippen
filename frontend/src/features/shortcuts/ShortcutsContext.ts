import { createContext } from "react";
import type { ShortcutId, Shortcuts } from "./shortcutDefinitions";

type ShortcutsContextValue = {
	shortcuts: Shortcuts;
	setShortcut: (id: ShortcutId, shortcut: string) => void;
	resetShortcuts: () => void;
};

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(
	null,
);
