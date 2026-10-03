import { useState } from "react";
import CreateNewProjectDialog from "~/features/project/CreateNewProjectDialog";
import { useProject } from "~/features/project/useProject";
import { Dialog } from "~/shared/ui/Dialog";
import DrawCanvas from "~/widgets/canvas/Canvas";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import Inspector from "~/widgets/inspector/Inspector";
import Timeline from "~/widgets/timeline/Timeline";
import Toolbar from "~/widgets/toolbar";

function App() {
	const project = useProject();
	const canvasView = useCanvasView();

	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return (
		<main className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<Dialog open={project.settings == null}>
				<CreateNewProjectDialog />
			</Dialog>
			<div className="relative">
				<DrawCanvas isOnionSkin={isOnionSkin} canvasView={canvasView} />
				<div className="absolute bottom-2 w-fit left-0 right-0 mx-auto max-w-full overflow-x-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
						canvasView={canvasView}
					/>
				</div>
				<div className="absolute right-0 overflow-y-scroll h-full w-60 ">
					<Inspector />
				</div>
			</div>
			<div className="h-40 grid place-content-stretch col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	);
}

export default App;
