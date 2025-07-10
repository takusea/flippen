import { createContext, use, useEffect, useRef, useState } from "react";
import { CoreContext } from "../Core/CoreContext";

type PlaybackContextType = {
	currentFrame: number;
	isPlaying: boolean;
	isLoop: boolean;
	fps: number;
	maxFrameCount: number;

	setCurrentFrame: (frame: number) => void;
	setFps: (fps: number) => void;
	setIsLoop: (loop: boolean) => void;

	play: () => void;
	pause: () => void;
	stop: () => void;

	renderFrame: (frame: number) => Uint8ClampedArray | undefined;
};

export const PlaybackContext = createContext<PlaybackContextType>({} as any);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { core } = use(CoreContext);

	const [currentFrame, setCurrentFrame] = useState(0);
	const [fps, setFps] = useState(8);
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
		if (!isPlaying) {
			setIsPlaying(true);
			intervalRef.current = setInterval(advanceFrame, 1000 / fps);
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

	const renderFrame = (frame: number): Uint8ClampedArray | undefined => {
		return core?.render_frame(frame);
	};

	useEffect(() => () => pause(), []);

	return (
		<PlaybackContext
			value={{
				currentFrame,
				isPlaying,
				isLoop,
				fps,
				maxFrameCount,
				setCurrentFrame,
				setFps,
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
