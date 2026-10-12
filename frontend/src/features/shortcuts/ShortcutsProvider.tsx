import type { ReactNode } from "react";
import { useLocalStorage } from "usehooks-ts";
import { ShortcutsContext } from "./ShortcutsContext";
import {
	defaultShortcuts,
	type ShortcutId,
	type Shortcuts,
} from "./shortcutDefinitions";

const STORAGE_KEY = "flippen.shortcuts";

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
