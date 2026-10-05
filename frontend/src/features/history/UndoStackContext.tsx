import { useCore } from "~/infrastructure/core/useCore";
import { UndoStackContext } from "./UndoStackContextValue";

export const UndoStackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const undo = async () => {
		await core.undo();
	};

	const redo = async () => {
		await core.redo();
	};

	return <UndoStackContext value={{ undo, redo }}>{children}</UndoStackContext>;
};
