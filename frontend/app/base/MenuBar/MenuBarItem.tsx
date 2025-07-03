import { Menubar } from "radix-ui";

type Props = {
	label: string;
	shortcut?: string;
};

const MenuBarRoot: React.FC<Props> = (props) => {
	return (
		<Menubar.Item className="relative flex h-8 items-center rounded-md px-2 cursor-pointer hover:bg-slate-500/15 data-[highlighted]:bg-slate-500/15 disabled:opacity-50 disabled:cursor-not-allowed">
			{props.label}
			<div className="ml-auto pl-5">{props.shortcut}</div>
		</Menubar.Item>
	);
};

export default MenuBarRoot;
