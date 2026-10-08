import type { TablerIcon } from "@tabler/icons-react";
import Tooltip from "./Tooltip";

type Size = "small" | "medium" | "large";
type Variant = "default" | "primary";

type Props = Omit<React.ComponentProps<"button">, "className" | "type"> & {
	label: string;
	icon: TablerIcon;
	variant?: Variant;
	toolTipSide?: "top" | "right" | "bottom" | "left";
	shortcut?: string;
	size?: Size;
};

const IconButton: React.FC<Props> = ({
	label,
	icon: Icon,
	variant,
	toolTipSide,
	shortcut,
	...props
}) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "";
		}
		if (size === "large") {
			return "p-2";
		}
		return "p-1";
	};

	const color = (variant: Variant | undefined) => {
		if (variant === "primary") {
			return "text-white bg-teal-500 hover:not-disabled:bg-teal-600";
		}
		return "hover:not-disabled:bg-zinc-500/20";
	};

	return (
		<Tooltip label={label} shortcut={shortcut} side={toolTipSide ?? "top"}>
			<button
				type="button"
				className={`flex items-center justify-center rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${padding(props.size)} ${color(variant)}`}
				aria-label={label}
				{...props}
			>
				<Icon />
			</button>
		</Tooltip>
	);
};

export default IconButton;
