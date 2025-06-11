import { useState } from "react";

type Color = {
	r: number;
	g: number;
	b: number;
	a: number;
};

type Props = {
	currentTool: string;
	currentColor: Color;
	onCurrentColorChange: (color: Color) => void;
	onCurrentSizeChange: (size: number) => void;
};

const Inspector: React.FC<Props> = (props) => {
	const [currentSize, setCurrentSize] = useState<number>(5);
	const hexColor = (color) => {
		// 各成分を16進数に変換し、2桁になるようにゼロパディングします。
		const toHex = (c) => {
			const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
			return hex.length === 1 ? `0${hex}` : hex;
		};

		const rHex = toHex(color.r);
		const gHex = toHex(color.g);
		const bHex = toHex(color.b);

		return `#${rHex}${gHex}${bHex}`;
	};

	return (
		<div className="absolute h-full right-0 border-l border-gray-200 p-4 bg-white/50 backdrop-blur-md flex flex-col">
			Property of {props.currentTool.toUpperCase()} Tool
			<input
				type="color"
				value={hexColor(props.currentColor)}
				onChange={(e) => {
					const hex = e.currentTarget.value;
					const r = Number.parseInt(hex.slice(1, 3), 16);
					const g = Number.parseInt(hex.slice(3, 5), 16);
					const b = Number.parseInt(hex.slice(5, 7), 16);
					props.onCurrentColorChange({ r, g, b, a: 255 });
				}}
			/>
			<input
				type="range"
				min={1}
				max={100}
				value={currentSize}
				onChange={(e) => {
					setCurrentSize(e.currentTarget.value);
					props.onCurrentSizeChange(currentSize);
				}}
			/>
			{currentSize}
		</div>
	);
};

export default Inspector;
