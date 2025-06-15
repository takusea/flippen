import type { TablerIcon } from "@tabler/icons-react";

type Size = "small" | "medium" | "large";
type Variant = "default" | "primary";

type Props = Omit<React.ComponentProps<"button">, "className" | "type"> & {
	label: string;
	icon?: TablerIcon;
	variant?: Variant;
	size?: Size;
};

const IconButton: React.FC<Props> = (props) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "h-4 px-1";
		}
		if (size === "large") {
			return "h-6 px-3";
		}
		return "h-8 px-2";
	};

	const color = (variant: Variant | undefined) => {
		if (variant === "primary") {
			return "text-white bg-teal-500 hover:bg-teal-600";
		}
		return "text-gray-700 hover:bg-gray-200";
	};

	return (
		<button
			type="button"
			className={`flex items-center justify-center gap-1 rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${padding(props.size)} ${color(props.variant)}`}
			{...props}
		>
			{props.icon && <props.icon />}
			{props.label}
		</button>
	);
};

export default IconButton;
