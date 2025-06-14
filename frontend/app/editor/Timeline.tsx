import { useEffect, useRef } from "react";

type Props = {
	totalFrames: number;
	currentIndex: number;
	frameWidth: number;
	frameHeight: number;
	getFrameData: (index: number) => Uint8ClampedArray;
	onSelectFrame: (index: number) => void;
	onInsertFrame: (index: number) => void;
	onDeleteFrame: (index: number) => void;
};

const Timeline: React.FC<Props> = (props) => {
	const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

	useEffect(() => {
		for (let i = 0; i < props.totalFrames; i++) {
			const canvas = canvasRefs.current[i];
			const ctx = canvas?.getContext("2d");
			if (canvas == null || ctx == null) continue;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const imageData = new ImageData(
				props.getFrameData(i),
				props.frameWidth,
				props.frameHeight,
			);

			const offscreen = document.createElement("canvas");
			offscreen.width = props.frameWidth;
			offscreen.height = props.frameHeight;
			const offCtx = offscreen.getContext("2d");
			if (!offCtx) continue;

			offCtx.putImageData(imageData, 0, 0);
			ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);
		}
	}, [
		props.totalFrames,
		props.frameWidth,
		props.frameHeight,
		props.getFrameData,
	]);

	return (
		<div className="p-2 flex overflow-x-scroll bg-white/90">
			{Array.from({ length: props.totalFrames }, (_, i) => {
				const isSelected = i === props.currentIndex;
				return (
					<div key={i} className="contents">
						<button
							type="button"
							onClick={() => props.onSelectFrame(i)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									props.onSelectFrame(i);
								} else if (e.key === "Delete") {
									props.onDeleteFrame(i);
								} else if (e.key === "Insert") {
									props.onInsertFrame(i);
								}
							}}
						>
							<canvas
								ref={(el) => {
									canvasRefs.current[i] = el;
								}}
								width={256}
								height={256}
								className={`cursor-pointer rounded-lg w-32 h-32 ${isSelected ? "border-2 border-teal-500" : "border border-gray-400"}`}
								aria-label={`Select frame ${i + 1}`}
							/>
						</button>
						<button
							type="button"
							className="w-2 h-32 rounded hover:bg-black/10 shrink-0"
							tabIndex={-1}
							onClick={() => props.onInsertFrame(i)}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default Timeline;
