import { useEffect, useState } from "react";
import type { FlippenWasm } from "~/pkg/flippen_wasm";

export function useFrameList(app?: FlippenWasm) {
	const [currentIndex, setCurrentIndex] = useState<number>(
		app?.current_index ?? 0,
	);
	const [totalFrames, setTotalFrames] = useState<number>(
		app?.total_frames ?? 1,
	);

	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isLoop, setIsLoop] = useState<boolean>(false);
	const [fps, setFps] = useState<number>(8);

	const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (app == null) return;
		app.set_current_index(currentIndex);
	}, [app, currentIndex]);

	const firstFrame = () => {
		setCurrentIndex(0);
	};

	const lastFrame = () => {
		setCurrentIndex(0);
	};

	const prevFrame = () => {
		setCurrentIndex((prev) => prev - 1);
	};

	const nextFrame = () => {
		setCurrentIndex((next) => next + 1);
	};

	const insertFrame = (index: number) => {
		app?.insert_frame();
		setTotalFrames((prev) => prev + 1);
	};

	const deleteFrame = (index: number) => {
		app?.delete_current_frame();
		setTotalFrames((prev) => prev - 1);
	};

	const advanceFrame = () => {
		if (app == null) return;
		if (currentIndex + 1 < totalFrames) {
			setCurrentIndex((prev) => prev + 1);
		} else if (isLoop) {
			setCurrentIndex(0);
		} else {
			pause();
		}
	};

	const play = () => {
		if (isPlaying) return;
		setIsPlaying(true);
		setPlayInterval(setInterval(advanceFrame, 1000 / fps));
	};

	const pause = () => {
		setIsPlaying(false);
		if (playInterval !== null) {
			clearInterval(playInterval);
			setPlayInterval(null);
		}
	};

	const stop = () => {
		pause();
		setCurrentIndex(0);
	};

	return {
		currentIndex,
		setCurrentIndex,
		totalFrames,
		isPlaying,
		isLoop,
		setIsLoop,
		fps,
		setFps,
		insertFrame,
		deleteFrame,
		firstFrame,
		lastFrame,
		prevFrame,
		nextFrame,
		play,
		pause,
		stop,
	};
}
