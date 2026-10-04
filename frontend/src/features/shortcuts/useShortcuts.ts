import { use } from "react";
import { ShortcutsContext } from "./ShortcutsContext";

export const useShortcuts = () => {
	const shortcuts = use(ShortcutsContext);

	if (shortcuts == null) throw new Error("ShortcutsContext is not provided");

	return shortcuts;
};
