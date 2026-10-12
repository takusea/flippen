import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.Menu> & {
	label: string;
};

const MenubarMenu = ({ label, children, ...props }: Props) => {
	return (
		<Menubar.Menu {...props}>
			<Menubar.Trigger className="group cursor-pointer h-12 disabled:opacity-50 disabled:cursor-not-allowed">
				<div className="flex items-center justify-between rounded-md h-8 px-2 font-medium text-nowrap group-data-[state=open]:bg-zinc-500/20 group-hover:not-disabled:bg-zinc-500/20">
					{label}
				</div>
			</Menubar.Trigger>
			<Menubar.Portal>
				<Menubar.Content
					className="z-50 min-w-55 p-2 rounded-xl border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 shadow-lg backdrop-blur-xl"
					align="start"
					alignOffset={-8}
				>
					{children}
				</Menubar.Content>
			</Menubar.Portal>
		</Menubar.Menu>
	);
};

export default MenubarMenu;
