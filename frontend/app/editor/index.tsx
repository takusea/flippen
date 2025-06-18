import { useState } from "react";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import { runWasm } from "~/wasm/wasm-loader";
import DrawCanvas from "./DrawCanvas";
import Inspector from "./Inspector";
import Timeline from "./Timeline";
import Toolbar from "./Toolbar";
import TextField from "../base/TextField";
import Button from "../base/Button";
import { useFrameList } from "./useFrameList";
import { hsvaToRgba, type HSVAColor } from "~/util/color";

export function Editor() {
	const [core, setCore] = useState<FlippenCore>();
	const frameList = useFrameList(core);
	const [currentTool, setCurrentTool] = useState<string>("move");
	const [currentColor, setCurrentColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return core !== undefined ? (
		<main className="relative w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative overflow-hidden">
				{JSON.stringify(core)}
				<DrawCanvas
					prevFrame={
						frameList.currentIndex !== 0
							? () => core.get_data(frameList.currentIndex - 1)
							: undefined
					}
					currentFrame={() => core.get_data(frameList.currentIndex)}
					nextFrame={
						frameList.currentIndex !== frameList.totalFrames - 1
							? () => core.get_data(frameList.currentIndex + 1)
							: undefined
					}
					isOnionSkin={!frameList.isPlaying && isOnionSkin}
					onDrawBrush={(x, y, pressure) => {
						const rgbaColor = hsvaToRgba(currentColor);
						core.apply_tool(
							currentTool,
							x,
							y,
							new Uint8Array([
								rgbaColor.r,
								rgbaColor.g,
								rgbaColor.b,
								rgbaColor.a,
							]),
							pressure,
						);
					}}
					onRender={() => {}}
					onDrawBegin={() => core.begin_draw()}
				/>
				<div className="absolute bottom-8 w-fit left-0 right-0 m-auto max-w-full overflow-x-auto">
					<Toolbar
						isPlaying={frameList.isPlaying}
						isLoop={frameList.isLoop}
						currentTool={currentTool}
						onCurrentToolChange={setCurrentTool}
						onUndo={() => core?.undo()}
						onRedo={() => core?.redo()}
						onCopy={() => {}}
						onPaste={() => {}}
						onPlay={() =>
							frameList.isPlaying ? frameList.pause() : frameList.play()
						}
						onStop={() => {
							frameList.stop();
							frameList.setCurrentIndex(0);
						}}
						onIsLoop={() => frameList.setIsLoop((prev) => !prev)}
						onRewind={frameList.firstFrame}
						onPrev={frameList.prevFrame}
						onNext={frameList.nextFrame}
						onForward={frameList.lastFrame}
						isOnionSkin={isOnionSkin}
						onIsOnionSkin={() => setIsOnionSkin((prev) => !prev)}
					/>
				</div>
			</div>
			<Inspector
				currentTool={currentTool}
				currentColor={currentColor}
				onCurrentColorChange={setCurrentColor}
				onCurrentSizeChange={(size: number) => {
					core?.set_tool_property(currentTool, "size", size);
				}}
			/>
			<div className="col-span-2 border-t border-gray-200 z-10">
				<div className="flex gap-2 items-center">
					<span>
						<input
							type="number"
							min={0}
							max={frameList.totalFrames - 1}
							value={frameList.currentIndex}
							onChange={(event) =>
								frameList.setCurrentIndex(
									Number.parseInt(event.currentTarget.value),
								)
							}
						/>
						/ {frameList.totalFrames}
					</span>
					<input
						type="number"
						min={0}
						max={120}
						value={frameList.fps}
						onChange={(event) =>
							frameList.setFps(Number.parseInt(event.currentTarget.value))
						}
					/>
				</div>
				<Timeline
					totalFrames={frameList.totalFrames}
					currentIndex={frameList.currentIndex}
					getFrameData={(index) => core.get_data(index)}
					frameWidth={1280}
					frameHeight={720}
					onSelectFrame={frameList.setCurrentIndex}
					onInsertFrame={frameList.insertFrame}
					onDeleteFrame={frameList.deleteFrame}
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
				onClick={() => runWasm(1280, 720).then(setCore)}
			/>
		</main>
	);
}
