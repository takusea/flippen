import { use, useState } from "react";
import Button from "~/base/Button";
import TextField from "~/base/TextField";
import DrawCanvas from "~/feature/Canvas";
import Timeline from "~/feature/Timeline";
import Toolbar from "~/feature/Toolbar";
import { hsvaToRgba } from "~/util/color";
import Inspector from "./Inspector";
import { useCore } from "~/feature/Core/useCore";
import { useClip } from "~/feature/Clip/useClip";
import { useTool } from "~/feature/Tool/useTool";

export function Editor() {
	const core = useCore();
	const clipContext = useClip();
	const toolContext = useTool();
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	const handleDrawBrush = (x: number, y: number, pressure: number) => {
		if (core == null || clipContext.selectedClipId == null) return;

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

	return core !== null ? (
		<main className="w-full h-full bg-[url(/transparent.png)] grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative">
				<DrawCanvas isOnionSkin={isOnionSkin} onDrawBrush={handleDrawBrush} />
				<div className="absolute bottom-4 w-fit left-0 right-0 mx-auto max-w-full overflow-x-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
				<div className="absolute p-4 h-full w-[240px] right-0 border-l-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
					<Inspector
						onCurrentSizeChange={(size: number) => {
							core?.set_tool_property(toolContext.tool, "size", size);
						}}
					/>
				</div>
			</div>
			<div className="h-[160px] grid place-content-stretch col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	) : (
		<main className="flex flex-col gap-2 justify-center w-fit h-full m-auto">
			<h2 className="text-xl font-bold">プロジェクト新規作成</h2>
			<label htmlFor="name">プロジェクト名</label>
			<TextField id="name" value={"project"} />
			<label htmlFor="width">幅</label>
			<TextField id="width" value={1280} />
			<label htmlFor="height">高さ</label>
			<TextField id="height" value={720} />
			<Button label="新規作成" variant="primary" onClick={() => {}} />
		</main>
	);
}
