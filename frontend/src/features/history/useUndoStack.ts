import { use } from "react";
import { UndoStackContext } from "./UndoStackContext";

export const useUndoStack = () => {
	const undoStack = use(UndoStackContext);

	if (undoStack == null) throw new Error("UndoStackContext is null");

	return undoStack;
};
