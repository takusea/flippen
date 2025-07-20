import { usePlayback } from "../Playback/usePlayback";

export const useCanvasRender = () => {
	const playbackContext = usePlayback();

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

	const render = (canvas: HTMLCanvasElement, isOnionSkinEnabled: boolean) => {
		const ctx = canvas.getContext("2d");
		if (ctx == null) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (isOnionSkinEnabled && !playbackContext.isPlaying) {
			const isFirstFrame = playbackContext.currentFrame === 0;
			if (!isFirstFrame) {
				const prevFrame = playbackContext.renderFrame(
					playbackContext.currentFrame - 1,
				);
				if (prevFrame != null) {
					putImageData(canvas, prevFrame, 0.25);
				}
			}

			const isLastFrame =
				playbackContext.currentFrame === playbackContext.maxFrameCount - 1;
			if (!isLastFrame) {
				const nextFrame = playbackContext.renderFrame(
					playbackContext.currentFrame + 1,
				);
				if (nextFrame != null) {
					putImageData(canvas, nextFrame, 0.25);
				}
			}
		}

		const currentFrame = playbackContext.renderFrame(
			playbackContext.currentFrame,
		);
		if (currentFrame != null) {
			putImageData(canvas, currentFrame, 1.0);
		}
	};

	return { render };
};
