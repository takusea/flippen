import { useRef, useState } from "react";
import { useClip } from "~/features/clip/useClip";

type Selection = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

export const useCanvasSelection = (
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	getPointerPosition: (x: number, y: number) => Point,
) => {
	const clipContext = useClip();
	const selectionDragRef = useRef<Point | null>(null);
	const selectionDraftRef = useRef<Selection | undefined>(undefined);
	const [selectionDraft, setSelectionDraft] = useState<Selection | undefined>(
		undefined,
	);

	const updateSelectionDraft = (selection: Selection | undefined) => {
		selectionDraftRef.current = selection;
		setSelectionDraft(selection);
	};

	const beginSelection = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		if (canvas == null) return;

		const point = getPointerPosition(event.clientX, event.clientY);
		const start = {
			x: Math.max(0, Math.min(canvas.width - 1, Math.floor(point.x))),
			y: Math.max(0, Math.min(canvas.height - 1, Math.floor(point.y))),
		};
		selectionDragRef.current = start;
		updateSelectionDraft({ ...start, width: 0, height: 0 });
		clipContext.setSelection(undefined);
		event.currentTarget.setPointerCapture(event.pointerId);
	};

	const moveSelection = (event: React.PointerEvent<HTMLCanvasElement>) => {
		const canvas = canvasRef.current;
		const start = selectionDragRef.current;
		if (canvas == null || start == null) return false;
		if (!(event.buttons & 1)) return true;

		const point = getPointerPosition(event.clientX, event.clientY);
		const endX = Math.max(0, Math.min(canvas.width - 1, Math.floor(point.x)));
		const endY = Math.max(0, Math.min(canvas.height - 1, Math.floor(point.y)));
		updateSelectionDraft({
			x: Math.min(start.x, endX),
			y: Math.min(start.y, endY),
			width: Math.abs(endX - start.x) + 1,
			height: Math.abs(endY - start.y) + 1,
		});
		return true;
	};

	const finishSelection = (event: React.PointerEvent<HTMLCanvasElement>) => {
		if (selectionDragRef.current == null) return false;

		selectionDragRef.current = null;
		const draft = selectionDraftRef.current;
		if (draft != null && draft.width > 0 && draft.height > 0) {
			clipContext.setSelection(draft);
		}
		updateSelectionDraft(undefined);
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		return true;
	};

	return {
		selection: selectionDraft ?? clipContext.selection,
		beginSelection,
		moveSelection,
		finishSelection,
	};
};
