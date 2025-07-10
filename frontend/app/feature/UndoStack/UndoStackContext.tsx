import { createContext, use } from "react";
import { CoreContext } from "../Core/CoreContext";
import { ClipContext } from "../Clip/ClipContext";
import { LayerContext } from "../layer/LayerContext";

type UndoStackContextType = {
  undo: () => void;
  redo: () => void;
};

export const UndoStackContext = createContext<UndoStackContextType>({} as any);

export const UndoStackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { core } = use(CoreContext);
  const clipContext = use(ClipContext);
  const layerContext = use(LayerContext);

  const undo = () => {
    if (core == null) return;

    core.undo();
    clipContext.refreshClips();
    layerContext.refreshHiddenLayers();
  };

  const redo = () => {
    if (core == null) return;

    core.redo();
    clipContext.refreshClips();
    layerContext.refreshHiddenLayers();
  };

  return <UndoStackContext value={{ undo, redo }}>{children}</UndoStackContext>;
};
