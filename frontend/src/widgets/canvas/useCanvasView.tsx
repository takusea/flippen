import { useState } from "react";

export const useCanvasView = () => {
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

	const applyCanvasTransform = (
		x: number,
		y: number,
		centerX: number,
		centerY: number,
	) => {
		const cx = x - centerX;
		const cy = y - centerY;

		const sx = cx / scale;
		const sy = cy / scale;

		const rad = (-rotation * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		const rx = sx * cos - sy * sin;
		const ry = sx * sin + sy * cos;

		return {
			x: rx + centerX - position.x,
			y: ry + centerY - position.y,
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

	const rotate = (step: number) => {
		setRotation((prev) => prev + rotateDelta * step);
	};

	return {
		position,
		rotation,
		scale,
		setPosition,
		setRotation,
		setScale,
		applyCanvasTransform,
		translate,
		zoom,
		rotate,
	};
};
