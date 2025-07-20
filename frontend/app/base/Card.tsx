import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

const Card: React.FC<Props> = (props) => {
	return (
		<div className="p-4 border-l-2 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-xl">
			{props.children}
		</div>
	);
};

export default Card;
