import { useEffect, useRef } from "react";
import { useClip } from "../Clip/useClip";
import { useCore } from "../Core/useCore";
import { useLayer } from "../layer/useLayer";
import { usePlayback } from "../Playback/usePlayback";
import { useCanvasDraw } from "./useCanvasDraw";
import { useCanvasRender } from "./useCanvasRender";
import { useCanvasView } from "./useCanvasView";
import { useProject } from "../Project/useProject";
import { useTool } from "../Tool/useTool";
import { rgbaToHsva } from "~/util/color";

type Props = {
	isOnionSkin?: boolean;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const core = useCore();
	const projectContext = useProject();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const toolContext = useTool();
	const canvasDraw = useCanvasDraw();
	const canvasView = useCanvasView();
	const canvasRender = useCanvasRender();

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (canvasRef.current == null) {
			return;
		}

		canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
	}, [
		clipContext.clips,
		clipContext.transform,
		layerContext.hiddenLayers,
		playbackContext.currentFrame,
	]);

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

		const transformed = canvasView.applyCanvasTransform(x, y, centerX, centerY);

		return {
			x: transformed.x - parentRect.left,
			y: transformed.y - parentRect.top,
		};
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (canvasRef.current == null) return;
		if (clipContext.selectedClipId == null) return;
		if (!(event.buttons & 1) || event.shiftKey) return;

		if (toolContext.color !== toolContext.colorHistory[0]) {
			toolContext.pushColorHistory(toolContext.color);
		}

		core.begin_draw(clipContext.selectedClipId);

		const { x, y } = getPointerPosition(event.clientX, event.clientY);

		canvasDraw.beginDraw({
			x,
			y,
			pressure: event.pressure,
		});
		canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (canvasRef.current == null) {
			return;
		}

		if (event.buttons & 2) {
			const { x, y } = getPointerPosition(event.clientX, event.clientY);

			const ctx = canvasRef.current.getContext("2d");
			if (ctx == null) return;

			const pixel = ctx.getImageData(x, y, 1, 1);
			const data = pixel.data;

			toolContext.setColor(
				rgbaToHsva({
					r: data[0],
					g: data[1],
					b: data[2],
					a: data[3],
				}),
			);
		}

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
		canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
	};

	const handleWheel = (event: React.WheelEvent) => {
		const step = event.deltaY < 0 ? 1 : -1;
		if (event.shiftKey) {
			canvasView.rotate(step);
		} else {
			canvasView.zoom(step);
		}
	};

	const handleContainerPointerMove = (event: React.PointerEvent) => {
		if (!(event.buttons & 1 && event.shiftKey) && !(event.buttons & 4)) return;

		canvasView.translate(event.movementX, event.movementY);
	};

	if (projectContext.settings == null) {
		return;
	}

	return (
		<div
			className="absolute inset-0 bg-[url(/transparent.png)]"
			onPointerMove={handleContainerPointerMove}
			onWheel={handleWheel}
		>
			<canvas
				ref={canvasRef}
				id="draw-canvas"
				width={projectContext.settings?.width}
				height={projectContext.settings?.height}
				className="absolute inset-0 border border-zinc-500 [image-rendering:pixelated]"
				style={{
					scale: canvasView.scale,
					translate: `${canvasView.position.x}px ${canvasView.position.y}px`,
					rotate: `${canvasView.rotation}deg`,
				}}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={canvasDraw.finishDraw}
			/>
		</div>
	);
};

export default DrawCanvas;
