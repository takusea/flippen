import { IconFileExport } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import Button from "~/shared/ui/Button";
import Tooltip from "~/shared/ui/Tooltip";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import GlobalMenubar from "./Menubar";

type Props = {
	children: ReactNode;
};

const GlobalNavigation: React.FC<Props> = (props: Props) => {
	const { t } = useI18n();
	const project = useProject();
	const projectDialogs = useProjectDialogs();
	const canvasView = useCanvasView();

	return (
		<div className="grid grid-rows-[40px_1fr] w-svw h-svh bg-zinc-100 dark:bg-zinc-950">
			<header className="relative row-span-1 col-span-full flex items-center justify-between">
				<div className="flex items-center justify-between w-full px-2 gap-2">
					<div className="flex items-center gap-1">
						<img src="/favicon.png" width={24} height={24} alt="" />
						<GlobalMenubar canvasView={canvasView} />
					</div>
					<Button label={t("nav.export")} icon={IconFileExport} variant="primary" />
				</div>
				<div className="absolute inset-0 w-fit h-fit m-auto">
					<Tooltip label={t("nav.projectSettings")} side="bottom">
						<Button
							label={project.settings?.title ?? t("nav.untitled")}
							onClick={projectDialogs.openEditProjectSettingsDialog}
						/>
					</Tooltip>
				</div>
			</header>
			<div className="relative z-0 overflow-hidden row-span-1 col-span-1 border-t border-zinc-500/25 bg-white dark:bg-zinc-900">
				{props.children}
			</div>
		</div>
	);
};

export default GlobalNavigation;
