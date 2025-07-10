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
import { PlaybackContext } from "../PlayBack/PlayBackContext";
import { use } from "react";
import { UndoStackContext } from "../UndoStack/UndoStackContext";

type Props = {
	currentTool: string;
	isOnionSkin: boolean;
	onCurrentToolChange: (tool: string) => void;
	onIsOnionSkinChange: () => void;
};

const Toolbar: React.FC<Props> = (props) => {
	const playBackContext = use(PlaybackContext);
	const { undo, redo } = use(UndoStackContext);

	useHotkeys("ctrl+z", undo);
	useHotkeys("ctrl+shift+z", redo);
	useHotkeys("ctrl+c", () => {});
	useHotkeys("ctrl+v", () => {});
	useHotkeys(
		"space",
		playBackContext.isPlaying ? playBackContext.play : playBackContext.pause,
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
	useHotkeys("1", () => props.onCurrentToolChange("move"));
	useHotkeys("2", () => props.onCurrentToolChange("pen"));
	useHotkeys("3", () => props.onCurrentToolChange("eraser"));
	useHotkeys("4", () => props.onCurrentToolChange("fill"));
	useHotkeys("5", () => props.onCurrentToolChange("select"));

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
							? playBackContext.play
							: playBackContext.pause
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
					variant={props.currentTool === "move" ? "primary" : "default"}
					onClick={() => props.onCurrentToolChange("move")}
				/>
				<IconButton
					label="Pen"
					icon={IconPencil}
					size="small"
					variant={props.currentTool === "pen" ? "primary" : "default"}
					onClick={() => props.onCurrentToolChange("pen")}
				/>
				<IconButton
					label="Eraser"
					icon={IconEraser}
					size="small"
					variant={props.currentTool === "eraser" ? "primary" : "default"}
					onClick={() => props.onCurrentToolChange("eraser")}
				/>
				<IconButton
					label="Fill"
					icon={IconBucketDroplet}
					size="small"
					variant={props.currentTool === "fill" ? "primary" : "default"}
					onClick={() => props.onCurrentToolChange("fill")}
				/>
				<IconButton
					label="Select"
					icon={IconLasso}
					size="small"
					variant={props.currentTool === "select" ? "primary" : "default"}
					onClick={() => props.onCurrentToolChange("select")}
				/>
			</div>
		</div>
	);
};

export default Toolbar;
