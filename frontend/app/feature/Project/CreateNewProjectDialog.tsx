import { useState } from "react";
import { DialogContent } from "~/base/Dialog";
import NumberField from "~/base/NumberField";
import { useProject } from "../Project/useProject";

const CreateNewProjectDialog = () => {
	const project = useProject();

	const [width, setWidth] = useState(1280);
	const [height, setHeight] = useState(720);
	const [frameRate, setFrameRate] = useState(8);

	return (
		<DialogContent
			title="プロジェクト新規作成"
			cancelText="キャンセル"
			submitText="作成"
			onSubmit={() =>
				project.createNew({ width, height, frame_rate: frameRate })
			}
		>
			<div className="flex flex-col gap-2">
				<label htmlFor="width">横幅</label>
				<NumberField
					id="width"
					value={width}
					max={10000}
					onValueChange={setWidth}
				/>
				<label htmlFor="height">高さ</label>
				<NumberField
					id="height"
					value={height}
					max={10000}
					onValueChange={setHeight}
				/>
				<label htmlFor="frameRate">フレームレート</label>
				<NumberField
					id="frameRate"
					value={frameRate}
					onValueChange={setFrameRate}
				/>
			</div>
		</DialogContent>
	);
};

export default CreateNewProjectDialog;
