import { createContext, type ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
	defaultShortcuts,
	type ShortcutId,
	type Shortcuts,
} from "./shortcutDefinitions";

const STORAGE_KEY = "flippen.shortcuts";

type ShortcutsContextValue = {
	shortcuts: Shortcuts;
	setShortcut: (id: ShortcutId, shortcut: string) => void;
	resetShortcuts: () => void;
};

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(
	null,
);

export const ShortcutsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [shortcuts, setShortcuts] = useLocalStorage<Shortcuts>(
		STORAGE_KEY,
		defaultShortcuts,
	);

	const setShortcut = (id: ShortcutId, shortcut: string) => {
		setShortcuts((current) => ({ ...current, [id]: shortcut }));
	};

	const resetShortcuts = () => setShortcuts(defaultShortcuts);

	return (
		<ShortcutsContext value={{ shortcuts, setShortcut, resetShortcuts }}>
			{children}
		</ShortcutsContext>
	);
};
