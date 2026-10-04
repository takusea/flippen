import { useState } from "react";
import { DialogContent } from "~/shared/ui/Dialog";
import ProjectSettingsForm from "./ProjectSettingsForm";
import { useProject } from "./useProject";

const EditProjectSettingsDialog = () => {
	const project = useProject();

	const [projectSettings, setProjectSettings] = useState(
		project.settings ?? {
			title: "Untitled",
			width: 1280,
			height: 720,
			frameRate: 8,
		},
	);

	return (
		<DialogContent
			title="プロジェクト設定"
			cancelText="キャンセル"
			submitText="変更"
			onSubmit={() => project.updateSettings(projectSettings)}
		>
			<ProjectSettingsForm
				projectSettings={projectSettings}
				onProjectSettingsChanged={setProjectSettings}
			/>
		</DialogContent>
	);
};

export default EditProjectSettingsDialog;
