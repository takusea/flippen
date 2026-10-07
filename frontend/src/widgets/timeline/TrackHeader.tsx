import { useRef } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import { MAX_FRAME_INDEX } from "~/features/project/type";

type Props = {
	currentFrame: number;
	startFrame: number;
	endFrame: number;
	totalFrames: number;
	frameWidth: number;
	scrollX: number;
	onFrameChange: (frame: number) => void;
	onStartFrameChange: (frame: number) => void;
	onEndFrameChange: (frame: number) => void;
	onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
};

const TrackHeader: React.FC<Props> = (props) => {
	const { t } = useI18n();
	const handleDragOffset = useRef(0);

	function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
		if (!(event.buttons & 1)) return;
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor(
			(event.clientX - rect.left) / props.frameWidth,
		);
		props.onFrameChange(Math.max(0, startFrame));
	}

	function handleRangePointerDown(
		event: React.PointerEvent<HTMLButtonElement>,
		frame: number,
	) {
		event.stopPropagation();
		const header = event.currentTarget.parentElement;
		if (header == null) return;
		handleDragOffset.current =
			frame * props.frameWidth -
			(event.clientX - header.getBoundingClientRect().left);
		event.currentTarget.setPointerCapture(event.pointerId);
	}

	function handleRangePointerMove(
		event: React.PointerEvent<HTMLButtonElement>,
		isStart: boolean,
	) {
		if (!(event.buttons & 1)) return;
		event.stopPropagation();

		const header = event.currentTarget.parentElement;
		if (header == null) return;
		const rect = header.getBoundingClientRect();
		const boundary = event.clientX - rect.left + handleDragOffset.current;
		if (isStart) {
			const frame = Math.floor(boundary / props.frameWidth);
			props.onStartFrameChange(Math.max(0, Math.min(frame, props.endFrame)));
			return;
		}

		const frame = Math.ceil(boundary / props.frameWidth) - 1;
		props.onEndFrameChange(
			Math.min(MAX_FRAME_INDEX, Math.max(frame, props.startFrame)),
		);
	}

	function handleRangeKeyDown(
		event: React.KeyboardEvent<HTMLButtonElement>,
		isStart: boolean,
	) {
		const currentFrame = isStart ? props.startFrame : props.endFrame;
		const minFrame = isStart ? 0 : props.startFrame;
		const maxFrame = isStart ? props.endFrame : props.totalFrames - 1;
		let nextFrame = currentFrame;

		switch (event.key) {
			case "ArrowLeft":
				nextFrame -= 1;
				break;
			case "ArrowRight":
				nextFrame += 1;
				break;
			case "Home":
				nextFrame = minFrame;
				break;
			case "End":
				nextFrame = maxFrame;
				break;
			default:
				return;
		}

		event.preventDefault();
		event.stopPropagation();
		if (isStart) {
			props.onStartFrameChange(
				Math.max(minFrame, Math.min(nextFrame, maxFrame)),
			);
		} else {
			props.onEndFrameChange(Math.max(minFrame, Math.min(nextFrame, maxFrame)));
		}
	}

	return (
		<div
			className="absolute h-full bg-zinc-950/10 border-b border-zinc-500/40"
			style={{
				translate: `-${props.scrollX}px 0`,
				width: `${props.totalFrames * props.frameWidth}px`,
			}}
			onPointerMove={handlePointerMove}
			onWheel={props.onWheel}
		>
			<div
				className="absolute top-0 h-full bg-white dark:bg-white/10 pointer-events-none"
				style={{
					left: `${props.startFrame * props.frameWidth}px`,
					width: `${(props.endFrame - props.startFrame + 1) * props.frameWidth}px`,
				}}
			/>
			{[...Array(props.totalFrames)].map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: Frame ticks are positional and have no persistent identity.
					key={i}
					className="absolute bottom-0 h-2 w-px bg-zinc-500/25"
					style={{ left: `${(i + 1) * props.frameWidth}px` }}
				/>
			))}
			<button
				type="button"
				aria-label={t("timeline.startFrame", { frame: props.startFrame })}
				title={t("timeline.startFrame", { frame: props.startFrame })}
				className="absolute top-0 z-10 h-full cursor-ew-resize touch-none border-l-2 border-teal-500"
				style={{
					left: `${props.startFrame * props.frameWidth}px`,
				}}
				onPointerDown={(event) =>
					handleRangePointerDown(event, props.startFrame)
				}
				onPointerMove={(event) => handleRangePointerMove(event, true)}
				onKeyDown={(event) => handleRangeKeyDown(event, true)}
			></button>
			<button
				type="button"
				aria-label={t("timeline.endFrame", { frame: props.endFrame })}
				title={t("timeline.endFrame", { frame: props.endFrame })}
				className="absolute top-0 z-10 h-full -translate-x-full cursor-ew-resize touch-none border-r-2 border-teal-500"
				style={{
					left: `${(props.endFrame + 1) * props.frameWidth}px`,
				}}
				onPointerDown={(event) =>
					handleRangePointerDown(event, props.endFrame + 1)
				}
				onPointerMove={(event) => handleRangePointerMove(event, false)}
				onKeyDown={(event) => handleRangeKeyDown(event, false)}
			></button>
			<div
				className="absolute h-full flex items-center px-1 border-b-2 border-teal-500 font-mono pointer-events-none"
				style={{
					translate: `${props.currentFrame * props.frameWidth}px 0`,
					width: `${props.frameWidth}px`,
				}}
			>
				{props.currentFrame}
			</div>
		</div>
	);
};

export default TrackHeader;
