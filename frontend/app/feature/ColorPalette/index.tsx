import { hsvaToRgba, type HSVAColor } from "~/util/color";

type Props = {
	currentColor: HSVAColor;
	colorHistory: HSVAColor[];
	onCurrentColorChange: (color: HSVAColor) => void;
};

const ColorPalette: React.FC<Props> = (props) => {
	return (
		<div>
			<div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(16px,1fr))]">
				{props.colorHistory?.map((color, index) => {
					const rgbaColor = hsvaToRgba(color);
					return (
						<button
							type="button"
							key={index}
							className="aspect-square rounded cursor-pointer border border-zinc-500/25 bg-[var(--color)]"
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
