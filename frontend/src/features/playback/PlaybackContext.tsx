import { createContext, useRef, useState } from "react";
import { useProject } from "~/features/project/useProject";
import { useCore } from "~/infrastructure/core/useCore";

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

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const project = useProject();

	const [currentFrame, setCurrentFrame] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoop, setIsLoop] = useState(false);
	const maxFrameCount = 256;

	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	const advanceFrame = () => {
		setCurrentFrame((prev) => {
			if (prev + 1 < maxFrameCount) return prev + 1;
			if (isLoop) return 0;
			pause();
			return prev;
		});
	};

	const play = () => {
		if (!project.settings) return;
		if (!isPlaying) {
			setIsPlaying(true);
			intervalRef.current = setInterval(
				advanceFrame,
				1000 / project.settings?.frame_rate,
			);
		}
	};

	const pause = () => {
		setIsPlaying(false);
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	};

	const stop = () => {
		pause();
		setCurrentFrame(0);
	};

	const renderFrame = async (
		frameIndex: number,
	): Promise<Uint8ClampedArray | undefined> => {
		return core.renderFrame(frameIndex);
	};

	return (
		<PlaybackContext
			value={{
				currentFrame,
				isPlaying,
				isLoop,
				maxFrameCount,
				setCurrentFrame,
				setIsLoop,
				play,
				pause,
				stop,
				renderFrame,
			}}
		>
			{children}
		</PlaybackContext>
	);
};
