import {
	IconEdit,
	IconFileExport,
	IconHome,
	IconLibrary,
	IconSettings,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import Button from "~/base/Button";
import IconButton from "~/base/IconButton";
import MenuBarItem from "~/base/MenuBar/MenuBarItem";
import MenuBarMenu from "~/base/MenuBar/MenuBarMenu";
import MenuBarRoot from "~/base/MenuBar/MenuBarRoot";

type Props = {
	children: ReactNode;
};

const GlobalNavigation: React.FC<Props> = (props: Props) => {
	return (
		<div className="grid grid-rows-[40px_1fr] grid-cols-[64px_1fr] w-svw h-svh bg-slate-100 dark:bg-slate-950">
			<header className="relative row-span-1 col-span-full flex items-center justify-between">
				<div className="flex items-center justify-between w-full px-2 gap-2">
					<div className="flex items-center gap-1">
						<img src="/favicon.png" width={24} height={24} alt="" />
						<MenuBarRoot>
							<MenuBarMenu label="File">
								<MenuBarItem label="New Project" shortcut="Ctrl+N" />
								<MenuBarItem label="Open" shortcut="Ctrl+O" />
								<MenuBarItem label="Save" shortcut="Ctrl+S" />
								<MenuBarItem label="Save with..." shortcut="Ctrl+Shift+S" />
								<MenuBarItem label="Close" />
							</MenuBarMenu>
							<MenuBarMenu label="Edit">
								<MenuBarItem label="Undo" shortcut="Ctrl+Z" />
								<MenuBarItem label="Redo" shortcut="Ctrl+Shift+Z" />
								<MenuBarItem label="Cut" shortcut="Ctrl+X" />
								<MenuBarItem label="Copy" shortcut="Ctrl+C" />
								<MenuBarItem label="Paste" shortcut="Ctrl+V" />
								<MenuBarItem label="Select All" shortcut="Ctrl+A" />
							</MenuBarMenu>
							<MenuBarMenu label="View">
								<MenuBarItem label="test" shortcut="Ctrl+S" />
							</MenuBarMenu>
							<MenuBarMenu label="Setting">
								<MenuBarItem label="test" shortcut="Ctrl+S" />
							</MenuBarMenu>
							<MenuBarMenu label="Help">
								<MenuBarItem label="test" shortcut="Ctrl+S" />
							</MenuBarMenu>
						</MenuBarRoot>
					</div>
					<Button label="Export" icon={IconFileExport} variant="primary" />
				</div>
				<h1 className="absolute inset-0 w-fit h-fit m-auto">untitled.flip</h1>
			</header>
			<nav className="row-span-2 col-span-1 flex flex-col items-center gap-1 pb-2 px-2">
				<IconButton label="Home" icon={IconHome} size="large" />
				<IconButton label="Library" icon={IconLibrary} size="large" />
				<IconButton label="Edit" icon={IconEdit} size="large" />
				<div className="h-px w-full mt-auto bg-slate-500/25" />
				<IconButton label="Settings" icon={IconSettings} size="large" />
			</nav>
			<div className="z-0 row-span-1 col-span-1 rounded-tl-xl bg-white dark:bg-slate-900 border-t border-l border-slate-500/25">
				{props.children}
			</div>
		</div>
	);
};

export default GlobalNavigation;
