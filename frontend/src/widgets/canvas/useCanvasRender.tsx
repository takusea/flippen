import { useRef } from "react";
import type { LayerId } from "~/shared/lib/layer";
import { useCore } from "~/infrastructure/core/useCore";
import { usePlayback } from "~/features/playback/usePlayback";

export const useCanvasRender = () => {
	const playbackContext = usePlayback();
	const core = useCore();
	const frameRequestRef = useRef<number | null>(null);
	const onionCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const requestIdRef = useRef(0);
	const render = (
		canvas: HTMLCanvasElement,
		_isOnionSkinEnabled: boolean,
		layerId: LayerId | null,
	) => {
		const requestId = ++requestIdRef.current;
		if (frameRequestRef.current != null) {
			cancelAnimationFrame(frameRequestRef.current);
		}
		frameRequestRef.current = requestAnimationFrame(() => {
			frameRequestRef.current = null;
			void (async () => {
				const onionCanvas = onionCanvasRef.current;
				const onionContext = onionCanvas?.getContext("2d");
				onionContext?.clearRect(0, 0, onionCanvas!.width, onionCanvas!.height);
				if (requestId !== requestIdRef.current) return;
				await core.renderFrameToCanvas(
					playbackContext.currentFrame,
					canvas,
					_isOnionSkinEnabled && !playbackContext.isPlaying ? layerId : null,
				);
			})();
		});
	};

	return { render, onionCanvasRef };
};
