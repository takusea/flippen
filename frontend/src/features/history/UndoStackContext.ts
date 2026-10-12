import { createContext } from "react";

export type UndoStackContextValue = {
	undo: () => void;
	redo: () => void;
	canUndo: boolean;
	canRedo: boolean;
};

export const UndoStackContext = createContext<UndoStackContextValue | null>(
	null,
);
