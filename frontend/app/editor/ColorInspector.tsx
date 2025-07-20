import Card from "~/base/Card";
import ColorPicker from "~/feature/ColorPicker";
import { type HSVAColor, hsvaToRgba } from "~/util/color";

type Props = {
	currentColor: HSVAColor;
	onCurrentColorChange: (color: HSVAColor) => void;
};

const ColorInspector: React.FC<Props> = (props) => {
	const rgbaColor = hsvaToRgba(props.currentColor);
	const hsvaColor = {
		h: Math.round(props.currentColor.h),
		s: Math.round(props.currentColor.s * 100),
		v: Math.round(props.currentColor.v * 100),
		a: props.currentColor.a,
	};

	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">ColorPicker</h2>
				<ColorPicker
					currentColor={props.currentColor}
					onCurrentColorChange={props.onCurrentColorChange}
				/>
				<div className="flex gap-2">
					<div
						className="relative w-8 h-8 rounded border border-zinc-500/25 bg-[url(/transparent.png)] before:content-[''] before:rounded-sm before:absolute before:inset-1 before:bg-[var(--color)] before:z-10"
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
		</Card>
	);
};

export default ColorInspector;
