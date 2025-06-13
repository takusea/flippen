import { useEffect, useState } from "react";
import type { FlippenWasm } from "~/pkg/flippen_wasm";
import { runWasm } from "~/wasm/wasm-loader";
import DrawCanvas from "./DrawCanvas";
import Inspector from "./Inspector";
import Timeline from "./Timeline";
import Toolbar from "./Toolbar";
import { useFrameList } from "./useFrameList";

export function Welcome() {
	const [app, setApp] = useState<FlippenWasm>();
	const frameList = useFrameList(app);
	const [currentTool, setCurrentTool] = useState<string>("move");
	const [currentColor, setCurrentColor] = useState<{
		r: number;
		g: number;
		b: number;
		a: number;
	}>({ r: 0, g: 0, b: 0, a: 255 });
	const [isOnionSkin, setIsOnionSkin] = useState<boolean>(false);

	useEffect(() => {
		app?.set_current_color(
			currentColor.r,
			currentColor.g,
			currentColor.b,
			currentColor.a,
		);
	}, [app, currentColor]);

	useEffect(() => {
		runWasm(1280, 720).then(setApp);
	}, []);

	return (
		<main className="relative w-full h-full grid grid-cols-[1fr_auto] grid-rows-[1fr_auto]">
			<div className="relative overflow-hidden">
				{app && (
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
						isOnionSkin={isOnionSkin}
						onDrawBrush={(x, y, pressure) =>
							app.apply_tool(currentTool, x, y, pressure)
						}
						onRender={() => {}}
					/>
				)}
				<div className="absolute bottom-8 w-fit left-0 right-0 m-auto">
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
					app?.set_brush_size(size);
				}}
			/>
			<div className="col-span-2 border-t border-gray-200 z-10">
				<div className="flex gap-2 items-center">
					<span>
						{frameList.currentIndex} / {frameList.totalFrames}
					</span>
					<input
						type="number"
						value={frameList.fps}
						onChange={(event) =>
							frameList.setFps(Number.parseInt(event.currentTarget.value))
						}
					/>
				</div>
				{app && (
					<Timeline
						totalFrames={frameList.totalFrames}
						currentIndex={frameList.currentIndex}
						getFrameData={(index) => app.get_data(index)}
						frameWidth={1280}
						frameHeight={720}
						onSelectFrame={frameList.setCurrentIndex}
						onAddFrame={() => frameList.insertFrame(frameList.currentIndex)}
					/>
				)}
			</div>
		</main>
	);
}
