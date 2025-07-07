import { useState } from "react";
import Slider from "../base/Slider";
import { hsvaToRgba, type HSVAColor } from "../util/color";
import ColorPicker from "../feature/ColorPicker";

type Props = {
	currentTool: string;
	currentColor: HSVAColor;
	onCurrentColorChange: (color: HSVAColor) => void;
	onCurrentSizeChange: (size: number) => void;
};

const Inspector: React.FC<Props> = (props) => {
	const [currentSize, setCurrentSize] = useState<number>(5);

	const rgbaColor = hsvaToRgba(props.currentColor);
	const hsvaColor = {
		h: Math.round(props.currentColor.h),
		s: Math.round(props.currentColor.s * 100),
		v: Math.round(props.currentColor.v * 100),
		a: props.currentColor.a,
	};

	return (
		<div className="flex flex-col gap-4">
			<h2 className="font-bold">
				Property of {props.currentTool.toUpperCase()} Tool
			</h2>
			<div>
				<div className="flex gap-1 justify-between">
					<span>Brush Size</span>
					<span>{currentSize}</span>
				</div>
				<Slider
					min={1}
					max={100}
					value={[currentSize]}
					onValueChange={(value) => {
						setCurrentSize(value[0]);
						props.onCurrentSizeChange(currentSize);
					}}
				/>
			</div>
			<h2 className="font-bold">ColorPicker</h2>
			<ColorPicker
				currentColor={props.currentColor}
				onCurrentColorChange={props.onCurrentColorChange}
			/>
			<div className="flex gap-2">
				<div
					className="relative w-8 h-8 rounded border border-zinc-500/25 bg-[url(/transparent.png)] before:content-[''] before:rounded-sm before:absolute before:inset-1 before:bg-[--color] before:z-10"
					style={
						{
							"--color": `rgb(${rgbaColor.r} ${rgbaColor.g} ${rgbaColor.b} / ${rgbaColor.a / 255})`,
						} as React.CSSProperties
					}
				/>
				<div className="flex flex-col gap-1 font-mono">
					<span>
						h{hsvaColor.h} / s{hsvaColor.s} / v{hsvaColor.v}
					</span>
					<span>
						r{rgbaColor.r} / g{rgbaColor.g} / b{rgbaColor.b}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Inspector;
