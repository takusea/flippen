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
import IconButton from "~/base/IconButton";
import { usePlayback } from "../Playback/usePlayback";
import { useTool } from "../Tool/useTool";
import { useUndoStack } from "../UndoStack/useUndoStack";

type Props = {
	isOnionSkin: boolean;
	onIsOnionSkinChange: () => void;
};

const Toolbar: React.FC<Props> = (props) => {
	const playBackContext = usePlayback();
	const toolContext = useTool();
	const { undo, redo } = useUndoStack();

	useHotkeys("ctrl+z", undo);
	useHotkeys("ctrl+shift+z", redo);
	useHotkeys("ctrl+c", () => {});
	useHotkeys("ctrl+v", () => {});
	useHotkeys("space", () =>
		playBackContext.isPlaying
			? playBackContext.pause()
			: playBackContext.play(),
	);
	useHotkeys("ctrl+o", props.onIsOnionSkinChange);
	useHotkeys("ctrl+l", () =>
		playBackContext.setIsLoop(!playBackContext.isLoop),
	);
	useHotkeys("ctrl+shift+ArrowLeft", () => playBackContext.setCurrentFrame(0));
	useHotkeys("ctrl+ArrowLeft", () =>
		playBackContext.setCurrentFrame(playBackContext.currentFrame - 1),
	);
	useHotkeys("ctrl+ArrowRight", () =>
		playBackContext.setCurrentFrame(playBackContext.currentFrame + 1),
	);
	useHotkeys("ctrl+shift+ArrowRight", () =>
		playBackContext.setCurrentFrame(playBackContext.maxFrameCount),
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
					icon={playBackContext.isPlaying ? IconPlayerPause : IconPlayerPlay}
					variant={playBackContext.isPlaying ? "primary" : "default"}
					size="small"
					onClick={() =>
						playBackContext.isPlaying
							? playBackContext.pause()
							: playBackContext.play()
					}
				/>
				<IconButton
					label="Stop"
					icon={IconPlayerStop}
					size="small"
					onClick={playBackContext.stop}
				/>
				<IconButton
					label="Loop"
					icon={IconRefresh}
					variant={playBackContext.isLoop ? "primary" : "default"}
					size="small"
					onClick={() => playBackContext.setIsLoop(!playBackContext.isLoop)}
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
					onClick={() => playBackContext.setCurrentFrame(0)}
				/>
				<IconButton
					label="Prev"
					icon={IconPlayerTrackPrev}
					size="small"
					onClick={() =>
						playBackContext.setCurrentFrame(playBackContext.currentFrame - 1)
					}
				/>
				<IconButton
					label="Next"
					icon={IconPlayerTrackNext}
					size="small"
					onClick={() =>
						playBackContext.setCurrentFrame(playBackContext.currentFrame + 1)
					}
				/>
				<IconButton
					label="Forward"
					icon={IconPlayerSkipForward}
					size="small"
					onClick={() =>
						playBackContext.setCurrentFrame(playBackContext.maxFrameCount)
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
