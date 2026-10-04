import { useEffect, useState } from "react";
import {
	DEFAULT_END_FRAME,
	DEFAULT_START_FRAME,
	MAX_FRAME_INDEX,
} from "~/features/project/type";
import { useProject } from "~/features/project/useProject";
import { useCore } from "~/infrastructure/core/useCore";
import { PlaybackContext } from "./PlaybackContextValue";

const FRAME_RANGE_BUFFER = 256;

export const PlaybackProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();
	const project = useProject();

	const [currentFrame, setCurrentFrame] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isLoop, setIsLoop] = useState(false);
	const startFrame = project.settings?.startFrame ?? DEFAULT_START_FRAME;
	const endFrame = project.settings?.endFrame ?? DEFAULT_END_FRAME;
	const maxFrameCount = Math.min(
		MAX_FRAME_INDEX + 1,
		endFrame + FRAME_RANGE_BUFFER + 1,
	);
	const setCurrentFrameClamped = (frame: number) => {
		setCurrentFrame(Math.min(Math.max(frame, startFrame), endFrame));
	};

	useEffect(() => {
		setCurrentFrame((frame) => Math.min(Math.max(frame, startFrame), endFrame));
	}, [startFrame, endFrame]);

	useEffect(() => {
		if (!isPlaying || !project.settings) return;

		const interval = setInterval(() => {
			setCurrentFrame((frame) => {
				if (frame < endFrame) return frame + 1;
				return isLoop ? startFrame : frame;
			});
		}, 1000 / project.settings.frameRate);
		return () => clearInterval(interval);
	}, [endFrame, isLoop, isPlaying, project.settings, startFrame]);

	useEffect(() => {
		if (isPlaying && !isLoop && currentFrame >= endFrame) {
			setIsPlaying(false);
		}
	}, [currentFrame, endFrame, isLoop, isPlaying]);

	const play = () => {
		if (!project.settings) return;
		setIsPlaying(true);
	};

	const pause = () => {
		setIsPlaying(false);
	};

	const stop = () => {
		pause();
		setCurrentFrame(startFrame);
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
				startFrame,
				endFrame,
				maxFrameCount,
				setCurrentFrame: setCurrentFrameClamped,
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
