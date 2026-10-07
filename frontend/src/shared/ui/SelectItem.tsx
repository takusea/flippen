import { IconCheck } from "@tabler/icons-react";
import * as SelectPrimitive from "radix-ui/select";
import { forwardRef } from "react";

type Props = React.ComponentProps<typeof SelectPrimitive.Item>;

const SelectItem: React.FC<Props> = forwardRef(
	({ children, ...props }, forwardedRef) => {
		return (
			<SelectPrimitive.Item
				{...props}
				className="flex items-center rounded-md h-8 p-2 px-8 data-disabled:opacity-50 data-disabled:pointer-events-none data-highlighted:bg-zinc-500/15 cursor-pointer"
				ref={forwardedRef}
			>
				<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
				<SelectPrimitive.ItemIndicator className="absolute left-1">
					<IconCheck />
				</SelectPrimitive.ItemIndicator>
			</SelectPrimitive.Item>
		);
	},
);

export default SelectItem;
