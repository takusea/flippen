import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconCopy,
	IconClipboard,
	IconPlayerPlay,
	IconPlayerStop,
	IconPlayerSkipBack,
	IconPlayerTrackPrev,
	IconPlayerTrackNext,
	IconPlayerSkipForward,
	IconArrowsMove,
	IconPencil,
	IconEraser,
	IconBucketDroplet,
	IconLasso,
	IconPlayerPause,
	IconRefresh,
} from "@tabler/icons-react";
import IconButton from "~/base/IconButton";

type Props = {
	currentTool: string;
	isPlaying: boolean;
	isLoop: boolean;
	onCurrentToolChange: (tool: string) => void;
	onUndo: () => void;
	onRedo: () => void;
	onCopy: () => void;
	onPaste: () => void;
	onPlay: () => void;
	onStop: () => void;
	onIsLoop: () => void;
	onRewind: () => void;
	onPrev: () => void;
	onNext: () => void;
	onForward: () => void;
};

const Toolbar: React.FC<Props> = (props) => {
	return (
		<div className="flex gap-2">
			<div className="flex p-1 border bg-white/90 border-gray-200 rounded-lg shadow-md gap-1">
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
			<div className="flex p-1 border bg-white/90 border-gray-200 rounded-lg shadow-md gap-1">
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
			</div>
			<div className="flex p-1 border bg-white/90 border-gray-200 rounded-lg shadow-md gap-1">
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
			<div className="flex p-1 border bg-white/90 border-gray-200 rounded-lg shadow-md gap-1">
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
