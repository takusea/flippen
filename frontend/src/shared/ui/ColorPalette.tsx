import { type HSVAColor, hsvaToRgba } from "~/shared/lib/color";

type Props = {
	currentColor: HSVAColor;
	colorHistory: HSVAColor[];
	onCurrentColorChange: (color: HSVAColor) => void;
};

const ColorPalette: React.FC<Props> = (props) => {
	const colorHistory = new Map<string, HSVAColor>();
	for (const color of props.colorHistory) {
		colorHistory.set(`${color.h}:${color.s}:${color.v}:${color.a}`, color);
	}

	return (
		<div>
			<div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(16px,1fr))]">
				{Array.from(colorHistory, ([key, color]) => {
					const rgbaColor = hsvaToRgba(color);
					return (
						<button
							type="button"
							key={key}
							className="aspect-square rounded cursor-pointer border border-zinc-500/25 bg-(--color)"
							style={
								{
									"--color": `rgb(${rgbaColor.r} ${rgbaColor.g} ${rgbaColor.b} / ${rgbaColor.a / 255})`,
								} as React.CSSProperties
							}
							onClick={() => props.onCurrentColorChange(color)}
						/>
					);
				})}
			</div>
		</div>
	);
};

export default ColorPalette;
