import { useState } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import { DialogContent } from "~/shared/ui/Dialog";
import ProjectSettingsForm from "./ProjectSettingsForm";
import { DEFAULT_END_FRAME, DEFAULT_START_FRAME } from "./type";
import { useProject } from "./useProject";

const CreateNewProjectDialog = () => {
	const { t } = useI18n();
	const project = useProject();

	const [projectSettings, setProjectSettings] = useState(
		project.settings ?? {
			title: t("nav.untitled"),
			width: 1280,
			height: 720,
			frameRate: 8,
			startFrame: DEFAULT_START_FRAME,
			endFrame: DEFAULT_END_FRAME,
		},
	);

	return (
		<DialogContent
			title={t("project.create")}
			cancelText={t("common.cancel")}
			submitText={t("project.createAction")}
			onSubmit={() => project.createNew(projectSettings)}
		>
			<ProjectSettingsForm
				projectSettings={projectSettings}
				onProjectSettingsChanged={setProjectSettings}
			/>
		</DialogContent>
	);
};

export default CreateNewProjectDialog;
