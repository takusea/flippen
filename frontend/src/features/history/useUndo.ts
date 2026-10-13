import { useCore } from "~/core/useCore";
import { useCoreSnapshot } from "~/core/useCoreSnapshot";

export const useUndo = () => {
	const core = useCore();
	const { canUndo, canRedo } = useCoreSnapshot();

	const undo = async () => {
		await core.undo();
	};

	const redo = async () => {
		await core.redo();
	};

	return { undo, redo, canUndo, canRedo };
};
