import { createContext } from "react";

type PlaybackContextType = {
	currentFrame: number;
	isPlaying: boolean;
	isLoop: boolean;
	maxFrameCount: number;

	setCurrentFrame: (frame: number) => void;
	setIsLoop: (loop: boolean) => void;

	play: () => void;
	pause: () => void;
	stop: () => void;

	renderFrame: (frame: number) => Promise<Uint8ClampedArray | undefined>;
};

export const PlaybackContext = createContext<PlaybackContextType | null>(null);
