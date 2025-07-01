import { useRef, useState } from "react";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import type { ClipMetadata } from "~/util/clip";

export function useTimeline(core?: FlippenCore) {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [totalFrames, setTotalFrames] = useState<number>(256);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isLoop, setIsLoop] = useState<boolean>(false);
	const [fps, setFps] = useState<number>(8);

	const [clips, setClips] = useState<ClipMetadata[]>([]);
	const [selectedClip, setSelectedClip] = useState<number>();

	const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

	const advanceFrame = () => {
		if (core == null) return;

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

	const moveClip = (id: number, startFrame: number, trackIndex: number) => {
		if (core == null) return;

		core.move_clip(id, startFrame, trackIndex);
		setClips(core.get_clips());
	};

	const addClip = (startFrame: number, trackIndex: number) => {
		if (core == null) return;

		core?.add_clip(startFrame, trackIndex);
		setClips(core.get_clips());
	};

	const changeClipDuration = (id: number, duration: number) => {
		if (core == null) return;

		core.change_clip_duration(id, duration);
		setClips(core.get_clips());
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
		clips,
		setClips,
		selectedClip,
		setSelectedClip,
		moveClip,
		addClip,
		changeClipDuration,
		firstFrame,
		lastFrame,
		prevFrame,
		nextFrame,
		play,
		pause,
		stop,
	};
}
