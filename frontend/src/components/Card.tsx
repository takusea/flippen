import type { ReactNode } from "react";

type Size = "small" | "medium" | "large";

type Props = {
	children: ReactNode;
	size?: Size;
};

const Card: React.FC<Props> = (props) => {
	const padding = (size: Size | undefined) => {
		if (size === "small") {
			return "p-2 rounded-xl";
		}
		if (size === "large") {
			return "p-8 rounded-3xl";
		}
		return "p-4 rounded-2xl";
	};

	return (
		<div
			className={`border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl ${padding(props.size)}`}
		>
			{props.children}
		</div>
	);
};

export default Card;
