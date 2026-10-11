import { useRef } from "react";
import { usePlayback } from "~/features/playback/usePlayback";

export const useCanvasRender = () => {
	const playbackContext = usePlayback();
	const frameRequestRef = useRef<number | null>(null);
	const onionCanvasRef = useRef<HTMLCanvasElement | null>(null);
	const requestIdRef = useRef(0);
	const render = (canvas: HTMLCanvasElement, _isOnionSkinEnabled: boolean) => {
		const requestId = ++requestIdRef.current;
		if (frameRequestRef.current != null) {
			cancelAnimationFrame(frameRequestRef.current);
		}
		frameRequestRef.current = requestAnimationFrame(() => {
			frameRequestRef.current = null;
			void (async () => {
				const onionCanvas = onionCanvasRef.current;
				const onionContext = onionCanvas?.getContext("2d");
				if (onionCanvas != null && onionContext != null) {
					onionContext.clearRect(0, 0, onionCanvas.width, onionCanvas.height);
					if (_isOnionSkinEnabled && !playbackContext.isPlaying) {
						const frames = [
							playbackContext.currentFrame > playbackContext.startFrame
								? playbackContext.currentFrame - 1
								: undefined,
							playbackContext.currentFrame < playbackContext.endFrame
								? playbackContext.currentFrame + 1
								: undefined,
						];
						for (const frame of frames) {
							if (frame == null) continue;
							const pixels = await playbackContext.renderFrame(frame);
							if (requestId !== requestIdRef.current) return;
							if (pixels == null) continue;
							const image = new ImageData(
								pixels as Uint8ClampedArray<ArrayBuffer>,
								canvas.width,
								canvas.height,
							);
							const frameCanvas = document.createElement("canvas");
							frameCanvas.width = canvas.width;
							frameCanvas.height = canvas.height;
							frameCanvas.getContext("2d")?.putImageData(image, 0, 0);
							onionContext.globalAlpha = 0.25;
							onionContext.drawImage(frameCanvas, 0, 0);
							onionContext.globalAlpha = 1;
						}
					}
				}
				if (requestId !== requestIdRef.current) return;
				await playbackContext.renderFrameToCanvas(
					playbackContext.currentFrame,
					canvas,
				);
			})();
		});
	};

	return { render, onionCanvasRef };
};
