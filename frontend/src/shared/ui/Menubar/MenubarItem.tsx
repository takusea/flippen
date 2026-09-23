import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.Item> & {
	label: string;
	shortcut?: string;
};

const MenubarRoot: React.FC<Props> = (props) => {
	return (
		<Menubar.Item
			className="relative flex h-8 items-center rounded-md px-2 cursor-pointer hover:bg-zinc-500/15 data-[highlighted]:bg-zinc-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
			{...props}
		>
			{props.label}
			<div className="ml-auto pl-5 opacity-50">{props.shortcut}</div>
		</Menubar.Item>
	);
};

export default MenubarRoot;
