import { useRef } from "react";
import { usePlayback } from "~/features/playback/usePlayback";
import { useCore } from "~/infrastructure/core/useCore";
import type { LayerId } from "~/shared/lib/layer";

export const useCanvasRender = () => {
	const playbackContext = usePlayback();
	const core = useCore();
	const frameRequestRef = useRef<number | null>(null);
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
				if (requestId !== requestIdRef.current) return;
				await core.renderFrameToCanvas(
					playbackContext.currentFrame,
					canvas,
					_isOnionSkinEnabled && !playbackContext.isPlaying ? layerId : null,
				);
			})();
		});
	};

	return { render };
};
