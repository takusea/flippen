import NumberField from "~/shared/ui/NumberField";
import TextField from "~/shared/ui/TextField";
import type { ProjectSettings } from "./type";

type Props = {
	projectSettings: ProjectSettings;
	onProjectSettingsChanged: (projectSettings: ProjectSettings) => void;
};

const ProjectSettingsForm = (props: Props) => {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor="title">プロジェクト名</label>
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
			<label htmlFor="width">横幅</label>
			<NumberField
				id="width"
				value={props.projectSettings.width}
				min={0}
				max={10000}
				onValueChange={(width) =>
					props.onProjectSettingsChanged({ ...props.projectSettings, width })
				}
			/>
			<label htmlFor="height">高さ</label>
			<NumberField
				id="height"
				value={props.projectSettings.height}
				min={0}
				max={10000}
				onValueChange={(height) =>
					props.onProjectSettingsChanged({ ...props.projectSettings, height })
				}
			/>
			<label htmlFor="frameRate">フレームレート</label>
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
