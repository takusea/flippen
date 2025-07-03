import * as SliderPrimitive from "@radix-ui/react-slider";

export type Props = React.ComponentProps<typeof SliderPrimitive.Root>;

const Slider: React.FC<Props> = (props) => {
	return (
		<SliderPrimitive.Root
			className="relative flex items-center h-8 touch-none select-none"
			{...props}
		>
			<SliderPrimitive.Track className="relative h-2 grow rounded-full border border-zinc-500/25 bg-zinc-500/25">
				<SliderPrimitive.Range className="absolute h-full rounded-full bg-teal-500" />
			</SliderPrimitive.Track>
			<SliderPrimitive.Thumb className="block size-4 rounded-full border border-zinc-500/25 bg-white shadow-md" />
		</SliderPrimitive.Root>
	);
};

export default Slider;
