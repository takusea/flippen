import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useClip } from "~/features/clip/useClip";
import { useUndoStack } from "~/features/history/useUndoStack";
import LanguageSettingDialog from "~/features/i18n/LanguageSettingDialog";
import { useI18n } from "~/features/i18n/useI18n";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import MenubarItem from "~/shared/ui/Menubar/MenubarItem";
import MenubarMenu from "~/shared/ui/Menubar/MenubarMenu";
import MenubarRoot from "~/shared/ui/Menubar/MenubarRoot";
import MenubarSeparator from "~/shared/ui/Menubar/MenubarSeparator";
import type { useCanvasView } from "~/widgets/canvas/useCanvasView";

type Props = {
	canvasView: ReturnType<typeof useCanvasView>;
};

const GlobalMenubar: React.FC<Props> = ({ canvasView }) => {
	const { t } = useI18n();
	const [isLanguageSettingDialogOpen, setLanguageSettingDialogOpen] =
		useState(false);
	const undoStack = useUndoStack();
	const clipContext = useClip();
	const project = useProject();
	const projectDialogs = useProjectDialogs();
	const fitToView = () => {
		if (project.settings == null) {
			return;
		}
		const canvas = document.querySelector<HTMLCanvasElement>("#draw-canvas");
		const viewport = canvas?.parentElement?.getBoundingClientRect();
		if (canvas == null || viewport == null) {
			throw new Error("Cannot fit the view before the canvas is available.");
		}
		canvasView.fitToView(
			canvas.width,
			canvas.height,
			viewport.width,
			viewport.height,
		);
	};
	const toggleHorizontalFlip = () =>
		canvasView.setIsFlippedHorizontal((prev) => !prev);
	const toggleVerticalFlip = () =>
		canvasView.setIsFlippedVertical((prev) => !prev);
	const toggleGrid = () => canvasView.setIsGridVisible((prev) => !prev);
	const resetFlip = () => {
		canvasView.setIsFlippedHorizontal(false);
		canvasView.setIsFlippedVertical(false);
	};

	useHotkeys("ctrl+shift+equal", () => canvasView.zoom(1));
	useHotkeys("ctrl+minus", () => canvasView.zoom(-1));
	useHotkeys("ctrl+0", () => canvasView.setScale(1));
	useHotkeys("ctrl+shift+0", fitToView);
	useHotkeys("ctrl+alt+ArrowLeft", () => canvasView.rotate(-1));
	useHotkeys("ctrl+alt+ArrowRight", () => canvasView.rotate(1));
	useHotkeys("ctrl+alt+0", () => canvasView.setRotation(0));
	useHotkeys("ctrl+alt+h", toggleHorizontalFlip);
	useHotkeys("ctrl+alt+v", toggleVerticalFlip);
	useHotkeys("ctrl+alt+shift+f", resetFlip);
	useHotkeys("ctrl+alt+g", toggleGrid);

	return (
		<>
			<MenubarRoot>
				<MenubarMenu label={t("menubar.file")}>
					<MenubarItem
						label={t("menubar.new")}
						shortcut="Ctrl+N"
						onSelect={projectDialogs.openCreateProjectDialog}
					/>
					<MenubarItem
						label={t("menubar.open")}
						shortcut="Ctrl+O"
						onSelect={() => project.open()}
					/>
					<MenubarItem
						label={t("menubar.save")}
						shortcut="Ctrl+S"
						onSelect={() => project.save()}
					/>
					<MenubarItem
						label={t("menubar.saveWith")}
						shortcut="Ctrl+Shift+S"
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.projectSettings")}
						onSelect={projectDialogs.openEditProjectSettingsDialog}
					/>
					<MenubarSeparator />
					<MenubarItem label={t("menubar.close")} />
				</MenubarMenu>
				<MenubarMenu label={t("menubar.edit")}>
					<MenubarItem
						label={t("menubar.undo")}
						shortcut="Ctrl+Z"
						onSelect={() => undoStack.undo()}
					/>
					<MenubarItem
						label={t("menubar.redo")}
						shortcut="Ctrl+Shift+Z"
						onSelect={() => undoStack.redo()}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.cut")}
						shortcut="Ctrl+X"
						onSelect={clipContext.cut}
					/>
					<MenubarItem
						label={t("menubar.copy")}
						shortcut="Ctrl+C"
						onSelect={clipContext.copy}
					/>
					<MenubarItem
						label={t("menubar.paste")}
						shortcut="Ctrl+V"
						onSelect={clipContext.paste}
					/>
					<MenubarItem
						label={t("menubar.selectAll")}
						shortcut="Ctrl+A"
						onSelect={clipContext.selectAll}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.view")}>
					<MenubarItem
						label={t("menubar.zoomIn")}
						shortcut="Ctrl++"
						onSelect={() => canvasView.zoom(1)}
					/>
					<MenubarItem
						label={t("menubar.zoomOut")}
						shortcut="Ctrl+-"
						onSelect={() => canvasView.zoom(-1)}
					/>
					<MenubarItem
						label={t("menubar.fitView")}
						shortcut="Ctrl+Shift+0"
						disabled={project.settings == null}
						onSelect={fitToView}
					/>
					<MenubarItem
						label={t("menubar.resetZoom")}
						shortcut="Ctrl+0"
						onSelect={() => canvasView.setScale(1)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.rotateLeft")}
						shortcut="Ctrl+Alt+←"
						onSelect={() => canvasView.rotate(-1)}
					/>
					<MenubarItem
						label={t("menubar.rotateRight")}
						shortcut="Ctrl+Alt+→"
						onSelect={() => canvasView.rotate(1)}
					/>
					<MenubarItem
						label={t("menubar.resetRotate")}
						shortcut="Ctrl+Alt+0"
						onSelect={() => canvasView.setRotation(0)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.flipHorizontal")}
						shortcut="Ctrl+Alt+H"
						onSelect={toggleHorizontalFlip}
					/>
					<MenubarItem
						label={t("menubar.flipVertical")}
						shortcut="Ctrl+Alt+V"
						onSelect={toggleVerticalFlip}
					/>
					<MenubarItem
						label={t("menubar.resetFlip")}
						shortcut="Ctrl+Alt+Shift+F"
						onSelect={resetFlip}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={canvasView.isGridVisible ? t("menubar.hideGrid") : t("menubar.showGrid")}
						shortcut="Ctrl+Alt+G"
						onSelect={toggleGrid}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.settings")}>
					<MenubarItem label={t("menubar.settingsAction")} shortcut="Ctrl+I" />
					<MenubarItem
						label={t("menubar.languageSettings")}
						onSelect={() => setLanguageSettingDialogOpen(true)}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.help")}>
					<MenubarItem label={t("menubar.aboutFlippen")} />
				</MenubarMenu>
			</MenubarRoot>
			<LanguageSettingDialog
				open={isLanguageSettingDialogOpen}
				onOpenChange={setLanguageSettingDialogOpen}
			/>
		</>
	);
};

export default GlobalMenubar;
