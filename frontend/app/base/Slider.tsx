import * as SliderPrimitive from "@radix-ui/react-slider";

export type Props = React.ComponentProps<typeof SliderPrimitive.Root>;

const Slider: React.FC<Props> = (props) => {
	return (
		<SliderPrimitive.Root
			className="relative flex h-8 w-[200px] touch-none select-none items-center"
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 grow rounded-full bg-black/20">
				<SliderPrimitive.Range className="absolute h-full rounded-full bg-teal-500" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb
				className="block size-5 rounded-[10px] bg-white shadow-md shadow-black/10 border border-gray-300"
				aria-label="Volume"
			/>
		</SliderPrimitive.Root>
	);
};

export default Slider;
