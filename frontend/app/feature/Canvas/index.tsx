import { useEffect, useRef, useState } from "react";
import { useClip } from "../Clip/useClip";
import { useCore } from "../Core/useCore";
import { useLayer } from "../layer/useLayer";
import { usePlayback } from "../Playback/usePlayback";
import { useCanvasDraw } from "./useCanvasDraw";

type Props = {
	isOnionSkin?: boolean;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const core = useCore();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const canvasDraw = useCanvasDraw();

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [scale, setScale] = useState<number>(1);
	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [angle, setAngle] = useState<number>(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		render();
	}, [
		clipContext.clips,
		clipContext.transform,
		layerContext.hiddenLayers,
		playbackContext.currentFrame,
	]);

	const putImageData = (
		canvas: HTMLCanvasElement,
		frame: Uint8ClampedArray,
		alpha: number,
	) => {
		const ctx = canvas?.getContext("2d");
		if (ctx == null) return;

		const imageData = new ImageData(frame, canvas.width, canvas.height);
		const tempCanvas = document.createElement("canvas");
		tempCanvas.width = imageData.width;
		tempCanvas.height = imageData.height;

		const tempCtx = tempCanvas.getContext("2d");
		if (tempCtx == null) return;

		tempCtx.putImageData(imageData, 0, 0);

		ctx.globalAlpha = alpha;
		ctx.drawImage(tempCanvas, 0, 0);
		ctx.globalAlpha = 1.0;
	};

	const render = () => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");

		if (canvas == null || ctx == null) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (props.isOnionSkin && !playbackContext.isPlaying) {
			const isFirstFrame = playbackContext.currentFrame === 0;
			if (!isFirstFrame) {
				const prevFrame = playbackContext.renderFrame(
					playbackContext.currentFrame - 1,
				);
				if (prevFrame != null) {
					putImageData(canvas, prevFrame, 0.25);
				}
			}

			const isLastFrame =
				playbackContext.currentFrame === playbackContext.maxFrameCount - 1;
			if (!isLastFrame) {
				const nextFrame = playbackContext.renderFrame(
					playbackContext.currentFrame + 1,
				);
				if (nextFrame != null) {
					putImageData(canvas, nextFrame, 0.25);
				}
			}
		}

		const currentFrame = playbackContext.renderFrame(
			playbackContext.currentFrame,
		);
		if (currentFrame != null) {
			putImageData(canvas, currentFrame, 1.0);
		}
	};

	const getPointerPosition = (x: number, y: number) => {
		const canvas = canvasRef.current;
		if (canvas == null) {
			throw new Error("canvas is null");
		}

		if (canvas.parentElement == null) {
			throw new Error("canvas.parentElement is null");
		}

		const parentRect = canvas.parentElement.getBoundingClientRect();
		const rect = canvas.getBoundingClientRect();

		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const cx = x - centerX;
		const cy = y - centerY;

		const sx = cx / scale;
		const sy = cy / scale;

		const rad = (-angle * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const rx = sx * cos - sy * sin;
		const ry = sx * sin + sy * cos;

		return {
			x: rx + centerX - position.x - parentRect.left,
			y: ry + centerY - position.y - parentRect.top,
		};
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (clipContext.selectedClipId != null) {
			core.begin_draw(clipContext.selectedClipId);
		}

		const { x, y } = getPointerPosition(event.clientX, event.clientY);

		canvasDraw.beginDraw({
			x,
			y,
			pressure: event.pressure,
		});
		render();
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (
			!canvasDraw.drawState.isDrawing ||
			!(event.buttons & 1) ||
			event.shiftKey
		)
			return;

		event.currentTarget.setPointerCapture(event.pointerId);

		const drawStates = event.nativeEvent.getCoalescedEvents().map((event) => {
			return {
				...getPointerPosition(event.clientX, event.clientY),
				pressure: event.pressure,
			};
		});
		canvasDraw.drawMultiple(drawStates);
		render();
	};

	const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
		if (event.shiftKey) {
			const delta = 5;
			const angle = event.deltaY < 0 ? delta : -delta;
			setAngle((prev) => prev + angle);
		} else {
			const scaleMinimum = 0.0625;
			const scaleMaximum = 32;

			const delta = 1.25;
			const scale = event.deltaY < 0 ? delta : 1 / delta;
			setScale((prev) =>
				Math.min(Math.max(scaleMinimum, prev * scale), scaleMaximum),
			);
		}
	};

	const handleContainerPointerMove = (
		event: React.PointerEvent<HTMLDivElement>,
	) => {
		if ((event.buttons & 1 && event.shiftKey) || event.buttons & 4) {
			setPosition((prev) => {
				return {
					x: prev.x + event.movementX,
					y: prev.y + event.movementY,
				};
			});
			return;
		}
	};

	return (
		<div
			className="absolute inset-0 bg-[url(/transparent.png)]"
			onPointerMove={handleContainerPointerMove}
			onWheel={handleWheel}
		>
			<canvas
				ref={canvasRef}
				id="draw-canvas"
				width="1280"
				height="720"
				className="absolute inset-0 border border-zinc-500 [image-rendering:pixelated]"
				style={{
					scale: scale,
					translate: `${position.x}px ${position.y}px`,
					rotate: `${angle}deg`,
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={canvasDraw.finishDraw}
			/>
		</div>
	);
};

export default DrawCanvas;
