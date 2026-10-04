import { createContext, useContext, useState } from "react";

const CanvasViewContext = createContext<ReturnType<
	typeof useCanvasViewState
> | null>(null);

const useCanvasViewState = () => {
	const scaleMinimum = 0.0625;
	const scaleMaximum = 32;
	const zoomDelta = 1.25;
	const rotateDelta = 5;

	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [rotation, setRotation] = useState<number>(0);
	const [scale, setScale] = useState<number>(1);
	const [isFlippedHorizontal, setIsFlippedHorizontal] = useState(false);
	const [isFlippedVertical, setIsFlippedVertical] = useState(false);
	const [isGridVisible, setIsGridVisible] = useState(false);

	const applyCanvasTransform = (
		x: number,
		y: number,
		centerX: number,
		centerY: number,
	) => {
		const cx = x - centerX;
		const cy = y - centerY;

		const rad = (-rotation * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		const rx = cx * cos - cy * sin;
		const ry = cx * sin + cy * cos;
		const scaleX = scale * (isFlippedHorizontal ? -1 : 1);
		const scaleY = scale * (isFlippedVertical ? -1 : 1);

		return {
			x: rx / scaleX + centerX - position.x,
			y: ry / scaleY + centerY - position.y,
		};
	};

	const translate = (movementX: number, movementY: number) => {
		setPosition((prev) => {
			return {
				x: prev.x + movementX,
				y: prev.y + movementY,
			};
		});
	};

	const zoom = (step: number) => {
		const scale = step > 0 ? zoomDelta : 1 / zoomDelta;
		setScale((prev) =>
			Math.min(Math.max(scaleMinimum, prev * scale), scaleMaximum),
		);
	};

	const zoomAt = (step: number, offsetX: number, offsetY: number) => {
		const zoomFactor = step > 0 ? zoomDelta : 1 / zoomDelta;
		const nextScale = Math.min(
			Math.max(scaleMinimum, scale * zoomFactor),
			scaleMaximum,
		);
		const scaleRatio = nextScale / scale;

		setScale(nextScale);
		setPosition((prev) => ({
			x: prev.x + offsetX * (1 - scaleRatio),
			y: prev.y + offsetY * (1 - scaleRatio),
		}));
	};

	const rotate = (step: number) => {
		setRotation((prev) => prev + rotateDelta * step);
	};

	const fitToView = (
		contentWidth: number,
		contentHeight: number,
		viewportWidth: number,
		viewportHeight: number,
	) => {
		if (
			contentWidth <= 0 ||
			contentHeight <= 0 ||
			viewportWidth <= 0 ||
			viewportHeight <= 0
		) {
			throw new Error("Canvas and viewport dimensions must be positive.");
		}

		const padding = 0.9;
		const fitScale = Math.min(
			(viewportWidth * padding) / contentWidth,
			(viewportHeight * padding) / contentHeight,
		);
		setScale(Math.min(Math.max(scaleMinimum, fitScale), scaleMaximum));
		setPosition({ x: 0, y: 0 });
	};

	return {
		position,
		rotation,
		scale,
		isFlippedHorizontal,
		isFlippedVertical,
		isGridVisible,
		minScale: scaleMinimum,
		maxScale: scaleMaximum,
		setPosition,
		setRotation,
		setScale,
		setIsFlippedHorizontal,
		setIsFlippedVertical,
		setIsGridVisible,
		applyCanvasTransform,
		translate,
		zoom,
		zoomAt,
		rotate,
		fitToView,
	};
};

export const CanvasViewProvider: React.FC<React.PropsWithChildren> = (
	props,
) => {
	const canvasView = useCanvasViewState();

	return (
		<CanvasViewContext.Provider value={canvasView}>
			{props.children}
		</CanvasViewContext.Provider>
	);
};

export const useCanvasView = () => {
	const canvasView = useContext(CanvasViewContext);
	if (canvasView == null) {
		throw new Error("useCanvasView must be used within CanvasViewProvider.");
	}
	return canvasView;
};
