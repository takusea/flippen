import { Menubar } from "radix-ui";
import type { ReactNode } from "react";

type Props = {
	label: string;
	children: ReactNode;
};

const MenubarMenu: React.FC<Props> = (props) => {
	return (
		<Menubar.Menu>
			<Menubar.Trigger className="flex items-center justify-between rounded-md h-8 px-2 font-medium data-[highlighted]:bg-zinc-500/25 data-[state=open]:bg-zinc-500/25 hover:bg-zinc-500/15 disabled:opacity-50 disabled:cursor-not-allowed">
				{props.label}
			</Menubar.Trigger>
			<Menubar.Portal>
				<Menubar.Content
					className="z-50 min-w-[220px] p-2 rounded-xl border border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 shadow-lg backdrop-blur-xl"
					align="start"
					sideOffset={4}
					alignOffset={-4}
				>
					{props.children}
				</Menubar.Content>
			</Menubar.Portal>
		</Menubar.Menu>
	);
};

export default MenubarMenu;
