import { useState } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import { DialogContent } from "~/shared/ui/Dialog";
import ProjectSettingsForm from "./ProjectSettingsForm";
import { useProject } from "./useProject";

const EditProjectSettingsDialog = () => {
	const { t } = useI18n();
	const project = useProject();

	const [projectSettings, setProjectSettings] = useState(
		project.settings ?? {
			title: t("nav.untitled"),
			width: 1280,
			height: 720,
			frameRate: 8,
		},
	);

	return (
		<DialogContent
			title={t("project.settings")}
			cancelText={t("common.cancel")}
			submitText={t("project.apply")}
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
