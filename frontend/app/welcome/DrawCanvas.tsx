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
		| { isDrawing: true; x: number; y: number; pressure: number }
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

	const getPointerPosition = (x: number, y: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return { x: 0, y: 0 };
		const rect = canvas.getBoundingClientRect();
		return {
			x: Math.floor(x - rect.left),
			y: Math.floor(y - rect.top),
		};
	};

	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		const { x, y } = getPointerPosition(e.clientX, e.clientY);

		const pressure = e.pointerType === "mouse" ? (e.pressure ?? 0.5) : 0.5;

		props.onDrawBrush(x, y, pressure);

		setDrawState({
			isDrawing: true,
			x,
			y,
			pressure,
		});
		render();
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawState.isDrawing) return;

		const nativeEvent = e.nativeEvent as PointerEvent;
		const events = nativeEvent.getCoalescedEvents
			? nativeEvent.getCoalescedEvents()
			: [nativeEvent];

		let coalescedDrawState = {
			x: drawState.x,
			y: drawState.y,
			pressure: drawState.pressure,
		};
		for (const event of events) {
			const { x, y } = getPointerPosition(event.clientX, event.clientY);

			const pressure = e.pointerType === "mouse" ? (e.pressure ?? 0.5) : 0.5;
			const currentDrawState = { x, y, pressure };

			drawSmoothLine(coalescedDrawState, currentDrawState);
			coalescedDrawState = currentDrawState;
		}

		setDrawState({ isDrawing: true, ...coalescedDrawState });
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
