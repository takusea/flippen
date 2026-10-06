import { useRef, useState } from "react";

type Props = {
	id: string;
	name: string;
	layerHeight: number;
	frameWidth: number;
	startFrame: number;
	duration: number;
	layerIndex: number;
	isSelected: boolean;
	isHidden: boolean;
	isLocked: boolean;
	onSelect: () => void;
	onMove: (startFrame: number, layerIndex: number) => void;
	onDurationChange: (duration: number) => void;
	onInteractionStart: () => void;
	onInteractionEnd: () => void;
};

const Clip: React.FC<Props> = (props) => {
	const [startPosX, setStartPosX] = useState(0);
	const isInteracting = useRef(false);

	const startInteraction = () => {
		if (isInteracting.current) return;
		isInteracting.current = true;
		props.onInteractionStart();
	};

	const endInteraction = () => {
		if (!isInteracting.current) return;
		isInteracting.current = false;
		props.onInteractionEnd();
	};

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
		startInteraction();
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const startFrame = Math.floor(
			(event.clientX - rect.left - startPosX) / props.frameWidth,
		);
		const layerIndex = Math.floor(
			(event.clientY - rect.top) / props.layerHeight,
		);

		props.onMove(
			Math.max(0, props.startFrame + startFrame),
			Math.max(0, props.layerIndex + layerIndex),
		);
	};

	const handleRightPointerMove = (
		event: React.PointerEvent<HTMLDivElement>,
	) => {
		event.stopPropagation();
		if (!(event.buttons & 1)) return;
		startInteraction();
		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const duration = Math.floor((event.clientX - rect.left) / props.frameWidth);

		props.onDurationChange(Math.max(1, props.duration + duration));
	};

	return (
		<div
			key={props.id}
			className={`absolute grid grid-cols-[1fr_8px] items-stretch rounded border overflow-hidden ${props.isSelected ? "bg-teal-400/25 border-teal-400 border-2" : "bg-zinc-500/25 border-zinc-500/25"} ${props.isHidden ? "opacity-40" : ""} ${props.isLocked ? "cursor-not-allowed" : ""}`}
			style={{
				left: `${props.startFrame * props.frameWidth}px`,
				top: `${props.layerIndex * props.layerHeight}px`,
				width: `${props.duration * props.frameWidth}px`,
				height: `${props.layerHeight}px`,
			}}
			onPointerDown={handlePointerDown}
			onPointerUp={endInteraction}
			onPointerCancel={endInteraction}
			onLostPointerCapture={endInteraction}
		>
			<div className="absolute h-full flex items-center text-nowrap pointer-events-none px-1">
				{props.name}
			</div>
			<div
				className={props.isLocked ? "" : "cursor-move"}
				onPointerMove={props.isLocked ? undefined : handlePointerMove}
			/>
			<div
				className={props.isLocked ? "" : "cursor-w-resize"}
				onPointerMove={props.isLocked ? undefined : handleRightPointerMove}
			/>
		</div>
	);
};

export default Clip;
