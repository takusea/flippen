import { useI18n } from "~/features/i18n/useI18n";
import NumberField from "~/shared/ui/NumberField";
import TextField from "~/shared/ui/TextField";
import { MAX_FRAME_INDEX, type ProjectSettings } from "./type";

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
			<label htmlFor="startFrame">{t("project.startFrame")}</label>
			<NumberField
				id="startFrame"
				value={props.projectSettings.startFrame}
				min={0}
				max={props.projectSettings.endFrame}
				onValueChange={(startFrame) =>
					props.onProjectSettingsChanged({
						...props.projectSettings,
						startFrame,
					})
				}
			/>
			<label htmlFor="endFrame">{t("project.endFrame")}</label>
			<NumberField
				id="endFrame"
				value={props.projectSettings.endFrame}
				min={props.projectSettings.startFrame}
				max={MAX_FRAME_INDEX}
				onValueChange={(endFrame) =>
					props.onProjectSettingsChanged({
						...props.projectSettings,
						endFrame,
					})
				}
			/>
		</div>
	);
};

export default ProjectSettingsForm;
