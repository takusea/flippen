import { useEffect, useRef, useState } from "react";

type Props = {
	prevFrame?: () => Uint8ClampedArray;
	currentFrame: () => Uint8ClampedArray;
	nextFrame?: () => Uint8ClampedArray;
	isOnionSkin?: boolean;
	onDrawBrush: (x: number, y: number, pressure: number) => void;
	onRender: () => void;
	onDrawBegin: () => void;
};

const DrawCanvas: React.FC<Props> = (props) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const [drawState, setDrawState] = useState<
		| { isDrawing: false }
		| { isDrawing: true; x: number; y: number; pressure: number }
	>({ isDrawing: false });
	const [scale, setScale] = useState<number>(1);
	const [position, setPosition] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});
	const [angle, setAngle] = useState<number>(0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		render();
	}, [props.currentFrame]);

	const putImageData = (
		canvas: HTMLCanvasElement,
		frame: Uint8ClampedArray,
		alpha: number,
	) => {
		const ctx = canvas?.getContext("2d");
		if (ctx == null) return;

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

	const render = () => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");

		if (canvas == null || ctx == null) return;
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (props.isOnionSkin) {
			if (props.prevFrame) {
				putImageData(canvas, props.prevFrame(), 0.25);
			}
			if (props.nextFrame) {
				putImageData(canvas, props.nextFrame(), 0.25);
			}
		}
		putImageData(canvas, props.currentFrame(), 1.0);
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

		const cx = x - centerX;
		const cy = y - centerY;

		const sx = cx / scale;
		const sy = cy / scale;

		const rad = (-angle * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);
		const rx = sx * cos - sy * sin;
		const ry = sx * sin + sy * cos;

		return {
			x: rx + centerX - position.x - parentRect.left,
			y: ry + centerY - position.y - parentRect.top,
		};
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
		props.onDrawBegin();

		const { x, y } = getPointerPosition(event.clientX, event.clientY);

		setDrawState({
			isDrawing: true,
			x,
			y,
			pressure: event.pressure,
		});
		render();
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (!drawState.isDrawing) return;

		if (event.shiftKey || event.buttons & 4) {
			setPosition((prev) => {
				return {
					x: prev.x + event.movementX,
					y: prev.y + event.movementY,
				};
			});
			return;
		}

		if (!(event.buttons & 1)) return;

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

			const currentDrawState = { x, y, pressure: event.pressure };

			drawSmoothLine(coalescedDrawState, currentDrawState);
			coalescedDrawState = currentDrawState;
		}

		setDrawState({ isDrawing: true, ...coalescedDrawState });
		render();
	};

	const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
		if (event.shiftKey) {
			const delta = 5;
			const angle = event.deltaY < 0 ? delta : -delta;
			setAngle((prev) => prev + angle);
		} else {
			const scaleMinimum = 0.0625;
			const scaleMaximum = 32;

			const delta = 1.25;
			const scale = event.deltaY < 0 ? delta : 1 / delta;
			setScale((prev) =>
				Math.min(Math.max(scaleMinimum, prev * scale), scaleMaximum),
			);
		}
	};

	return (
		<canvas
			ref={canvasRef}
			id="draw-canvas"
			width="1280"
			height="720"
			className="absolute inset-0 border border-zinc-500 [image-rendering:pixelated]"
			style={{
				scale: scale,
				translate: `${position.x}px ${position.y}px`,
				rotate: `${angle}deg`,
			}}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={() => setDrawState({ isDrawing: false })}
			onWheel={handleWheel}
		/>
	);
};

export default DrawCanvas;
