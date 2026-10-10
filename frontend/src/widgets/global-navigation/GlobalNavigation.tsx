import { IconFileExport } from "@tabler/icons-react";
import {
	Children,
	cloneElement,
	isValidElement,
	type ReactNode,
	useState,
} from "react";
import { useMediaQuery } from "usehooks-ts";
import { useI18n } from "~/features/i18n/useI18n";
import ProjectExportDialog from "~/features/project/ProjectExportDialog";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import { useProjectExport } from "~/features/project/useProjectExport";
import Button from "~/shared/ui/Button";
import IconButton from "~/shared/ui/IconButton";
import Tooltip from "~/shared/ui/Tooltip";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import GlobalMenubar from "./Menubar";

type Props = {
	children: ReactNode;
};

type EditorProps = {
	isOnionSkin?: boolean;
	onIsOnionSkinChange?: () => void;
};

const GlobalNavigation: React.FC<Props> = (props: Props) => {
	const isDesktop: boolean = useMediaQuery("(min-width: 720px)");
	const { t } = useI18n();
	const project = useProject();
	const projectDialogs = useProjectDialogs();
	const canvasView = useCanvasView();
	const {
		isDialogOpen,
		setDialogOpen,
		progress: exportProgress,
		exportAs,
	} = useProjectExport();
	const [isOnionSkin, setIsOnionSkin] = useState(false);
	const child = Children.only(
		props.children,
	) as React.ReactElement<EditorProps>;

	const ExportButton = isDesktop ? Button : IconButton;

	return (
		<div className="grid grid-rows-[48px_1fr] w-svw h-svh">
			<header className="relative grid grid-cols-[1fr_auto_1fr] items-center w-full px-2 gap-1">
				<GlobalMenubar
					canvasView={canvasView}
					isOnionSkin={isOnionSkin}
					onIsOnionSkinChange={() => setIsOnionSkin((prev) => !prev)}
				/>
				<div className="flex justify-center">
					{project.settings && (
						<Tooltip label={t("nav.projectSettings")} side="bottom">
							<Button
								label={project.settings.title}
								onClick={projectDialogs.openEditProjectSettingsDialog}
							/>
						</Tooltip>
					)}
				</div>
				<div className="flex justify-end min-w-max">
					<ExportButton
						label={
							exportProgress
								? t("nav.exportProgress", exportProgress)
								: t("nav.export")
						}
						icon={IconFileExport}
						variant="primary"
						disabled={project.settings == null || exportProgress != null}
						onClick={() => setDialogOpen(true)}
					/>
				</div>
			</header>
			<div className="relative z-0 overflow-hidden row-span-1 col-span-1 border-t border-zinc-500/40 bg-white dark:bg-zinc-900">
				{isValidElement(child)
					? cloneElement(child, {
							isOnionSkin,
							onIsOnionSkinChange: () => setIsOnionSkin((prev) => !prev),
						})
					: child}
			</div>
			<ProjectExportDialog
				open={isDialogOpen}
				onOpenChange={setDialogOpen}
				onExport={(format) => void exportAs(format)}
			/>
		</div>
	);
};

export default GlobalNavigation;
