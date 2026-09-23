type Props = {
	currentFrame: number;
	totalFrames: number;
	frameWidth: number;
	scrollX: number;
	onFrameChange: (frame: number) => void;
};

const TrackHeader: React.FC<Props> = (props) => {
	function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
		if (!(event.buttons & 1)) return;
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor(
			(event.clientX - rect.left) / props.frameWidth,
		);
		props.onFrameChange(Math.max(0, startFrame));
	}

	return (
		<div
			className="absolute h-full"
			style={{
				translate: `-${props.scrollX}px 0`,
				width: `${props.totalFrames * props.frameWidth}px`,
			}}
			onPointerMove={handlePointerMove}
		>
			{[...Array(props.totalFrames)].map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
					className="absolute bottom-0 h-2 w-px bg-zinc-500/25"
					style={{ left: `${(i + 1) * props.frameWidth}px` }}
				/>
			))}
			<div
				className="absolute h-full flex items-center px-1 border-b border-teal-500"
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
