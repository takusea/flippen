import { useLayoutEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useClip } from "~/features/clip/useClip";
import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useShortcuts } from "~/features/shortcuts/useShortcuts";
import Clip from "./Clip";
import TrackHeader from "./TrackHeader";
import TrackSide from "./TrackSide";

const NUM_TRACKS = 100;
const MIN_LAYER_HEIGHT = 12;
const MAX_LAYER_HEIGHT = 128;
const MIN_FRAME_WIDTH = 2;
const MAX_FRAME_WIDTH = 64;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

const Timeline: React.FC = () => {
	const clipContext = useClip();
	const playbackContext = usePlayback();
	const layerContext = useLayer();
	const { shortcuts } = useShortcuts();

	useHotkeys(shortcuts.deleteClip, () => {
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
	const timelineViewportRef = useRef<HTMLDivElement | null>(null);
	const [pendingScroll, setPendingScroll] = useState<{
		x: number;
		y: number;
	} | null>(null);

	useLayoutEffect(() => {
		const viewport = timelineViewportRef.current;
		if (pendingScroll == null || viewport == null) return;

		viewport.scrollLeft = pendingScroll.x;
		viewport.scrollTop = pendingScroll.y;
		setPendingScroll(null);
		setScrollPosition({ x: viewport.scrollLeft, y: viewport.scrollTop });
	}, [pendingScroll]);

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

	function handleHorizontalZoom(event: React.WheelEvent<HTMLDivElement>) {
		event.preventDefault();
		const viewport = timelineViewportRef.current;
		if (viewport == null) return;

		const nextFrameWidth = Math.min(
			MAX_FRAME_WIDTH,
			Math.max(
				MIN_FRAME_WIDTH,
				frameWidth * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY),
			),
		);
		if (nextFrameWidth === frameWidth) return;

		const viewportRect = viewport.getBoundingClientRect();
		const pointerOffset = event.clientX - viewportRect.left;
		const frameAtPointer = (viewport.scrollLeft + pointerOffset) / frameWidth;
		setPendingScroll({
			x: Math.max(0, frameAtPointer * nextFrameWidth - pointerOffset),
			y: viewport.scrollTop,
		});
		setFrameWidth(nextFrameWidth);
	}

	function handleVerticalZoom(event: React.WheelEvent<HTMLDivElement>) {
		event.preventDefault();
		const viewport = timelineViewportRef.current;
		if (viewport == null) return;

		const nextLayerHeight = Math.min(
			MAX_LAYER_HEIGHT,
			Math.max(
				MIN_LAYER_HEIGHT,
				layerHeight * Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY),
			),
		);
		if (nextLayerHeight === layerHeight) return;

		const viewportRect = viewport.getBoundingClientRect();
		const pointerOffset = event.clientY - viewportRect.top;
		const layerAtPointer = (viewport.scrollTop + pointerOffset) / layerHeight;
		setPendingScroll({
			x: viewport.scrollLeft,
			y: Math.max(0, layerAtPointer * nextLayerHeight - pointerOffset),
		});
		setTrackHeight(nextLayerHeight);
	}

	return (
		<div className="h-full min-h-0 min-w-0 grid grid-rows-[24px_minmax(0,1fr)] grid-cols-[192px_minmax(0,1fr)]">
			<div className="size-full grid items-center justify-end px-1 font-mono border-b border-r border-zinc-500/25">
				{playbackContext.currentFrame}/{playbackContext.maxFrameCount}
			</div>
			<div className="relative overflow-hidden border-b border-zinc-500/25">
				<TrackHeader
					frameWidth={frameWidth}
					totalFrames={playbackContext.maxFrameCount}
					scrollX={scrollPosition.x}
					currentFrame={playbackContext.currentFrame}
					onFrameChange={playbackContext.setCurrentFrame}
					onWheel={handleHorizontalZoom}
				/>
			</div>
			<div className="relative overflow-hidden border-r border-zinc-500/25">
				<TrackSide
					numTracks={NUM_TRACKS}
					layerHeight={layerHeight}
					scrollY={scrollPosition.y}
					hiddenLayers={layerContext.hiddenLayers}
					lockedLayers={layerContext.lockedLayers}
					selectedLayer={layerContext.selectedLayer}
					onLayerSelect={layerContext.selectLayer}
					onLayerShow={layerContext.showLayer}
					onLayerHide={layerContext.hideLayer}
					onLayerLockToggle={layerContext.toggleLayerLock}
					onWheel={handleVerticalZoom}
				/>
			</div>
			<div
				className="relative overflow-scroll row-start-2 col-start-2"
				onPointerDown={handlePointerDown}
				onScroll={handleScroll}
				ref={timelineViewportRef}
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
						name={clip.name}
						layerHeight={layerHeight}
						frameWidth={frameWidth}
						startFrame={clip.start}
						duration={clip.duration}
						layerIndex={clip.layer_index}
						isSelected={clip.id === clipContext.selectedClipId}
						isHidden={
							clip.hidden ||
							layerContext.hiddenLayers.includes(clip.layer_index)
						}
						isLocked={
							clip.locked ||
							layerContext.lockedLayers.includes(clip.layer_index)
						}
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
