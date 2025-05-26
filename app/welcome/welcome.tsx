import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowsMove,
	IconBucketDroplet,
	IconClipboard,
	IconCopy,
	IconEraser,
	IconLasso,
	IconPencil,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
} from "@tabler/icons-react";
import IconButton from "~/base/IconButton";

export function Welcome() {
	return (
		<main className="relative w-full h-full">
			<canvas />
			<div className="absolute bottom-8 w-fit left-0 right-0 m-auto flex gap-2">
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton label="Undo" icon={IconArrowBackUp} size="small" />
					<IconButton label="Redo" icon={IconArrowForwardUp} size="small" />
					<IconButton label="Copy" icon={IconCopy} size="small" />
					<IconButton label="Paste" icon={IconClipboard} size="small" />
				</div>
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton label="Rewind" icon={IconPlayerSkipBack} size="small" />
					<IconButton label="Play" icon={IconPlayerPlay} size="small" />
					<IconButton
						label="Forward"
						icon={IconPlayerSkipForward}
						size="small"
					/>
				</div>
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton label="Move" icon={IconArrowsMove} size="small" />
					<IconButton label="Pen" icon={IconPencil} size="small" />
					<IconButton label="Eraser" icon={IconEraser} size="small" />
					<IconButton label="Fill" icon={IconBucketDroplet} size="small" />
					<IconButton label="Select" icon={IconLasso} size="small" />
				</div>
			</div>
			<div className="absolute h-full right-0 border-l border-gray-200">
				10000000
			</div>
		</main>
	);
}
