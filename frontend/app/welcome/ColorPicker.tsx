import type { HSVAColor } from "~/util/color";

type Props = {
	currentColor: HSVAColor;
	onCurrentColorChange: (color: HSVAColor) => void;
};

const ColorPicker: React.FC<Props> = (props) => {
	const handleHueMove = (event: React.PointerEvent) => {
		if (event.buttons === 0) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event?.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left - event.currentTarget.clientWidth / 2;
		const y = event.clientY - rect.top - event.currentTarget.clientHeight / 2;
		const angle = (Math.atan2(y, x) * 180) / Math.PI;

		props.onCurrentColorChange({
			...props.currentColor,
			h: (angle + 360) % 360,
		});
	};

	const handleSLMove = (event: React.PointerEvent) => {
		if (event.buttons === 0) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		const rect = event.currentTarget.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		const s = Math.max(0, Math.min(x / event.currentTarget.clientWidth, 1));
		const v = Math.max(
			0,
			Math.min(1 - y / event.currentTarget.clientHeight, 1),
		);

		props.onCurrentColorChange({
			...props.currentColor,
			s,
			v,
		});
	};

	return (
		<div
			style={{ "--hue": props.currentColor.h } as React.CSSProperties}
			className="relative w-full h-auto aspect-square p-[32px]"
		>
			<div
				className="absolute inset-0 rounded-full [background-image:conic-gradient(in_hsl,hsl(60_100%_50%),hsl(180_100%_50%),hsl(330_100%_50%),hsl(420_100%_50%))] [mask-image:radial-gradient(transparent,transparent_60%,white_61%,white)]"
				onPointerMove={handleHueMove}
			/>
			<div
				style={{
					top: `${50 + Math.sin(props.currentColor.h / 57) * 46}%`,
					left: `${50 + Math.cos(props.currentColor.h / 57) * 46}%`,
				}}
				className="pointer-events-none absolute translate-x-[-50%] translate-y-[-50%] w-2 h-2 border border-black shadow-inner shadow-white rounded-full"
			/>
			<div
				className="relative w-full h-full [background-image:linear-gradient(to_bottom,#fff0_0%,#000_100%),linear-gradient(to_right,#fff_0%,hsl(var(--hue)_100%_50%)_100%)]"
				onPointerMove={handleSLMove}
			>
				<div
					style={{
						bottom: `${props.currentColor.v * 100}%`,
						left: `${props.currentColor.s * 100}%`,
					}}
					className="pointer-events-none absolute translate-x-[-50%] translate-y-[50%] w-2 h-2 border border-black shadow-inner shadow-white rounded-full"
				/>
			</div>
		</div>
	);
};

export default ColorPicker;
