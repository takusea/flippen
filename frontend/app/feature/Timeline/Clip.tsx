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
		props.onSelect();

		const rect = event.currentTarget.getBoundingClientRect();
		setStartPosX(event.clientX - rect.left);
	};

	const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (event.buttons === 0) return;
		event.stopPropagation();
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
		if (event.buttons === 0) return;
		event.stopPropagation();
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const duration = Math.floor((event.clientX - rect.left) / props.frameWidth);

		props.onDurationChange(Math.max(1, props.duration + duration));
	};

	return (
		<div
			key={props.id}
			className={`absolute border ${props.isSelected ? "bg-teal-400/25 border-teal-400 border-2" : "bg-slate-500/25 border-slate-500/25"} rounded cursor-move`}
			style={{
				left: `${props.startFrame * props.frameWidth}px`,
				top: `${props.trackIndex * props.trackHeight}px`,
				width: `${props.duration * props.frameWidth}px`,
				height: `${props.trackHeight}px`,
			}}
			data-id={props.id}
			onPointerMove={handlePointerMove}
			onPointerDown={handlePointerDown}
		>
			<span className="absolute inset-1 flex items-center text-nowrap">
				Clip {props.id}
			</span>
			<div
				className="absolute top-0 right-0 h-full w-4 cursor-w-resize"
				onPointerMove={handleRightPointerMove}
			/>
		</div>
	);
};

export default Clip;
