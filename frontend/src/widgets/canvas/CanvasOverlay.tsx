import type { CSSProperties } from "react";

type Selection = { x: number; y: number; width: number; height: number };

type Props = {
	width: number;
	height: number;
	transform: CSSProperties;
	selection?: Selection;
	isGridVisible: boolean;
};

export const CanvasOverlay: React.FC<Props> = ({
	width,
	height,
	transform,
	selection,
	isGridVisible,
}) => (
	<>
		<div
			aria-hidden="true"
			className="pointer-events-none absolute left-0 top-0"
			style={{
				width,
				height,
				...transform,
				transformOrigin: "center",
			}}
		>
			{selection != null && (
				<div
					className="absolute border border-dashed border-teal-500 bg-teal-500/10"
					style={{
						left: selection.x,
						top: selection.y,
						width: selection.width,
						height: selection.height,
					}}
				/>
			)}
		</div>
		{isGridVisible && (
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0"
				style={{
					width,
					height,
					...transform,
					backgroundImage:
						"linear-gradient(to right, rgb(0 0 0 / 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.25) 1px, transparent 1px)",
					backgroundSize: "16px 16px",
				}}
			/>
		)}
	</>
);
