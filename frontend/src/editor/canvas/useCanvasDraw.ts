import { useCallback, useRef, useState } from "react";
import { useCore } from "~/core/useCore";
import { useTool } from "~/features/tool/useTool";
import { hsvaToRgba } from "~/lib/color";
import type { DrawState } from "./type";

export const useCanvasDraw = () => {
	const core = useCore();
	const toolContext = useTool();

	const [drawState, setDrawState] = useState<
		{ isDrawing: false } | { isDrawing: true; state: DrawState }
	>({ isDrawing: false });
	const drawStateRef = useRef<typeof drawState>(drawState);
	const drawingClipIdRef = useRef<string | undefined>(undefined);
	const pendingPointsRef = useRef<DrawState[]>([]);
	const drawFrameRef = useRef<number | null>(null);

	const rgbaColor = hsvaToRgba(toolContext.color);

	const updateDrawState = (newState: typeof drawState) => {
		drawStateRef.current = newState;
		setDrawState(newState);
	};

	const beginDraw = (state: DrawState, clipId: string) => {
		drawingClipIdRef.current = clipId;
		updateDrawState({ isDrawing: true, state });
	};

	const flushPoints = useCallback(() => {
		if (drawFrameRef.current != null) {
			cancelAnimationFrame(drawFrameRef.current);
			drawFrameRef.current = null;
		}
		const points = pendingPointsRef.current;
		pendingPointsRef.current = [];
		const clipId = drawingClipIdRef.current;
		if (clipId == null || points.length === 0) return;
		const color = new Uint8Array([
			rgbaColor.r,
			rgbaColor.g,
			rgbaColor.b,
			rgbaColor.a,
		]);
		void core.applyToolPoints(clipId, toolContext.tool, points, color);
	}, [
		core,
		rgbaColor.a,
		rgbaColor.b,
		rgbaColor.g,
		rgbaColor.r,
		toolContext.tool,
	]);

	const finishDraw = () => {
		flushPoints();
		drawingClipIdRef.current = undefined;
		updateDrawState({ isDrawing: false });
	};

	const draw = (state: DrawState) => {
		if (drawingClipIdRef.current == null) return;

		const clipId = drawingClipIdRef.current;
		const tool = toolContext.tool;
		void core.applyToolPoints(
			clipId,
			tool,
			[state],
			new Uint8Array([rgbaColor.r, rgbaColor.g, rgbaColor.b, rgbaColor.a]),
		);
	};

	const interpolateDrawState = (prev: DrawState, current: DrawState) => {
		const dx = current.x - prev.x;
		const dy = current.y - prev.y;
		const dPressure = current.pressure - prev.pressure;
		const distance = Math.hypot(dx, dy);
		const steps = Math.ceil(distance);
		if (steps === 0) return [current];

		const drawStates = [];
		for (let i = 1; i <= steps; i++) {
			const t = i / steps;
			const x = prev.x + dx * t;
			const y = prev.y + dy * t;
			const pressure = prev.pressure + dPressure * t;
			drawStates.push({ x, y, pressure });
		}
		return drawStates;
	};

	const drawMultiple = (states: DrawState[]) => {
		if (!drawStateRef.current.isDrawing || states.length === 0) return;

		const baseState = drawStateRef.current.state;
		let previous = baseState;
		for (const current of states) {
			pendingPointsRef.current.push(...interpolateDrawState(previous, current));
			previous = current;
		}

		if (drawFrameRef.current == null) {
			drawFrameRef.current = requestAnimationFrame(flushPoints);
		}
		drawStateRef.current = {
			isDrawing: true,
			state: states[states.length - 1],
		};
	};

	return {
		beginDraw,
		finishDraw,
		draw,
		drawMultiple,
		drawState,
	};
};
