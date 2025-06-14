import { useEffect, useRef, useState } from "react";
import type { FlippenWasm } from "~/pkg/flippen_wasm";

export function useFrameList(app?: FlippenWasm) {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [totalFrames, setTotalFrames] = useState<number>(1);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isLoop, setIsLoop] = useState<boolean>(false);
	const [fps, setFps] = useState<number>(8);

	const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (app) {
			setCurrentIndex(() => app.current_index());
			setTotalFrames(() => app.total_frames());
		}
	}, [app]);

	useEffect(() => {
		if (app) {
			app.set_current_index(currentIndex);
		}
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
		app?.insert_frame(index);
		setTotalFrames((prev) => prev + 1);
	};

	const deleteFrame = (index: number) => {
		app?.delete_frame(index);
		setTotalFrames((prev) => prev - 1);
	};

	const advanceFrame = () => {
		if (app == null) return;

		setCurrentIndex((prev) => {
			if (prev + 1 < totalFrames) {
				return prev + 1;
			}
			if (isLoop) {
				return 0;
			}
			pause();
			return prev;
		});
	};

	const play = () => {
		if (isPlaying) return;
		setIsPlaying(true);
		playIntervalRef.current = setInterval(advanceFrame, 1000 / fps);
	};

	const pause = () => {
		setIsPlaying(false);
		if (playIntervalRef.current !== null) {
			clearInterval(playIntervalRef.current);
			playIntervalRef.current = null;
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
