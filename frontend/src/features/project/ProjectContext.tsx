import { useCore } from "~/infrastructure/core/useCore";
import { useCoreSnapshot } from "~/infrastructure/core/useCoreSnapshot";
import { ProjectContext } from "./ProjectContextValue";
import type { ProjectSettings } from "./type";

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const { projectSettings } = useCoreSnapshot();
	const settings = projectSettings ?? null;

	const createNew = (settings: ProjectSettings) => {
		return core.createProject(settings);
	};

	const updateSettings = (newSettings: ProjectSettings) => {
		return core.setProjectSettings(newSettings);
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
				void core.importProject(new Uint8Array(result));
			});
			reader.readAsArrayBuffer(file);
		});
		input.click();
		input.remove();
	};

	const save = async () => {
		const data = await core.exportProject();
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
		<ProjectContext value={{ settings, open, save, createNew, updateSettings }}>
			{children}
		</ProjectContext>
	);
};
