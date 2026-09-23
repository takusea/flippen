import { createContext } from "react";
import { useCore } from "~/infrastructure/core/useCore";

type UndoStackContextType = {
	undo: () => void;
	redo: () => void;
};

export const UndoStackContext = createContext<UndoStackContextType | null>(
	null,
);

export const UndoStackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const undo = () => {
		core.undo();
	};

	const redo = () => {
		core.redo();
	};

	return <UndoStackContext value={{ undo, redo }}>{children}</UndoStackContext>;
};
