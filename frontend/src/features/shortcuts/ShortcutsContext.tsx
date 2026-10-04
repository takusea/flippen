import { createContext, type ReactNode, useEffect, useState } from "react";
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

const getInitialShortcuts = (): Shortcuts => {
	const stored = localStorage.getItem(STORAGE_KEY);
	if (stored == null) return defaultShortcuts;

	const parsed: unknown = JSON.parse(stored);
	if (typeof parsed !== "object" || parsed == null) return defaultShortcuts;

	return Object.fromEntries(
		Object.keys(defaultShortcuts).map((id) => {
			const value = (parsed as Record<string, unknown>)[id];
			return [
				id,
				typeof value === "string" ? value : defaultShortcuts[id as ShortcutId],
			];
		}),
	) as Shortcuts;
};

export const ShortcutsProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [shortcuts, setShortcuts] = useState<Shortcuts>(getInitialShortcuts);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
	}, [shortcuts]);

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
