import type { useCanvasView } from "./useCanvasView";

export const useCanvasNavigation = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	canvasView: ReturnType<typeof useCanvasView>,
) => {
	const handleWheel = (event: React.WheelEvent) => {
		const step = event.deltaY < 0 ? 1 : -1;
		if (event.shiftKey) {
			canvasView.rotate(step);
			return;
		}

		const canvas = canvasRef.current;
		if (canvas == null) return;
		const rect = canvas.getBoundingClientRect();
		canvasView.zoomAt(
			step,
			event.clientX - (rect.left + rect.width / 2),
			event.clientY - (rect.top + rect.height / 2),
		);
	};

	const handleContainerPointerMove = (event: React.PointerEvent) => {
		if (!(event.buttons & 1 && event.shiftKey) && !(event.buttons & 4)) return;
		canvasView.translate(event.movementX, event.movementY);
	};

	return { handleWheel, handleContainerPointerMove };
};
