import { useEffect, useRef, useState } from "react";
import { useClip } from "~/features/clip/useClip";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { useTool } from "~/features/tool/useTool";
import { useCore } from "~/infrastructure/core/useCore";
import { rgbaToHsva } from "~/shared/lib/color";
import type { Transform } from "~/shared/lib/transform";
import { useCanvasDraw } from "./useCanvasDraw";
import { useCanvasRender } from "./useCanvasRender";
import type { useCanvasView } from "./useCanvasView";

type Props = {
	isOnionSkin?: boolean;
	canvasView: ReturnType<typeof useCanvasView>;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const core = useCore();
	const projectContext = useProject();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const toolContext = useTool();
	const canvasDraw = useCanvasDraw();
	const canvasRender = useCanvasRender();

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const moveDragRef = useRef<{
		pointerId: number;
		startX: number;
		startY: number;
		initialTransform: Transform;
	} | null>(null);
	const selectionDragRef = useRef<{ x: number; y: number } | null>(null);
	const [selectionDraft, setSelectionDraft] = useState<
		{ x: number; y: number; width: number; height: number } | undefined
	>();
	const canvasWidth = projectContext.settings?.width;
	const canvasHeight = projectContext.settings?.height;

	useEffect(() => {
		const canvas = canvasRef.current;
		const viewport = canvas?.parentElement;
		if (
			canvas == null ||
			viewport == null ||
			canvasWidth == null ||
			canvasHeight == null
		) {
			return;
		}

		props.canvasView.setPosition({
			x: (viewport.clientWidth - canvasWidth) / 2,
			y: (viewport.clientHeight - canvasHeight) / 2,
		});
	}, [canvasWidth, canvasHeight, props.canvasView.setPosition]);

	useEffect(() => {
		if (canvasRef.current == null) {
			return;
		}

		void canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
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

		const transformed = props.canvasView.applyCanvasTransform(
			x,
			y,
			centerX,
			centerY,
		);

		return {
			x: transformed.x - parentRect.left,
			y: transformed.y - parentRect.top,
		};
	};

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
			const { x, y } = getPointerPosition(event.clientX, event.clientY);
			const start = {
				x: Math.max(0, Math.min(canvasRef.current.width - 1, Math.floor(x))),
				y: Math.max(0, Math.min(canvasRef.current.height - 1, Math.floor(y))),
			};
			selectionDragRef.current = start;
			setSelectionDraft({ ...start, width: 0, height: 0 });
			clipContext.setSelection(undefined);
			event.currentTarget.setPointerCapture(event.pointerId);
			return;
		}

		if (toolContext.tool === "move") {
			if (clipContext.selectedClipId == null || clipContext.transform == null) {
				return;
			}
			const { x, y } = getPointerPosition(event.clientX, event.clientY);
			moveDragRef.current = {
				pointerId: event.pointerId,
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

		canvasDraw.beginDraw(
			{
				x,
				y,
				pressure: getPointerPressure(event.nativeEvent),
			},
			clipId,
		);
		void canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (canvasRef.current == null) {
			return;
		}

		if (selectionDragRef.current != null) {
			if (!(event.buttons & 1)) return;
			const start = selectionDragRef.current;
			const point = getPointerPosition(event.clientX, event.clientY);
			const endX = Math.max(
				0,
				Math.min(canvasRef.current.width - 1, Math.floor(point.x)),
			);
			const endY = Math.max(
				0,
				Math.min(canvasRef.current.height - 1, Math.floor(point.y)),
			);
			setSelectionDraft({
				x: Math.min(start.x, endX),
				y: Math.min(start.y, endY),
				width: Math.abs(endX - start.x) + 1,
				height: Math.abs(endY - start.y) + 1,
			});
			return;
		}

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
				pressure: getPointerPressure(event),
			};
		});
		canvasDraw.drawMultiple(drawStates);
		void canvasRender.render(canvasRef.current, props.isOnionSkin ?? false);
	};

	const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (selectionDragRef.current != null) {
			selectionDragRef.current = null;
			if (
				selectionDraft != null &&
				selectionDraft.width > 0 &&
				selectionDraft.height > 0
			) {
				clipContext.setSelection(selectionDraft);
			}
			setSelectionDraft(undefined);
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			return;
		}

		if (toolContext.tool === "move") {
			if (moveDragRef.current != null) {
				moveDragRef.current = null;
			}
			if (event.currentTarget.hasPointerCapture(event.pointerId)) {
				event.currentTarget.releasePointerCapture(event.pointerId);
			}
			return;
		}
		canvasDraw.finishDraw();
		void core.endDraw();
	};

	const handleWheel = (event: React.WheelEvent) => {
		const step = event.deltaY < 0 ? 1 : -1;
		if (event.shiftKey) {
			props.canvasView.rotate(step);
		} else {
			const canvas = canvasRef.current;
			if (canvas == null) return;
			const rect = canvas.getBoundingClientRect();
			props.canvasView.zoomAt(
				step,
				event.clientX - (rect.left + rect.width / 2),
				event.clientY - (rect.top + rect.height / 2),
			);
		}
	};

	const handleContainerPointerMove = (event: React.PointerEvent) => {
		if (!(event.buttons & 1 && event.shiftKey) && !(event.buttons & 4)) return;

		props.canvasView.translate(event.movementX, event.movementY);
	};

	if (projectContext.settings == null) {
		return;
	}

	const canvasTransform = {
		scale: `${props.canvasView.scale * (props.canvasView.isFlippedHorizontal ? -1 : 1)} ${props.canvasView.scale * (props.canvasView.isFlippedVertical ? -1 : 1)}`,
		translate: `${props.canvasView.position.x}px ${props.canvasView.position.y}px`,
		rotate: `${props.canvasView.rotation}deg`,
	};
	const displayedSelection = selectionDraft ?? clipContext.selection;

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
				style={canvasTransform}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
			/>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute left-0 top-0"
				style={{
					width: canvasWidth,
					height: canvasHeight,
					...canvasTransform,
					transformOrigin: "center",
				}}
			>
				{displayedSelection != null && (
					<div
						className="absolute border border-dashed border-teal-400 bg-teal-400/10"
						style={{
							left: displayedSelection.x,
							top: displayedSelection.y,
							width: displayedSelection.width,
							height: displayedSelection.height,
						}}
					/>
				)}
			</div>
			{props.canvasView.isGridVisible && (
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						width: projectContext.settings.width,
						height: projectContext.settings.height,
						...canvasTransform,
						backgroundImage:
							"linear-gradient(to right, rgb(0 0 0 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.25) 1px, transparent 1px)",
						backgroundSize: "16px 16px",
					}}
				/>
			)}
		</div>
	);
};

export default DrawCanvas;
