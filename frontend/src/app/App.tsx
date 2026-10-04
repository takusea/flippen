import { useState } from "react";
import { useClip } from "~/features/clip/useClip";
import CreateNewProjectDialog from "~/features/project/CreateNewProjectDialog";
import { useProject } from "~/features/project/useProject";
import { useTool } from "~/features/tool/useTool";
import { Dialog } from "~/shared/ui/Dialog";
import DrawCanvas from "~/widgets/canvas/Canvas";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import ClipInspector from "~/widgets/inspector/ClipInspector";
import ColorInspector from "~/widgets/inspector/ColorInspector";
import Inspector from "~/widgets/inspector/Inspector";
import ToolInspector from "~/widgets/inspector/ToolInspector";
import Timeline from "~/widgets/timeline/Timeline";
import Toolbar from "~/widgets/toolbar";

function App() {
	const project = useProject();
	const canvasView = useCanvasView();
	const toolContext = useTool();
	const clipContext = useClip();

	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return (
		<main className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<Dialog open={project.settings == null}>
				<CreateNewProjectDialog />
			</Dialog>
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
					{clipContext.selectedClipId && clipContext.transform && (
						<ClipInspector
							name={clipContext.selectedClipId}
							transform={clipContext.transform}
							onTransformChange={(transform) => {
								if (!clipContext.selectedClipId) return;
								clipContext.changeTransform(
									clipContext.selectedClipId,
									transform,
								);
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
