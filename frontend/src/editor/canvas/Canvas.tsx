import { useEffect, useRef } from "react";
import { useClip } from "~/features/clip/useClip";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { CanvasOverlay } from "./CanvasOverlay";
import { useCanvasNavigation } from "./useCanvasNavigation";
import { useCanvasPointer } from "./useCanvasPointer";
import { useCanvasRender } from "./useCanvasRender";
import { useCanvasView } from "./useCanvasView";

const DrawCanvas = () => {
	const projectContext = useProject();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasRender = useCanvasRender();
	const canvasView = useCanvasView();
	const canvasPointer = useCanvasPointer(
		canvasRef,
		canvasView,
		canvasView.isOnionSkin,
		canvasRender.render,
	);
	const canvasNavigation = useCanvasNavigation(canvasRef, canvasView);
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

		canvasView.setPosition({
			x: (viewport.clientWidth - canvasWidth) / 2,
			y: (viewport.clientHeight - canvasHeight) / 2,
		});
	}, [canvasWidth, canvasHeight, canvasView.setPosition]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: The WASM renderer reads layer state from shared core state.
	useEffect(() => {
		if (canvasRef.current == null) return;
		canvasRender.render(
			canvasRef.current,
			canvasView.isOnionSkin,
			layerContext.selectedLayerId,
		);
	}, [
		clipContext.clips,
		clipContext.transform,
		layerContext.layers,
		layerContext.selectedLayerId,
		playbackContext.currentFrame,
		canvasView.isOnionSkin,
	]);

	if (
		projectContext.settings == null ||
		canvasWidth == null ||
		canvasHeight == null
	) {
		return;
	}

	const canvasTransform = {
		scale: `${canvasView.scale * (canvasView.isFlippedHorizontal ? -1 : 1)} ${canvasView.scale * (canvasView.isFlippedVertical ? -1 : 1)}`,
		translate: `${canvasView.position.x}px ${canvasView.position.y}px`,
		rotate: `${canvasView.rotation}deg`,
	};
	const flipX = canvasView.isFlippedHorizontal ? -1 : 1;
	const flipY = canvasView.isFlippedVertical ? -1 : 1;
	const angle = (canvasView.rotation * Math.PI) / 180;
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const centerX = canvasWidth / 2 + canvasView.position.x;
	const centerY = canvasHeight / 2 + canvasView.position.y;
	const transformedPoint = (x: number, y: number) => {
		const localX = (x - canvasWidth / 2) * canvasView.scale * flipX;
		const localY = (y - canvasHeight / 2) * canvasView.scale * flipY;
		return {
			x: centerX + localX * cos - localY * sin,
			y: centerY + localX * sin + localY * cos,
		};
	};
	const canvasCorners = [
		transformedPoint(0, 0),
		transformedPoint(canvasWidth, 0),
		transformedPoint(canvasWidth, canvasHeight),
		transformedPoint(0, canvasHeight),
	];
	const canvasClipPath = `polygon(${canvasCorners.map(({ x, y }) => `${x}px ${y}px`).join(", ")})`;
	return (
		<div
			className="absolute inset-0"
			onPointerDown={canvasNavigation.handleContainerPointerDown}
			onPointerMove={canvasNavigation.handleContainerPointerMove}
			onPointerUp={canvasNavigation.handleContainerPointerUp}
			onPointerCancel={canvasNavigation.handleContainerPointerCancel}
			onWheel={canvasNavigation.handleWheel}
		>
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 bg-[url(/transparent.png)]"
				style={{
					clipPath: canvasClipPath,
				}}
			/>
			<canvas
				ref={canvasRef}
				id="draw-canvas"
				width={canvasWidth}
				height={canvasHeight}
				className="absolute inset-0 outline outline-zinc-500/40 [image-rendering:pixelated]"
				style={canvasTransform}
				onPointerDown={canvasPointer.handlePointerDown}
				onPointerMove={canvasPointer.handlePointerMove}
				onPointerUp={canvasPointer.handlePointerUp}
				onPointerCancel={canvasPointer.handlePointerUp}
			/>
			<CanvasOverlay
				width={projectContext.settings.width}
				height={projectContext.settings.height}
				transform={canvasTransform}
				selection={canvasPointer.selection}
				isGridVisible={canvasView.isGridVisible}
			/>
		</div>
	);
};

export default DrawCanvas;
