import { useState } from "react";
import { useClip } from "~/features/clip/useClip";
import { useTool } from "~/features/tool/useTool";
import DrawCanvas from "~/widgets/canvas/Canvas";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import ClipInspector from "~/widgets/inspector/ClipInspector";
import ColorInspector from "~/widgets/inspector/ColorInspector";
import ToolInspector from "~/widgets/inspector/ToolInspector";
import Timeline from "~/widgets/timeline/Timeline";
import Toolbar from "~/widgets/toolbar";

function App() {
	const canvasView = useCanvasView();
	const toolContext = useTool();
	const clipContext = useClip();
	const selectedClip = clipContext.clips.find(
		(clip) => clip.id === clipContext.selectedClipId,
	);

	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return (
		<main className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative w-full h-full grid grid-cols-[auto_1fr_auto] grid-rows-[1fr]">
				<DrawCanvas isOnionSkin={isOnionSkin} canvasView={canvasView} />
				<div className="h-full w-60 p-2 flex flex-col gap-2">
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
				<div className="p-2 mx-auto mt-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
						canvasView={canvasView}
					/>
				</div>
				<div className="h-full w-60 p-2 flex flex-col gap-2">
					{selectedClip && clipContext.transform && (
						<ClipInspector
							name={selectedClip.id}
							clip={selectedClip}
							transform={clipContext.transform}
							onStartChange={(start) =>
								clipContext.moveClip(
									selectedClip.id,
									start,
									selectedClip.layer_index,
								)
							}
							onDurationChange={(duration) =>
								clipContext.changeClipDuration(selectedClip.id, duration)
							}
							onPropertiesChange={(properties) =>
								clipContext.changeClipProperties(selectedClip.id, {
									hidden: selectedClip.hidden,
									alpha_locked: selectedClip.alpha_locked,
									locked: selectedClip.locked,
									opacity: selectedClip.opacity,
									blend_mode: selectedClip.blend_mode,
									...properties,
								})
							}
							onTransformChange={(transform) => {
								clipContext.changeTransform(selectedClip.id, transform);
							}}
						/>
					)}
				</div>
			</div>
			<div className="h-40 grid place-content-stretch col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	);
}

export default App;
