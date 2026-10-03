import { IconFileExport } from "@tabler/icons-react";
import type { ReactNode } from "react";
import Button from "~/shared/ui/Button";
import GlobalMenubar from "./Menubar";

type Props = {
	children: ReactNode;
};

const GlobalNavigation: React.FC<Props> = (props: Props) => {
	return (
		<div className="grid grid-rows-[40px_1fr] w-svw h-svh bg-zinc-100 dark:bg-zinc-950">
			<header className="relative row-span-1 col-span-full flex items-center justify-between">
				<div className="flex items-center justify-between w-full px-2 gap-2">
					<div className="flex items-center gap-1">
						<img src="/favicon.png" width={24} height={24} alt="" />
						<GlobalMenubar />
					</div>
					<Button label="Export" icon={IconFileExport} variant="primary" />
				</div>
				<h1 className="absolute inset-0 w-fit h-fit m-auto">untitled.flip</h1>
			</header>
			<div className="relative z-0 overflow-hidden row-span-1 col-span-1 border-t border-l border-zinc-500/25 bg-white dark:bg-zinc-900">
				{props.children}
			</div>
		</div>
	);
};

export default GlobalNavigation;
