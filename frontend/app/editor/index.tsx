import { useState } from "react";
import DrawCanvas from "~/feature/Canvas";
import Timeline from "~/feature/Timeline";
import Toolbar from "~/feature/Toolbar";
import Inspector from "./Inspector";
import CreateNewProjectDialog from "~/feature/Project/CreateNewProjectDialog";
import { Dialog } from "~/base/Dialog";
import { useProject } from "~/feature/Project/useProject";

export function Editor() {
	const project = useProject();

	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return (
		<main className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<Dialog open={project.settings == null}>
				<CreateNewProjectDialog />
			</Dialog>
			<div className="relative">
				<DrawCanvas isOnionSkin={isOnionSkin} />
				<div className="absolute bottom-4 w-fit left-0 right-0 mx-auto max-w-full overflow-x-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
				<div className="absolute right-0 overflow-y-scroll h-full w-[240px] ">
					<Inspector />
				</div>
			</div>
			<div className="h-[160px] grid place-content-stretch col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	);
}
