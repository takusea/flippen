import { useEffect, useRef } from "react";
import { useClip } from "~/features/clip/useClip";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { CanvasOverlay } from "./CanvasOverlay";
import { useCanvasNavigation } from "./useCanvasNavigation";
import { useCanvasPointer } from "./useCanvasPointer";
import { useCanvasRender } from "./useCanvasRender";
import type { useCanvasView } from "./useCanvasView";

type Props = {
	isOnionSkin?: boolean;
	canvasView: ReturnType<typeof useCanvasView>;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const projectContext = useProject();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const layerContext = useLayer();
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const canvasRender = useCanvasRender();
	const isOnionSkin = props.isOnionSkin ?? false;
	const canvasPointer = useCanvasPointer(
		canvasRef,
		props.canvasView,
		isOnionSkin,
		canvasRender.render,
	);
	const canvasNavigation = useCanvasNavigation(canvasRef, props.canvasView);
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

	// biome-ignore lint/correctness/useExhaustiveDependencies: The WASM renderer reads layer state from shared core state.
	useEffect(() => {
		if (canvasRef.current == null) return;
		canvasRender.render(canvasRef.current, isOnionSkin);
	}, [
		clipContext.clips,
		clipContext.transform,
		layerContext.layers,
		playbackContext.currentFrame,
	]);

	if (projectContext.settings == null) {
		return;
	}

	const canvasTransform = {
		scale: `${props.canvasView.scale * (props.canvasView.isFlippedHorizontal ? -1 : 1)} ${props.canvasView.scale * (props.canvasView.isFlippedVertical ? -1 : 1)}`,
		translate: `${props.canvasView.position.x}px ${props.canvasView.position.y}px`,
		rotate: `${props.canvasView.rotation}deg`,
	};

	return (
		<div
			className="absolute inset-0 bg-[url(/transparent.png)]"
			onPointerMove={canvasNavigation.handleContainerPointerMove}
			onWheel={canvasNavigation.handleWheel}
		>
			<canvas
				ref={canvasRef}
				id="draw-canvas"
				width={canvasWidth}
				height={canvasHeight}
				className="absolute inset-0 border border-zinc-500 [image-rendering:pixelated]"
				style={canvasTransform}
				onPointerDown={canvasPointer.handlePointerDown}
				onPointerMove={canvasPointer.handlePointerMove}
				onPointerUp={canvasPointer.handlePointerUp}
			/>
			<CanvasOverlay
				width={projectContext.settings.width}
				height={projectContext.settings.height}
				transform={canvasTransform}
				selection={canvasPointer.selection}
				isGridVisible={props.canvasView.isGridVisible}
			/>
		</div>
	);
};

export default DrawCanvas;
