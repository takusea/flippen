import type { TablerIcon } from "@tabler/icons-react";

type Size = "small" | "medium" | "large";

type Props = {
	label: string;
	icon: TablerIcon;
	onClick?: () => void;
	disabled?: boolean;
	size?: Size;
};

const IconButton: React.FC<Props> = (props) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "p-1";
		}
		if (size === "large") {
			return "p-3";
		}
		return "p-2";
	};

	return (
		<button
			type="button"
			onClick={props.onClick}
			className={`flex items-center justify-center rounded-md text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${padding(props.size)}`}
			disabled={props.disabled}
			aria-label={props.label}
		>
			<props.icon />
		</button>
	);
};

export default IconButton;
