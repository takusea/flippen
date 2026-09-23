import type { TablerIcon } from "@tabler/icons-react";
import Tooltip from "./Tooltip";

type Size = "small" | "medium" | "large";
type Variant = "default" | "primary";

type Props = Omit<React.ComponentProps<"button">, "className" | "type"> & {
	label: string;
	icon: TablerIcon;
	variant?: Variant;
	size?: Size;
	toolTipSide?: "top" | "right" | "bottom" | "left";
};

const IconButton: React.FC<Props> = ({
	label,
	icon: Icon,
	variant,
	size,
	toolTipSide,
	...props
}) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "p-1";
		}
		if (size === "large") {
			return "p-3";
		}
		return "p-2";
	};

	const color = (variant: Variant | undefined) => {
		if (variant === "primary") {
			return "text-white bg-teal-500 hover:bg-teal-600";
		}
		return "hover:bg-zinc-500/15";
	};

	return (
		<Tooltip label={label} side={toolTipSide ?? "top"}>
			<button
				type="button"
				className={`flex items-center justify-center rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${padding(size)} ${color(variant)}`}
				aria-label={label}
				{...props}
			>
				<Icon />
			</button>
		</Tooltip>
	);
};

export default IconButton;
