import { useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import { ProjectContext } from "./ProjectContextValue";
import type { ProjectSettings } from "./type";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [settings, setSettings] = useState<ProjectSettings>();

	const createNew = (settings: ProjectSettings) => {
		setSettings(settings);
		core.createProject(settings);
	};

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
				core.importProject(new Uint8Array(result));
			});
			reader.readAsArrayBuffer(file);
		});
		input.click();
		input.remove();
	};

	const save = () => {
		const data = core.exportProject();
		const blob = new Blob([data.buffer as ArrayBuffer], {
			type: "application/msgpack",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "export.flip";
		link.click();
		link.remove();
	};

	return (
		<ProjectContext value={{ settings, open, save, createNew }}>
			{children}
		</ProjectContext>
	);
};
