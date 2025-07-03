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
						className="z-50 select-none rounded-md p-2 leading-none border border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 shadow-md backdrop-blur-xl"
						sideOffset={5}
					>
						{props.label}
						<TooltipPrimitive.Arrow className="fill-white/90 dark:fill-zinc-950/90 mt-[-1px]" />
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
};

export default Tooltip;
