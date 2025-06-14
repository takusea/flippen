import { useEffect, useRef, useState } from "react";

type Props = {
	prevFrame?: () => Uint8ClampedArray;
	currentFrame: () => Uint8ClampedArray;
	nextFrame?: () => Uint8ClampedArray;
	isOnionSkin?: boolean;
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

	const render = () => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (canvas == null || ctx == null) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const putImageData = (frame: Uint8ClampedArray, alpha: number) => {
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

		if (props.isOnionSkin) {
			if (props.prevFrame) {
				putImageData(props.prevFrame(), 0.25);
			}
			if (props.nextFrame) {
				putImageData(props.nextFrame(), 0.25);
			}
		}
		putImageData(props.currentFrame(), 1.0);
	};

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

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawState.isDrawing) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		const nativeEvent = event.nativeEvent as PointerEvent;
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

			const pressure =
				event.pointerType === "mouse" ? (event.pressure ?? 0.5) : 0.5;
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
		/>
	);
};

export default DrawCanvas;
