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
			<div className="absolute bottom-8 w-fit left-0 right-0 m-auto flex gap-2">
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton icon={IconArrowBackUp} size="small" />
					<IconButton icon={IconArrowForwardUp} size="small" />
					<IconButton icon={IconCopy} size="small" />
					<IconButton icon={IconClipboard} size="small" />
				</div>
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton icon={IconPlayerSkipBack} size="small" />
					<IconButton icon={IconPlayerPlay} size="small" />
					<IconButton icon={IconPlayerSkipForward} size="small" />
				</div>
				<div className="flex p-1 border border-gray-200 rounded-lg shadow-md gap-1">
					<IconButton icon={IconArrowsMove} size="small" />
					<IconButton icon={IconPencil} size="small" />
					<IconButton icon={IconEraser} size="small" />
					<IconButton icon={IconBucketDroplet} size="small" />
					<IconButton icon={IconLasso} size="small" />
				</div>
			</div>
			<div className="absolute h-full right-0 border-l border-gray-200">
				10000000
			</div>
		</main>
	);
}
