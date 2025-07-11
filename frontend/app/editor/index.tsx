import { useState } from "react";
import DrawCanvas from "~/feature/Canvas";
import { useClip } from "~/feature/Clip/useClip";
import { useCore } from "~/feature/Core/useCore";
import Timeline from "~/feature/Timeline";
import { useTool } from "~/feature/Tool/useTool";
import Toolbar from "~/feature/Toolbar";
import { hsvaToRgba } from "~/util/color";
import Inspector from "./Inspector";

export function Editor() {
	const core = useCore();
	const clipContext = useClip();
	const toolContext = useTool();
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	const handleDrawBrush = (x: number, y: number, pressure: number) => {
		if (clipContext.selectedClipId == null) return;

		const rgbaColor = hsvaToRgba(toolContext.color);
		core.apply_tool(
			clipContext.selectedClipId,
			toolContext.tool,
			x,
			y,
			new Uint8Array([rgbaColor.r, rgbaColor.g, rgbaColor.b, rgbaColor.a]),
			pressure,
		);
	};

	return (
		<main className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative">
				<DrawCanvas isOnionSkin={isOnionSkin} onDrawBrush={handleDrawBrush} />
				<div className="absolute bottom-4 w-fit left-0 right-0 mx-auto max-w-full overflow-x-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
				<div className="absolute p-4 h-full w-[240px] right-0 overflow-y-scroll border-l-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
					<Inspector />
				</div>
			</div>
			<div className="h-[160px] grid place-content-stretch col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	);
}
