import { createContext } from "react";
import { useClip } from "../Clip/useClip";
import { useCore } from "../Core/useCore";
import { useLayer } from "../layer/useLayer";

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
	const clipContext = useClip();
	const layerContext = useLayer();

	const undo = () => {
		core.undo();
		clipContext.refreshClips();
		layerContext.refreshHiddenLayers();
	};

	const redo = () => {
		core.redo();
		clipContext.refreshClips();
		layerContext.refreshHiddenLayers();
	};

	return <UndoStackContext value={{ undo, redo }}>{children}</UndoStackContext>;
};
