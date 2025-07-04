import { useState } from "react";

type Props = {
	id: number;
	trackHeight: number;
	frameWidth: number;
	startFrame: number;
	duration: number;
	trackIndex: number;
	isSelected: boolean;
	onSelect: () => void;
	onMove: (startFrame: number, trackIndex: number) => void;
	onDurationChange: (duration: number) => void;
};

const Clip: React.FC<Props> = (props) => {
	const [startPosX, setStartPosX] = useState(0);

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (!(event.buttons & 1)) return;

		props.onSelect();

		const rect = event.currentTarget.getBoundingClientRect();
		setStartPosX(event.clientX - rect.left);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (!(event.buttons & 1)) return;
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor(
			(event.clientX - rect.left - startPosX) / props.frameWidth,
		);
		const trackIndex = Math.floor(
			(event.clientY - rect.top) / props.trackHeight,
		);

		props.onMove(
			Math.max(0, props.startFrame + startFrame),
			Math.max(0, props.trackIndex + trackIndex),
		);
	};

	const handleRightPointerMove = (
		event: React.PointerEvent<HTMLDivElement>,
	) => {
		event.stopPropagation();
		if (!(event.buttons & 1)) return;
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const duration = Math.floor((event.clientX - rect.left) / props.frameWidth);

		props.onDurationChange(Math.max(1, props.duration + duration));
	};

	return (
		<div
			key={props.id}
			className={`absolute grid grid-cols-[1fr_8px] items-stretch rounded border ${props.isSelected ? "bg-teal-400/25 border-teal-400 border-2" : "bg-zinc-500/25 border-zinc-500/25"}`}
			style={{
				left: `${props.startFrame * props.frameWidth}px`,
				top: `${props.trackIndex * props.trackHeight}px`,
				width: `${props.duration * props.frameWidth}px`,
				height: `${props.trackHeight}px`,
			}}
			onPointerDown={handlePointerDown}
		>
			<div className="absolute h-full flex items-center text-nowrap pointer-events-none">
				Clip {props.id}
			</div>
			<div className="cursor-move" onPointerMove={handlePointerMove} />
			<div className="cursor-w-resize" onPointerMove={handleRightPointerMove} />
		</div>
	);
};

export default Clip;
