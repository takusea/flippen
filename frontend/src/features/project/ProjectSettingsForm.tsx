import { useI18n } from "~/features/i18n/useI18n";
import NumberField from "~/shared/ui/NumberField";
import TextField from "~/shared/ui/TextField";
import type { ProjectSettings } from "./type";

type Props = {
	projectSettings: ProjectSettings;
	onProjectSettingsChanged: (projectSettings: ProjectSettings) => void;
};

const ProjectSettingsForm = (props: Props) => {
	const { t } = useI18n();

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="title">{t("project.name")}</label>
			<TextField
				id="title"
				value={props.projectSettings.title}
				onChange={(event) =>
					props.onProjectSettingsChanged({
						...props.projectSettings,
						title: event.target.value,
					})
				}
			/>
			<label htmlFor="width">{t("project.width")}</label>
			<NumberField
				id="width"
				value={props.projectSettings.width}
				min={0}
				max={10000}
				onValueChange={(width) =>
					props.onProjectSettingsChanged({ ...props.projectSettings, width })
				}
			/>
			<label htmlFor="height">{t("project.height")}</label>
			<NumberField
				id="height"
				value={props.projectSettings.height}
				min={0}
				max={10000}
				onValueChange={(height) =>
					props.onProjectSettingsChanged({ ...props.projectSettings, height })
				}
			/>
			<label htmlFor="frameRate">{t("project.frameRate")}</label>
			<NumberField
				id="frameRate"
				value={props.projectSettings.frameRate}
				min={0}
				max={1000}
				onValueChange={(frameRate) =>
					props.onProjectSettingsChanged({
						...props.projectSettings,
						frameRate,
					})
				}
			/>
		</div>
	);
};

export default ProjectSettingsForm;
