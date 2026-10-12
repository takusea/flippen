import type { JSX } from "react/jsx-runtime";
import { useCore } from "~/core/useCore";
import { useCoreSnapshot } from "~/core/useCoreSnapshot";
import { UndoStackContext } from "./UndoStackContext";

type Props = {
	children: JSX.Element;
};

export const UndoStackProvider = ({ children }: Props) => {
	const core = useCore();
	const snapshot = useCoreSnapshot();

	const undo = async () => {
		await core.undo();
	};

	const redo = async () => {
		await core.redo();
	};

	const canUndo = snapshot.canUndo;
	const canRedo = snapshot.canRedo;

	return (
		<UndoStackContext value={{ undo, redo, canUndo, canRedo }}>
			{children}
		</UndoStackContext>
	);
};
