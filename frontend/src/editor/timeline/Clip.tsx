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

const Clip = ({
	id,
	name,
	layerHeight,
	frameWidth,
	startFrame,
	duration,
	layerIndex,
	isSelected,
	isHidden,
	isLocked,
	onSelect,
	onMove,
	onDurationChange,
	onInteractionStart,
	onInteractionEnd,
}: Props) => {
	const [startPosX, setStartPosX] = useState(0);
	const isInteracting = useRef(false);

	const startInteraction = () => {
		if (isInteracting.current) return;
		isInteracting.current = true;
		onInteractionStart();
	};

	const endInteraction = () => {
		if (!isInteracting.current) return;
		isInteracting.current = false;
		onInteractionEnd();
	};

	const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		event.stopPropagation();
		if (!(event.buttons & 1)) return;

		onSelect();

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
			(event.clientX - rect.left - startPosX) / frameWidth,
		);
		const layerIndex = Math.floor((event.clientY - rect.top) / layerHeight);

		onMove(
			Math.max(0, startFrame + startFrame),
			Math.max(0, layerIndex + layerIndex),
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
		const duration = Math.floor((event.clientX - rect.left) / frameWidth);

		onDurationChange(Math.max(1, duration + duration));
	};

	return (
		<div
			key={id}
			className={`absolute grid grid-cols-[1fr_8px] items-stretch rounded border overflow-hidden ${isSelected ? "bg-primary/25 border-primary" : "bg-zinc-500/25 border-zinc-500/40"} ${isHidden ? "opacity-40" : ""} ${isLocked ? "cursor-not-allowed" : ""}`}
			style={{
				left: `${startFrame * frameWidth}px`,
				top: `${layerIndex * layerHeight}px`,
				width: `${duration * frameWidth}px`,
				height: `${layerHeight}px`,
			}}
			onPointerDown={handlePointerDown}
			onPointerUp={endInteraction}
			onPointerCancel={endInteraction}
			onLostPointerCapture={endInteraction}
		>
			<div className="absolute h-full flex items-center text-nowrap pointer-events-none px-1">
				{name}
			</div>
			<div
				className={isLocked ? "" : "cursor-move"}
				onPointerMove={isLocked ? undefined : handlePointerMove}
			/>
			<div
				className={isLocked ? "" : "cursor-w-resize"}
				onPointerMove={isLocked ? undefined : handleRightPointerMove}
			/>
		</div>
	);
};

export default Clip;
