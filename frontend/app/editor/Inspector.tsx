import { useClip } from "~/feature/Clip/useClip";
import { useTool } from "~/feature/Tool/useTool";
import ClipInspector from "./ClipInspector";
import ColorInspector from "./ColorInspector";
import ToolInspector from "./ToolInspector";
import { useState } from "react";

const Inspector: React.FC = () => {
	const toolContext = useTool();
	const clipContext = useClip();

	const [properties, setProperties] = useState<{ [key: string]: unknown }>({
		size: 5,
	});

	return (
		<div className="p-2 flex flex-col gap-2">
			{clipContext.selectedClipId && clipContext.transform && (
				<ClipInspector
					name={clipContext.selectedClipId}
					transform={clipContext.transform}
					onTransformChange={(transform) => {
						if (!clipContext.selectedClipId) return;
						clipContext.changeTransform(clipContext.selectedClipId, transform);
					}}
				/>
			)}
			<ToolInspector
				properties={properties}
				onPropertyChange={(key, value) => {
					toolContext.setProperty(key, value);
					setProperties((prev) => {
						return {
							...prev,
							[key]: value,
						};
					});
				}}
			/>
			<ColorInspector
				currentColor={toolContext.color}
				onCurrentColorChange={toolContext.setColor}
			/>
		</div>
	);
};

export default Inspector;
