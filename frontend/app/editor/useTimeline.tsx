import { useRef, useState } from "react";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import type { ClipMetadata } from "~/util/clip";

export function useTimeline(core?: FlippenCore) {
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	const [totalFrames, setTotalFrames] = useState<number>(256);
	const [isPlaying, setIsPlaying] = useState<boolean>(false);
	const [isLoop, setIsLoop] = useState<boolean>(false);
	const [fps, setFps] = useState<number>(8);

	const [hiddenLayers, setHiddenLayers] = useState<number[]>([]);

	const [clips, setClips] = useState<ClipMetadata[]>([]);
	const [selectedClip, setSelectedClip] = useState<string>();

	const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

	const firstFrame = () => {
		setCurrentIndex(0);
	};

	const lastFrame = () => {
		setCurrentIndex(totalFrames - 1);
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

	const moveClip = (id: string, startFrame: number, LayerIndex: number) => {
		if (core == null) return;

		core.move_clip(id, startFrame, LayerIndex);
		setClips(core.get_clips());
	};

	const addClip = (startFrame: number, LayerIndex: number) => {
		if (core == null) return;

		core.add_clip(startFrame, LayerIndex);
		setClips(core.get_clips());
	};

	const deleteClip = (id: string) => {
		if (core == null) return;

		core.delete_clip(id);
	};

	const changeClipDuration = (id: string, duration: number) => {
		if (core == null) return;

		core.change_clip_duration(id, duration);
		setClips(core.get_clips());
	};

	const fetchHiddenLayers = () => {
		if (core == null) return;
		setHiddenLayers(Array.from(core.get_hidden_layers()));
	};

	const showLayer = (index: number) => {
		if (core == null) return;
		core.show_layer(index);
		fetchHiddenLayers();
	};

	const hideLayer = (index: number) => {
		if (core == null) return;
		core.hide_layer(index);
		fetchHiddenLayers();
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
		deleteClip,
		changeClipDuration,
		hiddenLayers,
		showLayer,
		hideLayer,
		firstFrame,
		lastFrame,
		prevFrame,
		nextFrame,
		play,
		pause,
		stop,
	};
}
