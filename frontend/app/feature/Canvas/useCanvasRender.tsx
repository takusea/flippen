import { useRef } from "react";
import { usePlayback } from "../Playback/usePlayback";

export const useCanvasRender = () => {
	const playbackContext = usePlayback();
	const renderRequestRef = useRef(0);
	const frameRequestRef = useRef<number | null>(null);

	const renderNow = async (
		canvas: HTMLCanvasElement,
		isOnionSkinEnabled: boolean,
	) => {
		const ctx = canvas.getContext("2d");
		if (ctx == null) return;

		const requestId = ++renderRequestRef.current;
		const frame = playbackContext.currentFrame;
		const renderCanvas = document.createElement("canvas");
		renderCanvas.width = canvas.width;
		renderCanvas.height = canvas.height;
		const renderContext = renderCanvas.getContext("2d");
		if (renderContext == null) return;

		const putFrame = (image: Uint8ClampedArray, alpha: number) => {
			const imageData = new ImageData(
				image as unknown as Uint8ClampedArray<ArrayBuffer>,
				canvas.width,
				canvas.height,
			);
			const frameCanvas = document.createElement("canvas");
			frameCanvas.width = canvas.width;
			frameCanvas.height = canvas.height;
			const frameContext = frameCanvas.getContext("2d");
			if (frameContext == null) return;
			frameContext.putImageData(imageData, 0, 0);
			renderContext.globalAlpha = alpha;
			renderContext.drawImage(frameCanvas, 0, 0);
			renderContext.globalAlpha = 1.0;
		};

		if (isOnionSkinEnabled && !playbackContext.isPlaying) {
			const isFirstFrame = frame === 0;
			if (!isFirstFrame) {
				const prevFrame = await playbackContext.renderFrame(frame - 1);
				if (requestId !== renderRequestRef.current) return;
				if (prevFrame != null) {
					putFrame(prevFrame, 0.25);
				}
			}

			const isLastFrame = frame === playbackContext.maxFrameCount - 1;
			if (!isLastFrame) {
				const nextFrame = await playbackContext.renderFrame(frame + 1);
				if (requestId !== renderRequestRef.current) return;
				if (nextFrame != null) {
					putFrame(nextFrame, 0.25);
				}
			}
		}

		const currentFrame = await playbackContext.renderFrame(frame);
		if (requestId !== renderRequestRef.current) return;
		if (currentFrame != null) {
			putFrame(currentFrame, 1.0);
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(renderCanvas, 0, 0);
	};

	const render = (canvas: HTMLCanvasElement, isOnionSkinEnabled: boolean) => {
		if (frameRequestRef.current != null) {
			cancelAnimationFrame(frameRequestRef.current);
		}
		frameRequestRef.current = requestAnimationFrame(() => {
			frameRequestRef.current = null;
			void renderNow(canvas, isOnionSkinEnabled);
		});
	};

	return { render };
};
