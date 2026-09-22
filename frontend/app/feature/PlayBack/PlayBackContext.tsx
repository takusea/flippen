import { createContext, useEffect, useRef, useState } from "react";
import type { FlippenCore } from "~/pkg/flippen_wasm";
import { useCore } from "../Core/useCore";

type CoreOperation<T> = (core: FlippenCore) => T | PromiseLike<T>;

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

	renderFrame: (frame: number) => Promise<Uint8ClampedArray | undefined>;
	runCoreOperation: <T>(operation: CoreOperation<T>) => Promise<T | undefined>;
};

export const PlaybackContext = createContext<PlaybackContextType | null>(null);

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [currentFrame, setCurrentFrame] = useState(0);
	const [fps, setFps] = useState(8);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoop, setIsLoop] = useState(false);
	const maxFrameCount = 256;

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const coreQueueRef = useRef(Promise.resolve());

	const runCoreOperation = <T,>(operation: CoreOperation<T>) => {
		const result = coreQueueRef.current.then(() => operation(core));
		coreQueueRef.current = result.then(
			() => undefined,
			() => undefined,
		);
		return result;
	};

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

	const renderFrame = async (
		frameIndex: number,
	): Promise<Uint8ClampedArray | undefined> => {
		return runCoreOperation((currentCore) =>
			currentCore.render_frame(frameIndex),
		);
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
				runCoreOperation,
			}}
		>
			{children}
		</PlaybackContext>
	);
};
