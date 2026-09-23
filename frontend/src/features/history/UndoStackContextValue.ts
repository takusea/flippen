import { createContext } from "react";

type UndoStackContextType = {
	undo: () => void;
	redo: () => void;
};

export const UndoStackContext = createContext<UndoStackContextType | null>(
	null,
);
