import { useState } from "react";
import type { FlippenWasm } from "~/pkg/flippen_wasm";
import { runWasm } from "~/wasm/wasm-loader";
import DrawCanvas from "./DrawCanvas";
import Inspector from "./Inspector";
import Timeline from "./Timeline";
import Toolbar from "./Toolbar";
import { useFrameList } from "./useFrameList";
import { hsvaToRgba, type HSVAColor } from "~/util/color";

export function Editor() {
	const [app, setApp] = useState<FlippenWasm>();
	const frameList = useFrameList(app);
	const [currentTool, setCurrentTool] = useState<string>("move");
	const [currentColor, setCurrentColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	return app !== undefined ? (
		<main className="relative w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative overflow-hidden">
				<DrawCanvas
					prevFrame={
						frameList.currentIndex !== 0
							? () => app.get_data(frameList.currentIndex - 1)
							: undefined
					}
					currentFrame={() => app.get_data(frameList.currentIndex)}
					nextFrame={
						frameList.currentIndex !== frameList.totalFrames - 1
							? () => app.get_data(frameList.currentIndex + 1)
							: undefined
					}
					isOnionSkin={!frameList.isPlaying && isOnionSkin}
					onDrawBrush={(x, y, pressure) => {
						const rgbaColor = hsvaToRgba(currentColor);
						app.apply_tool(
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
				/>
				<div className="absolute bottom-8 w-fit left-0 right-0 m-auto max-w-full overflow-x-auto">
					<Toolbar
						isPlaying={frameList.isPlaying}
						isLoop={frameList.isLoop}
						currentTool={currentTool}
						onCurrentToolChange={setCurrentTool}
						onUndo={() => app?.undo()}
						onRedo={() => app?.redo()}
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
					app?.set_tool_property(currentTool, "size", size);
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
					getFrameData={(index) => app.get_data(index)}
					frameWidth={1280}
					frameHeight={720}
					onSelectFrame={frameList.setCurrentIndex}
					onInsertFrame={frameList.insertFrame}
					onDeleteFrame={frameList.deleteFrame}
				/>
			</div>
		</main>
	) : (
		<main>
			<input type="number" value={1280} />
			<input type="number" value={720} />
			<button type="button" onClick={() => runWasm(1280, 720).then(setApp)}>
				新規作成
			</button>
		</main>
	);
}
