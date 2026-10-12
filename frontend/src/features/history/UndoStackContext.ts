import { createContext } from "react";

export type UndoStackContextValue = {
	undo: () => void;
	redo: () => void;
};

export const UndoStackContext = createContext<UndoStackContextValue | null>(
	null,
);
