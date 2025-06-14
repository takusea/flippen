import { useState } from "react";
import ColorPicker from "./ColorPicker";
import type { HSVAColor } from "../util/color";

type Props = {
	currentTool: string;
	currentColor: HSVAColor;
	onCurrentColorChange: (color: HSVAColor) => void;
	onCurrentSizeChange: (size: number) => void;
};

const Inspector: React.FC<Props> = (props) => {
	const [currentSize, setCurrentSize] = useState<number>(5);

	return (
		<div className="absolute h-full right-0 border-l border-gray-200 p-4 bg-white/50 backdrop-blur-md flex flex-col">
			Property of {props.currentTool.toUpperCase()} Tool
			<input
				type="range"
				min={1}
				max={100}
				value={currentSize}
				onChange={(event) => {
					setCurrentSize(Number.parseInt(event.currentTarget.value));
					props.onCurrentSizeChange(currentSize);
				}}
			/>
			{currentSize}
			<ColorPicker
				currentColor={props.currentColor}
				onCurrentColorChange={props.onCurrentColorChange}
			/>
		</div>
	);
};

export default Inspector;
