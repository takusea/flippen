import { Menubar } from "radix-ui";
import type { ReactNode } from "react";

type Props = {
	label: string;
	children: ReactNode;
};

const MenubarMenu: React.FC<Props> = (props) => {
	return (
		<Menubar.Menu>
			<Menubar.Trigger className="flex items-center justify-between rounded-md h-8 px-3 font-medium data-[highlighted]:bg-gray-300 data-[state=open]:bg-gray-300 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
				{props.label}
			</Menubar.Trigger>
			<Menubar.Portal>
				<Menubar.Content
					className="min-w-[220px] border border-gray-200 rounded-xl bg-white p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[transform,opacity]"
					align="start"
					sideOffset={5}
					alignOffset={-3}
				>
					{props.children}
				</Menubar.Content>
			</Menubar.Portal>
		</Menubar.Menu>
	);
};

export default MenubarMenu;
