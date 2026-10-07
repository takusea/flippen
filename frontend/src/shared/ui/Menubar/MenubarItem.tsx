import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.Item> & {
	label: string;
	shortcut?: string;
};

const MenubarItem: React.FC<Props> = (props) => {
	return (
		<Menubar.Item
			className="relative grid grid-cols-[24px_auto_auto] gap-1 pl-1 pr-2 h-8 items-center rounded-md cursor-pointer hover:not-disabled:bg-zinc-500/20 data-highlighted:bg-zinc-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
			{...props}
		>
			<div />
			{props.label}
			<div className="ml-auto pl-5 opacity-50">{props.shortcut}</div>
		</Menubar.Item>
	);
};

export default MenubarItem;
