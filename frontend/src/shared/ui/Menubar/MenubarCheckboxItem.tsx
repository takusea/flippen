import { IconCheck } from "@tabler/icons-react";
import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.CheckboxItem> & {
	label: string;
	shortcut?: string;
};

const MenubarCheckboxItem: React.FC<Props> = (props) => {
	return (
		<Menubar.CheckboxItem
			className="relative grid grid-cols-[24px_auto_auto] gap-1 pl-1 pr-2 h-8 items-center rounded-md cursor-pointer hover:bg-zinc-500/15 data-highlighted:bg-zinc-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
			{...props}
		>
			<div>
				<Menubar.ItemIndicator>
					<IconCheck />
				</Menubar.ItemIndicator>
			</div>
			{props.label}
			<div className="ml-auto pl-5 opacity-50">{props.shortcut}</div>
		</Menubar.CheckboxItem>
	);
};

export default MenubarCheckboxItem;
