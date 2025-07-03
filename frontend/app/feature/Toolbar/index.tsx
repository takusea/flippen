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

type Props = {
	currentTool: string;
	isPlaying: boolean;
	isLoop: boolean;
	isOnionSkin: boolean;
	onCurrentToolChange: (tool: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	onCopy: () => void;
	onPaste: () => void;
	onPlay: () => void;
	onStop: () => void;
	onIsLoop: () => void;
	onIsOnionSkin: () => void;
	onRewind: () => void;
	onPrev: () => void;
	onNext: () => void;
	onForward: () => void;
};

const Toolbar: React.FC<Props> = (props) => {
	useHotkeys("ctrl+z", props.onUndo);
	useHotkeys("ctrl+shift+z", props.onRedo);
	useHotkeys("ctrl+c", props.onCopy);
	useHotkeys("ctrl+v", props.onPaste);
	useHotkeys("space", props.onPlay);
	useHotkeys("ctrl+o", props.onIsOnionSkin);
	useHotkeys("ctrl+l", props.onIsLoop);
	useHotkeys("ctrl+shift+ArrowLeft", props.onRewind);
	useHotkeys("ctrl+ArrowLeft", props.onPrev);
	useHotkeys("ctrl+ArrowRight", props.onNext);
	useHotkeys("ctrl+shift+ArrowRight", props.onForward);
	useHotkeys("1", () => props.onCurrentToolChange("move"));
	useHotkeys("2", () => props.onCurrentToolChange("pen"));
	useHotkeys("3", () => props.onCurrentToolChange("eraser"));
	useHotkeys("4", () => props.onCurrentToolChange("fill"));
	useHotkeys("5", () => props.onCurrentToolChange("select"));

	return (
		<div className="flex gap-2">
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-slate-950/90 border-slate-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Undo"
					icon={IconArrowBackUp}
					size="small"
					onClick={props.onUndo}
				/>
				<IconButton
					label="Redo"
					icon={IconArrowForwardUp}
					size="small"
					onClick={props.onRedo}
				/>
				<IconButton
					label="Copy"
					icon={IconCopy}
					size="small"
					onClick={props.onCopy}
				/>
				<IconButton
					label="Paste"
					icon={IconClipboard}
					size="small"
					onClick={props.onPaste}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-slate-950/90 border-slate-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Play"
					icon={props.isPlaying ? IconPlayerPause : IconPlayerPlay}
					variant={props.isPlaying ? "primary" : "default"}
					size="small"
					onClick={props.onPlay}
				/>
				<IconButton
					label="Stop"
					icon={IconPlayerStop}
					size="small"
					onClick={props.onStop}
				/>
				<IconButton
					label="Loop"
					icon={IconRefresh}
					variant={props.isLoop ? "primary" : "default"}
					size="small"
					onClick={props.onIsLoop}
				/>
				<IconButton
					label="OnionSkin"
					icon={IconLayersDifference}
					variant={props.isOnionSkin ? "primary" : "default"}
					size="small"
					onClick={props.onIsOnionSkin}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-slate-950/90 border-slate-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label="Rewind"
					icon={IconPlayerSkipBack}
					size="small"
					onClick={props.onRewind}
				/>
				<IconButton
					label="Prev"
					icon={IconPlayerTrackPrev}
					size="small"
					onClick={props.onPrev}
				/>
				<IconButton
					label="Next"
					icon={IconPlayerTrackNext}
					size="small"
					onClick={props.onNext}
				/>
				<IconButton
					label="Forward"
					icon={IconPlayerSkipForward}
					size="small"
					onClick={props.onForward}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-slate-950/90 border-slate-500/25 rounded-lg shadow-sm backdrop-blur-xl">
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
