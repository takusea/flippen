import { useSyncExternalStore } from "react";
import { useCore } from "./useCore";

export const useCoreSnapshot = () => {
	const core = useCore();

	return useSyncExternalStore(
		core.subscribe,
		core.getSnapshot,
		core.getSnapshot,
	);
};
