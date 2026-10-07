import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import * as SelectPrimitive from "radix-ui/select";

type Props = React.ComponentProps<typeof SelectPrimitive.Root> & {
	id?: string;
	label?: string;
	placeholder?: string;
};

const Select: React.FC<Props> = ({ children, placeholder, ...props }) => {
	return (
		<SelectPrimitive.Root {...props}>
			<SelectPrimitive.Trigger
				className="h-8 px-2 border border-zinc-500/40 bg-white/50 dark:bg-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 rounded-md flex gap-1 justify-between items-center not-disabled:cursor-pointer disabled:opacity-50"
				aria-label={props.label}
				id={props.id}
			>
				<SelectPrimitive.Value placeholder={placeholder} />
				<SelectPrimitive.Icon className="SelectIcon">
					<IconChevronDown />
				</SelectPrimitive.Icon>
			</SelectPrimitive.Trigger>
			<SelectPrimitive.Portal>
				<SelectPrimitive.Content
					position="popper"
					sideOffset={5}
					className="overflow-hidden rounded-xl p-2 border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl shadow-lg w-(--radix-select-trigger-width) max-h-(--radix-select-content-available-height)"
				>
					<SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center">
						<IconChevronUp />
					</SelectPrimitive.ScrollUpButton>
					<SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
					<SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center">
						<IconChevronDown />
					</SelectPrimitive.ScrollDownButton>
				</SelectPrimitive.Content>
			</SelectPrimitive.Portal>
		</SelectPrimitive.Root>
	);
};

export default Select;
