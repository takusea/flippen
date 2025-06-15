import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export type Props = React.ComponentProps<typeof TooltipPrimitive.Root> & {
	label: string;
};

const Tooltip: React.FC<Props> = (props) => {
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root delayDuration={250} {...props}>
				<TooltipPrimitive.Trigger asChild>
					{props.children}
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						className="z-50 select-none rounded-md bg-white p-2 leading-none text-black border border-gray-200 shadow-md"
						sideOffset={5}
					>
						{props.label}
						<TooltipPrimitive.Arrow className="fill-white mt-[-1px]" />
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};

export default Tooltip;
