import { useClip } from "~/features/clip/useClip";
import { useTool } from "~/features/tool/useTool";
import ClipInspector from "./ClipInspector";
import ColorInspector from "./ColorInspector";
import ToolInspector from "./ToolInspector";

const Inspector: React.FC = () => {
	const toolContext = useTool();
	const clipContext = useClip();

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
				properties={toolContext.properties}
				onPropertyChange={(key, value) => {
					toolContext.setProperty(key, value);
				}}
			/>
			<ColorInspector
				currentColor={toolContext.color}
				colorHistory={toolContext.colorHistory}
				onCurrentColorChange={toolContext.setColor}
			/>
		</div>
	);
};

export default Inspector;
