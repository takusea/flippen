import { createContext } from "react";
import { useClip } from "../Clip/useClip";
import { useCore } from "../Core/useCore";
import { useLayer } from "../layer/useLayer";

type ProjectContextType = {
	open: () => void;
	save: () => void;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const clipContext = useClip();
	const layerContext = useLayer();

	const open = () => {
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
