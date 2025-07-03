import type { ClipMetadata } from "~/util/clip";
import Clip from "./Clip";
import { useState } from "react";

const NUM_TRACKS = 10;

type Props = {
	clips: ClipMetadata[];
	selectedClip?: number;
	currentFrame: number;
	onSelectClip: (id: number) => void;
	onMoveClip: (id: number, startFrame: number, trackIndex: number) => void;
	onAddClip: (startFrame: number, trackIndex: number) => void;
	onClipDurationChange: (id: number, duration: number) => void;
	onFrameChange: (frame: number) => void;
};

const Timeline: React.FC<Props> = (props) => {
	const [trackHeight, setTrackHeight] = useState<number>(32);
	const [frameWidth, setFrameWidth] = useState<number>(16);

	function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
		if (event.buttons === 0) return;
		event.currentTarget.setPointerCapture(event.pointerId);

		if (event.currentTarget == null) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor((event.clientX - rect.left) / frameWidth);
		props.onFrameChange(Math.max(0, startFrame));
	}

	function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
		if (event.currentTarget == null) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor((event.clientX - rect.left) / frameWidth);
		const trackIndex = Math.floor((event.clientY - rect.top) / trackHeight);
		if (event.ctrlKey) {
			props.onAddClip(startFrame, trackIndex);
		}
	}

	return (
		<div
			className="relative overflow-scroll"
			onPointerMove={handlePointerMove}
			onPointerDown={handlePointerDown}
		>
			<div
				className="absolute top-0 h-full w-px bg-teal-400 z-50"
				style={{ left: `${props.currentFrame * frameWidth}px` }}
			/>
			{[...Array(NUM_TRACKS)].map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
					className="absolute top-0 left-0 w-full h-px bg-zinc-500/25"
					style={{ top: `${(i + 1) * trackHeight}px` }}
				/>
			))}

			{props.clips.map((clip) => (
				<Clip
					key={clip.id}
					id={clip.id}
					trackHeight={trackHeight}
					frameWidth={frameWidth}
					startFrame={clip.start}
					duration={clip.duration}
					trackIndex={clip.track_index}
					isSelected={clip.id === props.selectedClip}
					onSelect={() => props.onSelectClip(clip.id)}
					onMove={(startFrame: number, trackIndex: number) => {
						props.onMoveClip(clip.id, startFrame, trackIndex);
					}}
					onDurationChange={(duration) =>
						props.onClipDurationChange(clip.id, duration)
					}
				/>
			))}
		</div>
	);
};

export default Timeline;
