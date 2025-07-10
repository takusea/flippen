import { createContext, use } from "react";
import { CoreContext } from "../Core/CoreContext";
import { ClipContext } from "../Clip/ClipContext";
import { LayerContext } from "../layer/LayerContext";

type ProjectContextType = {
  open: () => void;
  save: () => void;
};

export const ProjectContext = createContext<ProjectContextType>({} as any);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { core } = use(CoreContext);
  const clipContext = use(ClipContext);
  const layerContext = use(LayerContext);

  const open = () => {
    if (core == null) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".flip";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        throw new Error("file is null");
      }
      const reader = new FileReader();
      reader.addEventListener("load", (event) => {
        const result = event.target?.result;
        if (!(result instanceof ArrayBuffer)) {
          throw new Error("FileReader result is not an ArrayBuffer");
        }
        core.import(new Uint8Array(result));
        clipContext.refreshClips();
        layerContext.refreshHiddenLayers();
      });
      reader.readAsArrayBuffer(file);
    });
    input.click();
    input.remove();
  };

  const save = () => {
    if (core == null) return;
    const data = core.export();
    const blob = new Blob([data], {
      type: "application/msgpack",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "export.flip";
    link.click();
    link.remove();
  };

  return <ProjectContext value={{ open, save }}>{children}</ProjectContext>;
};
