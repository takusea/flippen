import type { TablerIcon } from "@tabler/icons-react";

type Size = "small" | "medium" | "large";
type Variant = "default" | "primary";

type Props = Omit<React.ComponentProps<"button">, "className" | "type"> & {
	label: string;
	icon?: TablerIcon;
	variant?: Variant;
	size?: Size;
};

const Button: React.FC<Props> = (props) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "h-6 px-1";
		}
		if (size === "large") {
			return "h-12 px-3";
		}
		return "h-8 px-2";
	};

	const color = (variant: Variant | undefined) => {
		if (variant === "primary") {
			return "text-white bg-teal-500 hover:not-disabled:bg-teal-600";
		}
		return "hover:not-disabled:bg-zinc-500/20";
	};

	return (
		<button
			type="button"
			className={`grid grid-cols-[auto_1fr] items-center justify-center gap-1 rounded-md font-semibold cursor-pointer text-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${padding(props.size)} ${color(props.variant)}`}
			{...props}
		>
			{props.icon && <props.icon />}
			<div className="overflow-hidden text-ellipsis">{props.label}</div>
		</button>
	);
};

export default Button;
