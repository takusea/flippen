declare module "gifenc" {
	type Palette = number[][];

	type GifEncoder = {
		writeFrame: (
			index: Uint8Array,
			width: number,
			height: number,
			options: {
				palette: Palette;
				delay: number;
				repeat?: number;
				transparent?: boolean;
				transparentIndex?: number;
			},
		) => void;
		finish: () => void;
		bytes: () => Uint8Array;
	};

	const gifenc: {
		GIFEncoder: () => GifEncoder;
		quantize: (
			rgba: Uint8ClampedArray,
			maxColors: number,
			options: { format: "rgba4444"; oneBitAlpha: boolean },
		) => Palette;
		applyPalette: (
			rgba: Uint8ClampedArray,
			palette: Palette,
			format: "rgba4444",
		) => Uint8Array;
	};

	export default gifenc;
}
