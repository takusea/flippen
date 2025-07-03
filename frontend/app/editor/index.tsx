import { useState } from "react";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import { type HSVAColor, hsvaToRgba } from "~/util/color";
import { run } from "~/wasm/wasm-loader";
import Button from "~/base/Button";
import TextField from "~/base/TextField";
import DrawCanvas from "~/feature/Canvas";
import Inspector from "./Inspector";
import Timeline from "~/feature/Timeline";
import Toolbar from "~/feature/Toolbar";
import { useTimeline } from "./useTimeline";

export function Editor() {
	const [core, setCore] = useState<FlippenCore>();
	const timeline = useTimeline(core);
	const [currentTool, setCurrentTool] = useState<string>("move");
	const [currentColor, setCurrentColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	const handleDrawBrush = (x: number, y: number, pressure: number) => {
		if (core == null || timeline.selectedClip == null) return;

		const rgbaColor = hsvaToRgba(currentColor);
		core.apply_tool(
			timeline.selectedClip,
			timeline.currentIndex,
			currentTool,
			x,
			y,
			new Uint8Array([rgbaColor.r, rgbaColor.g, rgbaColor.b, rgbaColor.a]),
			pressure,
		);
	};

	const handleImport = (core: FlippenCore) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".flip";
		input.addEventListener("change", () => {
			const file = input.files?.[0];
			if (!file) {
				throw new Error("file is null");
			}
			const reader = new FileReader();
			reader.addEventListener("load", (event) => {
				const result = event.target?.result;
				if (!(result instanceof ArrayBuffer)) {
					throw new Error("FileReader result is not an ArrayBuffer");
				}
				core.import(new Uint8Array(result));
				timeline.setClips(core.get_clips());
			});
			reader.readAsArrayBuffer(file);
		});
		input.click();
		input.remove();
	};

	const handleExport = (core: FlippenCore) => {
		const data = core.export();
		const blob = new Blob([data], {
			type: "application/msgpack",
		});
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "export.flip";
		link.click();
		link.remove();
	};

	return core !== undefined ? (
		<main className="w-full h-full bg-[url(/transparent.png)] grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="flex fixed items-center gap-1 p-2 z-10">
				デバッグ
				<Button
					label="import"
					onClick={() => core != null && handleImport(core)}
				/>
				<Button
					label="export"
					onClick={() => core != null && handleExport(core)}
				/>
				<span>
					<input
						type="number"
						min={0}
						max={timeline.totalFrames - 1}
						value={timeline.currentIndex}
						onChange={(event) =>
							timeline.setCurrentIndex(
								Number.parseInt(event.currentTarget.value),
							)
						}
					/>
					/ {timeline.totalFrames}
				</span>
				<input
					type="number"
					min={0}
					max={120}
					value={timeline.fps}
					onChange={(event) =>
						timeline.setFps(Number.parseInt(event.currentTarget.value))
					}
				/>
			</div>
			<div className="relative">
				<DrawCanvas
					prevFrame={
						timeline.currentIndex !== 0
							? () => core.render_frame(timeline.currentIndex - 1)
							: undefined
					}
					currentFrame={() => core.render_frame(timeline.currentIndex)}
					nextFrame={
						timeline.currentIndex !== timeline.totalFrames - 1
							? () => core.render_frame(timeline.currentIndex + 1)
							: undefined
					}
					isOnionSkin={!timeline.isPlaying && isOnionSkin}
					onDrawBrush={handleDrawBrush}
					onRender={() => {}}
					onDrawBegin={() => {
						if (timeline.selectedClip == null) return;
						core.begin_draw(timeline.selectedClip, timeline.currentIndex);
					}}
				/>
				<div className="absolute bottom-4 w-fit left-0 right-0 mx-auto max-w-full overflow-x-auto">
					<Toolbar
						isPlaying={timeline.isPlaying}
						isLoop={timeline.isLoop}
						currentTool={currentTool}
						onCurrentToolChange={setCurrentTool}
						onUndo={() => {
							core?.undo();
							timeline.setClips(core.get_clips());
						}}
						onRedo={() => {
							core?.redo();
							timeline.setClips(core.get_clips());
						}}
						onCopy={() => {}}
						onPaste={() => {}}
						onPlay={() =>
							timeline.isPlaying ? timeline.pause() : timeline.play()
						}
						onStop={() => {
							timeline.stop();
							timeline.setCurrentIndex(0);
						}}
						onIsLoop={() => timeline.setIsLoop((prev) => !prev)}
						onRewind={timeline.firstFrame}
						onPrev={timeline.prevFrame}
						onNext={timeline.nextFrame}
						onForward={timeline.lastFrame}
						isOnionSkin={isOnionSkin}
						onIsOnionSkin={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
				<div className="absolute p-4 h-full right-0 border-l-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl">
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
			<div className="col-span-2 border-t-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline
					clips={timeline.clips}
					currentFrame={timeline.currentIndex}
					selectedClip={timeline.selectedClip}
					onFrameChange={timeline.setCurrentIndex}
					onAddClip={timeline.addClip}
					onMoveClip={timeline.moveClip}
					onSelectClip={timeline.setSelectedClip}
					onClipDurationChange={timeline.changeClipDuration}
				/>
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
			<Button
				label="新規作成"
				variant="primary"
				onClick={() => run(1280, 720).then(setCore)}
			/>
		</main>
	);
}
