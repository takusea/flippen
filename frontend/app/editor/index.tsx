import { use, useState } from "react";
import Button from "~/base/Button";
import TextField from "~/base/TextField";
import DrawCanvas from "~/feature/Canvas";
import Timeline from "~/feature/Timeline";
import Toolbar from "~/feature/Toolbar";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import { hsvaToRgba, type HSVAColor } from "~/util/color";
import Inspector from "./Inspector";
import { CoreContext } from "~/feature/Core/CoreContext";
import { ClipContext } from "~/feature/Clip/ClipContext";

export function Editor() {
	const { core } = use(CoreContext);
	const clipContext = use(ClipContext);

	const [currentTool, setCurrentTool] = useState<string>("move");
	const [currentColor, setCurrentColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	const handleDrawBrush = (x: number, y: number, pressure: number) => {
		if (core == null || clipContext.selectedClipId == null) return;

		const rgbaColor = hsvaToRgba(currentColor);
		core.apply_tool(
			clipContext.selectedClipId,
			currentTool,
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
						currentTool={currentTool}
						isOnionSkin={isOnionSkin}
						onCurrentToolChange={setCurrentTool}
						onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
				<div className="absolute p-4 h-full w-[240px] right-0 border-l-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
					<Inspector
						currentTool={currentTool}
						currentColor={currentColor}
						onCurrentColorChange={setCurrentColor}
						onCurrentSizeChange={(size: number) => {
							core?.set_tool_property(currentTool, "size", size);
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
