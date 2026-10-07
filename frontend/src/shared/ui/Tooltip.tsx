import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type Props = React.ComponentProps<typeof TooltipPrimitive.Root> & {
	label: string;
	shortcut?: string;
	side: "top" | "right" | "bottom" | "left";
};

const Tooltip: React.FC<Props> = ({
	label,
	shortcut,
	side,
	children,
	...props
}) => {
	return (
		<TooltipPrimitive.Root {...props}>
			<TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
			<TooltipPrimitive.Portal>
				<TooltipPrimitive.Content
					className="z-50 select-none rounded-md p-2 leading-none border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 shadow-md backdrop-blur-xl"
					sideOffset={5}
					side={side}
				>
					<span className="flex items-center gap-2">
						<span>{label}</span>
						{shortcut && <span className="opacity-50">{shortcut}</span>}
					</span>
					<TooltipPrimitive.Arrow className="fill-white/90 dark:fill-zinc-950/90 -mt-px" />
				</TooltipPrimitive.Content>
			</TooltipPrimitive.Portal>
		</TooltipPrimitive.Root>
	);
};

export default Tooltip;
