import { useRef, useState } from "react";
import { hsvaToRgba } from "~/util/color";
import { useCore } from "../Core/useCore";
import { useTool } from "../Tool/useTool";
import type { DrawState } from "./type";

export const useCanvasDraw = () => {
	const core = useCore();
	const toolContext = useTool();

	const [drawState, setDrawState] = useState<
		{ isDrawing: false } | { isDrawing: true; state: DrawState }
	>({ isDrawing: false });
	const drawStateRef = useRef<typeof drawState>(drawState);
	const drawingClipIdRef = useRef<string | undefined>(undefined);

	const rgbaColor = hsvaToRgba(toolContext.color);

	const updateDrawState = (newState: typeof drawState) => {
		drawStateRef.current = newState;
		setDrawState(newState);
	};

	const beginDraw = (state: DrawState, clipId: string) => {
		drawingClipIdRef.current = clipId;
		updateDrawState({ isDrawing: true, state });
	};

	const finishDraw = () => {
		drawingClipIdRef.current = undefined;
		updateDrawState({ isDrawing: false });
	};

	const draw = (state: DrawState) => {
		if (drawingClipIdRef.current == null) return;

		core.apply_tool(
			drawingClipIdRef.current,
			toolContext.tool,
			state.x,
			state.y,
			new Uint8Array([rgbaColor.r, rgbaColor.g, rgbaColor.b, rgbaColor.a]),
			state.pressure,
		);
	};

	const interpolateDrawState = (prev: DrawState, current: DrawState) => {
		const dx = current.x - prev.x;
		const dy = current.y - prev.y;
		const dPressure = current.pressure - prev.pressure;
		const distance = Math.hypot(dx, dy);
		const steps = Math.ceil(distance);

		const drawStates = [];
		for (let i = 0; i <= steps; i++) {
			const t = i / steps;
			const x = Math.floor(prev.x + dx * t);
			const y = Math.floor(prev.y + dy * t);
			const pressure = prev.pressure + dPressure * t;
			drawStates.push({ x, y, pressure });
		}
		return drawStates;
	};

	const drawMultiple = (states: DrawState[]) => {
		if (!drawStateRef.current.isDrawing) return;

		const baseState = drawStateRef.current.state;
		states
			.reduce(
				(acc, curr) => {
					acc.push([acc[acc.length - 1][1], curr]);
					return acc;
				},
				[[baseState, baseState]],
			)
			.flatMap(([prev, current]) => interpolateDrawState(prev, current))
			.forEach((state) => draw(state));

		updateDrawState({ isDrawing: true, state: states[states.length - 1] });
	};

	return {
		beginDraw,
		finishDraw,
		draw,
		drawMultiple,
		drawState,
	};
};
