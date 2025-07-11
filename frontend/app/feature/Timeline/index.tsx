import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Clip from "./Clip";
import TrackHeader from "./TrackHeader";
import TrackSide from "./TrackSide";
import { useClip } from "../Clip/useClip";
import { usePlayback } from "../Playback/usePlayback";
import { useLayer } from "../layer/useLayer";

const NUM_TRACKS = 100;

const Timeline: React.FC = () => {
	const clipContext = useClip();
	const playbackContext = usePlayback();
	const layerContext = useLayer();

	useHotkeys("delete", () => {
		if (clipContext.selectedClipId != null) {
			clipContext.deleteClip(clipContext.selectedClipId);
		}
	});

	const [layerHeight, setTrackHeight] = useState<number>(32);
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
		const layerIndex = Math.floor(
			(event.clientY - rect.top + scrollPosition.y) / layerHeight,
		);

		clipContext.addClip(startFrame, layerIndex);
	}

	function handleScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
		setScrollPosition({
			x: event.currentTarget.scrollLeft,
			y: event.currentTarget.scrollTop,
		});
	}

	return (
		<div className="grid grid-rows-[24px_1fr] grid-cols-[128px_1fr]">
			<div className="size-full grid place-content-center font-mono border-b border-r border-zinc-500/25">
				{playbackContext.currentFrame}/{playbackContext.maxFrameCount}
			</div>
			<div className="relative overflow-hidden border-b border-zinc-500/25">
				<TrackHeader
					frameWidth={frameWidth}
					totalFrames={playbackContext.maxFrameCount}
					scrollX={scrollPosition.x}
					currentFrame={playbackContext.currentFrame}
					onFrameChange={playbackContext.setCurrentFrame}
				/>
			</div>
			<div className="relative overflow-hidden border-r border-zinc-500/25">
				<TrackSide
					numTracks={NUM_TRACKS}
					layerHeight={layerHeight}
					scrollY={scrollPosition.y}
					hiddenLayers={layerContext.hiddenLayers}
					onLayerShow={layerContext.showLayer}
					onLayerHide={layerContext.hideLayer}
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
						height: `${layerHeight * NUM_TRACKS}px`,
						translate: `${playbackContext.currentFrame * frameWidth}px 0`,
					}}
				/>
				{[...Array(NUM_TRACKS)].map((_, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={i}
						className="absolute top-0 left-0 h-px bg-zinc-500/25"
						style={{
							top: `${(i + 1) * layerHeight}px`,
							width: `${frameWidth * playbackContext.maxFrameCount}px`,
						}}
					/>
				))}

				{clipContext.clips.map((clip) => (
					<Clip
						key={clip.id}
						id={clip.id}
						layerHeight={layerHeight}
						frameWidth={frameWidth}
						startFrame={clip.start}
						duration={clip.duration}
						layerIndex={clip.layer_index}
						isSelected={clip.id === clipContext.selectedClipId}
						onSelect={() => clipContext.selectClip(clip.id)}
						onMove={(startFrame: number, layerIndex: number) => {
							clipContext.moveClip(clip.id, startFrame, layerIndex);
						}}
						onDurationChange={(duration) =>
							clipContext.changeClipDuration(clip.id, duration)
						}
					/>
				))}
			</div>
		</div>
	);
};

export default Timeline;
