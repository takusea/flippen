import { useDocumentTitle } from "usehooks-ts";
import { useCore } from "~/core/useCore";
import { useCoreSnapshot } from "~/core/useCoreSnapshot";
import type { ProjectSettings } from "./type";

export const useProject = () => {
	const core = useCore();
	const { projectSettings } = useCoreSnapshot();

	const create = (settings: ProjectSettings) => {
		return core.createProject(settings);
	};
	``;
	const setSettings = (newSettings: ProjectSettings) => {
		return core.setProjectSettings(newSettings);
	};

	useDocumentTitle(
		projectSettings ? `${projectSettings.title} - Flippen` : "Flippen",
	);

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

	return {
		create,
		settings: projectSettings,
		setSettings,
		open,
		save,
	};
};
