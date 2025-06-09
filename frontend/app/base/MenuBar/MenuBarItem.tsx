import { Menubar } from "radix-ui";

type Props = {
	label: string;
	shortcut?: string;
};

const MenuBarRoot: React.FC<Props> = (props) => {
	return (
		<Menubar.Item className="relative flex h-8 items-center rounded-md px-2.5 text-violet11 outline-none cursor-pointer hover:bg-gray-200 data-[highlighted]:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
			{props.label}
			<div className="ml-auto pl-5">{props.shortcut}</div>
		</Menubar.Item>
	);
};

export default MenuBarRoot;
