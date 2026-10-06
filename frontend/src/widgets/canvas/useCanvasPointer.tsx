import { useRef } from "react";
import { useClip } from "~/features/clip/useClip";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useTool } from "~/features/tool/useTool";
import { useCore } from "~/infrastructure/core/useCore";
import { rgbaToHsva } from "~/shared/lib/color";
import type { Transform } from "~/shared/lib/transform";
import { useCanvasDraw } from "./useCanvasDraw";
import { useCanvasSelection } from "./useCanvasSelection";
import type { useCanvasView } from "./useCanvasView";

type CanvasView = ReturnType<typeof useCanvasView>;

export const useCanvasPointer = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	canvasView: CanvasView,
	isOnionSkin: boolean,
	render: (canvas: HTMLCanvasElement, isOnionSkin: boolean) => void,
) => {
	const core = useCore();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const toolContext = useTool();
	const canvasDraw = useCanvasDraw();
	const moveDragRef = useRef<{
		startX: number;
		startY: number;
		initialTransform: Transform;
	} | null>(null);

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
		const transformed = canvasView.applyCanvasTransform(
			x,
			y,
			rect.left + rect.width / 2,
			rect.top + rect.height / 2,
		);

		return {
			x: transformed.x - parentRect.left,
			y: transformed.y - parentRect.top,
		};
	};

	const selection = useCanvasSelection(canvasRef, getPointerPosition);

	const getPointerPressure = (
		event: Pick<PointerEvent, "pointerType" | "pressure">,
	) =>
		event.pointerType === "mouse" || event.pressure <= 0 ? 1 : event.pressure;

	const handlePointerDown = async (
		event: React.PointerEvent<HTMLCanvasElement>,
	) => {
		if (canvasRef.current == null) return;
		if (!(event.buttons & 1) || event.shiftKey) return;

		if (toolContext.tool === "select") {
			selection.beginSelection(event);
			return;
		}

		if (toolContext.tool === "move") {
			if (clipContext.selectedClipId == null || clipContext.transform == null) {
				return;
			}
			const { x, y } = getPointerPosition(event.clientX, event.clientY);
			moveDragRef.current = {
				startX: x,
				startY: y,
				initialTransform: { ...clipContext.transform },
			};
			event.currentTarget.setPointerCapture(event.pointerId);
			return;
		}

		if (toolContext.color !== toolContext.colorHistory[0]) {
			toolContext.pushColorHistory(toolContext.color);
		}

		const clipId = await clipContext.ensureClipAt(
			playbackContext.currentFrame,
			layerContext.selectedLayer,
		);
		if (clipId == null) return;
		await core.beginDraw(clipId);

		const { x, y } = getPointerPosition(event.clientX, event.clientY);
		const drawState = {
			x,
			y,
			pressure: getPointerPressure(event.nativeEvent),
		};
		canvasDraw.beginDraw(drawState, clipId);
		if (toolContext.tool === "fill") {
			canvasDraw.draw(drawState);
		}
		render(canvasRef.current, isOnionSkin);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (canvas == null) return;
		if (selection.moveSelection(event)) return;

		if (toolContext.tool === "move") {
			if (moveDragRef.current == null) return;
			if (clipContext.selectedClipId == null || clipContext.transform == null) {
				moveDragRef.current = null;
				return;
			}
			if (!(event.buttons & 1)) return;
			const { x, y } = getPointerPosition(event.clientX, event.clientY);
			const dx = Math.round(x - moveDragRef.current.startX);
			const dy = Math.round(y - moveDragRef.current.startY);
			clipContext.changeTransform(clipContext.selectedClipId, {
				...moveDragRef.current.initialTransform,
				position: [
					Math.round(moveDragRef.current.initialTransform.position[0] + dx),
					Math.round(moveDragRef.current.initialTransform.position[1] + dy),
				],
			});
			return;
		}

		if (event.buttons & 2) {
			const { x, y } = getPointerPosition(event.clientX, event.clientY);
			const ctx = canvas.getContext("2d");
			if (ctx == null) return;

			const data = ctx.getImageData(x, y, 1, 1).data;
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
		) {
			return;
		}

		event.currentTarget.setPointerCapture(event.pointerId);
		const drawStates = event.nativeEvent
			.getCoalescedEvents()
			.map((pointerEvent) => ({
				...getPointerPosition(pointerEvent.clientX, pointerEvent.clientY),
				pressure: getPointerPressure(pointerEvent),
			}));
		canvasDraw.drawMultiple(drawStates);
		render(canvas, isOnionSkin);
	};

	const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (selection.finishSelection(event)) return;

		if (toolContext.tool === "move") {
			moveDragRef.current = null;
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			return;
		}
		canvasDraw.finishDraw();
		void core.endDraw();
	};

	return {
		selection: selection.selection,
		handlePointerDown,
		handlePointerMove,
		handlePointerUp,
	};
};
