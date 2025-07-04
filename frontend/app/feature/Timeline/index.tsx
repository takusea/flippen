import type { ClipMetadata } from "~/util/clip";
import Clip from "./Clip";
import { useState } from "react";
import TrackHeader from "./TrackHeader";
import TrackSide from "./TrackSide";

const NUM_TRACKS = 100;

type Props = {
	clips: ClipMetadata[];
	selectedClip?: number;
	currentFrame: number;
	totalFrames: number;
	onSelectClip: (id: number) => void;
	onMoveClip: (id: number, startFrame: number, trackIndex: number) => void;
	onAddClip: (startFrame: number, trackIndex: number) => void;
	onClipDurationChange: (id: number, duration: number) => void;
	onFrameChange: (frame: number) => void;
};

const Timeline: React.FC<Props> = (props) => {
	const [trackHeight, setTrackHeight] = useState<number>(32);
	const [frameWidth, setFrameWidth] = useState<number>(16);
	const [scrollPosition, setScrollPosition] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
		if (!(event.buttons & 1)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor((event.clientX - rect.left) / frameWidth);
		const trackIndex = Math.floor((event.clientY - rect.top) / trackHeight);

		props.onFrameChange(startFrame);
		props.onAddClip(startFrame, trackIndex);
	}

	function handleScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
		setScrollPosition({
			x: event.currentTarget.scrollLeft,
			y: event.currentTarget.scrollTop,
		});
	}

	return (
		<div className="grid grid-rows-[24px_1fr] grid-cols-[96px_1fr]">
			<div className="size-full grid place-content-center font-mono border-b border-r border-zinc-500/25">
				{props.currentFrame}/{props.totalFrames}
			</div>
			<div className="relative overflow-hidden border-b border-zinc-500/25">
				<TrackHeader
					frameWidth={frameWidth}
					totalFrames={props.totalFrames}
					scrollX={scrollPosition.x}
					currentFrame={props.currentFrame}
					onFrameChange={props.onFrameChange}
				/>
			</div>
			<div className="relative overflow-hidden border-r border-zinc-500/25">
				<TrackSide
					numTracks={NUM_TRACKS}
					trackHeight={trackHeight}
					scrollY={scrollPosition.y}
				/>
			</div>
			<div
				className="relative overflow-scroll row-start-2 col-start-2"
				onPointerDown={handlePointerDown}
				onScroll={handleScroll}
			>
				<div
					className="absolute top-0 bottom-0 w-px bg-teal-400 z-50"
					style={{ left: `${props.currentFrame * frameWidth}px` }}
				/>
				{[...Array(NUM_TRACKS)].map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={i}
						className="absolute top-0 left-0 h-px bg-zinc-500/25"
						style={{
							top: `${(i + 1) * trackHeight}px`,
							width: `${frameWidth * props.totalFrames}px`,
						}}
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
		</div>
	);
};

export default Timeline;
