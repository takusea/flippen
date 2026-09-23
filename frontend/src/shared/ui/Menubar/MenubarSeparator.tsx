import { Menubar } from "radix-ui";

const MenubarSeparator: React.FC = () => {
	return (
		<Menubar.Separator className="relative w-full h-px my-2 bg-zinc-500/25" />
	);
};

export default MenubarSeparator;
