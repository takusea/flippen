import type { ClipMetadata } from "~/util/clip";
import Clip from "./Clip";
import { useState } from "react";
import TrackHeader from "./TrackHeader";
import TrackSide from "./TrackSide";
import { useHotkeys } from "react-hotkeys-hook";

const NUM_TRACKS = 100;

type Props = {
	clips: ClipMetadata[];
	selectedClip?: string;
	currentFrame: number;
	totalFrames: number;
	onSelectClip: (id: string) => void;
	onMoveClip: (id: string, startFrame: number, trackIndex: number) => void;
	onAddClip: (startFrame: number, trackIndex: number) => void;
	onDeleteClip: (id: string) => void;
	onClipDurationChange: (id: string, duration: number) => void;
	onFrameChange: (frame: number) => void;
};

const Timeline: React.FC<Props> = (props) => {
	useHotkeys("delete", () => {
		if (props.selectedClip != null) {
			props.onDeleteClip(props.selectedClip);
		}
	});
	const [trackHeight, setTrackHeight] = useState<number>(32);
	const [frameWidth, setFrameWidth] = useState<number>(16);
	const [scrollPosition, setScrollPosition] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
		if (!(event.buttons & 1)) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor(
			(event.clientX - rect.left + scrollPosition.x) / frameWidth,
		);
		const trackIndex = Math.floor(
			(event.clientY - rect.top + scrollPosition.y) / trackHeight,
		);

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
					className="absolute top-0 w-px bg-teal-400 z-50"
					style={{
						height: `${trackHeight * NUM_TRACKS}px`,
						translate: `${props.currentFrame * frameWidth}px 0`,
					}}
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
