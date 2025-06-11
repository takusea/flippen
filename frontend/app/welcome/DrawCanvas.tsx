import { useEffect, useRef, useState } from "react";

type Props = {
	currentFrame: () => Uint8ClampedArray;
	onDrawBrush: (x: number, y: number, pressure: number) => void;
	onRender: () => void;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [drawState, setDrawState] = useState<
		| { isDrawing: false }
		| { isDrawing: true; lastX: number; lastY: number; lastPressure: number }
	>({ isDrawing: false });

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		render();
	}, [props.currentFrame]);

	function render() {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (canvas == null || ctx == null) return;

		const imgData = new ImageData(
			props.currentFrame(),
			canvas.width,
			canvas.height,
		);
		ctx.putImageData(imgData, 0, 0);
	}

	const drawSmoothLine = (
		prev: { x: number; y: number; pressure: number },
		current: { x: number; y: number; pressure: number },
	) => {
		const dx = current.x - prev.x;
		const dy = current.y - prev.y;
		const dPressure = current.pressure - prev.pressure;
		const distance = Math.hypot(dx, dy);
		const steps = Math.ceil(distance);
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const x = Math.floor(prev.x + dx * t);
			const y = Math.floor(prev.y + dy * t);
			const pressure = prev.pressure + dPressure * t;
			props.onDrawBrush(x, y, pressure);
		}
	};

	const getPointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.floor(event.clientX - rect.left),
			y: Math.floor(event.clientY - rect.top),
		};
	};

	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const { x, y } = getPointerPosition(e);

		props.onDrawBrush(x, y, e.pressure ?? 0.5);

		setDrawState({
			isDrawing: true,
			lastX: x,
			lastY: y,
			lastPressure: e.pressure ?? 0.5,
		});
		render();
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawState.isDrawing) return;
		const { x, y } = getPointerPosition(e);

		drawSmoothLine(
			{
				x: drawState.lastX,
				y: drawState.lastY,
				pressure: drawState.lastPressure,
			},
			{ x, y, pressure: e.pressure ?? 0.5 },
		);

		setDrawState({
			isDrawing: true,
			lastX: x,
			lastY: y,
			lastPressure: e.pressure ?? 0.5,
		});
		render();
	};

	return (
		<canvas
			ref={canvasRef}
			id="draw-canvas"
			width="1280"
			height="720"
			className="border border-gray-400 absolute inset-0 m-auto"
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={() => setDrawState({ isDrawing: false })}
			onPointerLeave={() => setDrawState({ isDrawing: false })}
		/>
	);
};

export default DrawCanvas;
