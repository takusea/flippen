import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowsMove,
	IconBucketDroplet,
	IconClipboard,
	IconCopy,
	IconEraser,
	IconLasso,
	IconLayersDifference,
	IconPencil,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconPlayerStop,
	IconPlayerTrackNext,
	IconPlayerTrackPrev,
	IconRefresh,
} from "@tabler/icons-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useUndoStack } from "~/features/history/useUndoStack";
import { usePlayback } from "~/features/playback/usePlayback";
import { useTool } from "~/features/tool/useTool";
import IconButton from "~/shared/ui/IconButton";

type Props = {
	isOnionSkin: boolean;
	onIsOnionSkinChange: () => void;
};

const Toolbar: React.FC<Props> = (props) => {
	const playbackContext = usePlayback();
	const toolContext = useTool();
	const { undo, redo } = useUndoStack();

	useHotkeys("ctrl+z", undo);
	useHotkeys("ctrl+shift+z", redo);
	useHotkeys("ctrl+c", () => {});
	useHotkeys("ctrl+v", () => {});
	useHotkeys("space", () =>
		playbackContext.isPlaying
			? playbackContext.pause()
			: playbackContext.play(),
	);
	useHotkeys("ctrl+o", props.onIsOnionSkinChange);
	useHotkeys("ctrl+l", () =>
		playbackContext.setIsLoop(!playbackContext.isLoop),
	);
	useHotkeys("ctrl+shift+ArrowLeft", () => playbackContext.setCurrentFrame(0));
	useHotkeys("ctrl+ArrowLeft", () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame - 1),
	);
	useHotkeys("ctrl+ArrowRight", () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame + 1),
	);
	useHotkeys("ctrl+shift+ArrowRight", () =>
		playbackContext.setCurrentFrame(playbackContext.maxFrameCount),
	);
	useHotkeys("1", () => toolContext.setTool("move"));
	useHotkeys("2", () => toolContext.setTool("pen"));
	useHotkeys("3", () => toolContext.setTool("eraser"));
	useHotkeys("4", () => toolContext.setTool("fill"));
	useHotkeys("5", () => toolContext.setTool("select"));

	return (
		<div className="flex gap-2">
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Undo"
					icon={IconArrowBackUp}
					size="small"
					onClick={undo}
				/>
				<IconButton
					label="Redo"
					icon={IconArrowForwardUp}
					size="small"
					onClick={redo}
				/>
				<IconButton
					label="Copy"
					icon={IconCopy}
					size="small"
					onClick={() => {}}
				/>
				<IconButton
					label="Paste"
					icon={IconClipboard}
					size="small"
					onClick={() => {}}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Play"
					icon={playbackContext.isPlaying ? IconPlayerPause : IconPlayerPlay}
					variant={playbackContext.isPlaying ? "primary" : "default"}
					size="small"
					onClick={() =>
						playbackContext.isPlaying
							? playbackContext.pause()
							: playbackContext.play()
					}
				/>
				<IconButton
					label="Stop"
					icon={IconPlayerStop}
					size="small"
					onClick={playbackContext.stop}
				/>
				<IconButton
					label="Loop"
					icon={IconRefresh}
					variant={playbackContext.isLoop ? "primary" : "default"}
					size="small"
					onClick={() => playbackContext.setIsLoop(!playbackContext.isLoop)}
				/>
				<IconButton
					label="OnionSkin"
					icon={IconLayersDifference}
					variant={props.isOnionSkin ? "primary" : "default"}
					size="small"
					onClick={props.onIsOnionSkinChange}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Rewind"
					icon={IconPlayerSkipBack}
					size="small"
					onClick={() => playbackContext.setCurrentFrame(0)}
				/>
				<IconButton
					label="Prev"
					icon={IconPlayerTrackPrev}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.currentFrame - 1)
					}
				/>
				<IconButton
					label="Next"
					icon={IconPlayerTrackNext}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.currentFrame + 1)
					}
				/>
				<IconButton
					label="Forward"
					icon={IconPlayerSkipForward}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.maxFrameCount)
					}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Move"
					icon={IconArrowsMove}
					size="small"
					variant={toolContext.tool === "move" ? "primary" : "default"}
					onClick={() => toolContext.setTool("move")}
				/>
				<IconButton
					label="Pen"
					icon={IconPencil}
					size="small"
					variant={toolContext.tool === "pen" ? "primary" : "default"}
					onClick={() => toolContext.setTool("pen")}
				/>
				<IconButton
					label="Eraser"
					icon={IconEraser}
					size="small"
					variant={toolContext.tool === "eraser" ? "primary" : "default"}
					onClick={() => toolContext.setTool("eraser")}
				/>
				<IconButton
					label="Fill"
					icon={IconBucketDroplet}
					size="small"
					variant={toolContext.tool === "fill" ? "primary" : "default"}
					onClick={() => toolContext.setTool("fill")}
				/>
				<IconButton
					label="Select"
					icon={IconLasso}
					size="small"
					variant={toolContext.tool === "select" ? "primary" : "default"}
					onClick={() => toolContext.setTool("select")}
				/>
			</div>
		</div>
	);
};

export default Toolbar;
