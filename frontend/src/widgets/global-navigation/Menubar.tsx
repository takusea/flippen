import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useClip } from "~/features/clip/useClip";
import { useUndoStack } from "~/features/history/useUndoStack";
import LanguageSettingDialog from "~/features/i18n/LanguageSettingDialog";
import { useI18n } from "~/features/i18n/useI18n";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import { useProjectExport } from "~/features/project/useProjectExport";
import ShortcutSettingsDialog from "~/features/shortcuts/ShortcutSettingsDialog";
import { formatShortcut } from "~/features/shortcuts/shortcutDefinitions";
import { useShortcuts } from "~/features/shortcuts/useShortcuts";
import MenubarCheckboxItem from "~/shared/ui/Menubar/MenubarCheckboxItem";
import MenubarItem from "~/shared/ui/Menubar/MenubarItem";
import MenubarMenu from "~/shared/ui/Menubar/MenubarMenu";
import MenubarRoot from "~/shared/ui/Menubar/MenubarRoot";
import MenubarSeparator from "~/shared/ui/Menubar/MenubarSeparator";
import type { useCanvasView } from "~/widgets/canvas/useCanvasView";

type Props = {
	canvasView: ReturnType<typeof useCanvasView>;
	isOnionSkin: boolean;
	onIsOnionSkinChange: () => void;
};

const GlobalMenubar: React.FC<Props> = ({
	canvasView,
	isOnionSkin,
	onIsOnionSkinChange,
}) => {
	const { t } = useI18n();
	const [isLanguageSettingDialogOpen, setLanguageSettingDialogOpen] =
		useState(false);
	const [isShortcutSettingsDialogOpen, setShortcutSettingsDialogOpen] =
		useState(false);
	const { setDialogOpen } = useProjectExport();
	const { shortcuts } = useShortcuts();
	const undoStack = useUndoStack();
	const clipContext = useClip();
	const playbackContext = usePlayback();
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

	useHotkeys(shortcuts.newProject, projectDialogs.openCreateProjectDialog);
	useHotkeys(shortcuts.openProject, () => project.open());
	useHotkeys(shortcuts.saveProject, () => project.save());
	useHotkeys(shortcuts.zoomIn, () => canvasView.zoom(1));
	useHotkeys(shortcuts.zoomOut, () => canvasView.zoom(-1));
	useHotkeys(shortcuts.resetZoom, () => canvasView.setScale(1));
	useHotkeys(shortcuts.fitView, fitToView);
	useHotkeys(shortcuts.rotateLeft, () => canvasView.rotate(-1));
	useHotkeys(shortcuts.rotateRight, () => canvasView.rotate(1));
	useHotkeys(shortcuts.resetRotation, () => canvasView.setRotation(0));
	useHotkeys(shortcuts.flipHorizontal, toggleHorizontalFlip);
	useHotkeys(shortcuts.flipVertical, toggleVerticalFlip);
	useHotkeys(shortcuts.resetFlip, resetFlip);
	useHotkeys(shortcuts.toggleGrid, toggleGrid);
	useHotkeys(shortcuts.toggleOnionSkin, onIsOnionSkinChange);

	return (
		<>
			<MenubarRoot>
				<MenubarMenu label={t("menubar.file")}>
					<MenubarItem
						label={t("menubar.new")}
						shortcut={formatShortcut(shortcuts.newProject)}
						onSelect={projectDialogs.openCreateProjectDialog}
					/>
					<MenubarItem
						label={t("menubar.open")}
						shortcut={formatShortcut(shortcuts.openProject)}
						onSelect={() => project.open()}
					/>
					<MenubarItem
						label={t("menubar.save")}
						shortcut={formatShortcut(shortcuts.saveProject)}
						onSelect={() => project.save()}
					/>
					<MenubarItem label={t("menubar.saveWith")} shortcut="Ctrl+Shift+S" />
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.export")}
						disabled={project.settings == null}
						onSelect={() => setDialogOpen(true)}
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
						shortcut={formatShortcut(shortcuts.undo)}
						onSelect={() => undoStack.undo()}
					/>
					<MenubarItem
						label={t("menubar.redo")}
						shortcut={formatShortcut(shortcuts.redo)}
						onSelect={() => undoStack.redo()}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.cut")}
						shortcut={formatShortcut(shortcuts.cut)}
						onSelect={clipContext.cut}
					/>
					<MenubarItem
						label={t("menubar.copy")}
						shortcut={formatShortcut(shortcuts.copy)}
						onSelect={clipContext.copy}
					/>
					<MenubarItem
						label={t("menubar.paste")}
						shortcut={formatShortcut(shortcuts.paste)}
						onSelect={clipContext.paste}
					/>
					<MenubarItem
						label={t("menubar.selectAll")}
						shortcut={formatShortcut(shortcuts.selectAll)}
						onSelect={clipContext.selectAll}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.view")}>
					<MenubarItem
						label={t("menubar.zoomIn")}
						shortcut={formatShortcut(shortcuts.zoomIn)}
						onSelect={() => canvasView.zoom(1)}
					/>
					<MenubarItem
						label={t("menubar.zoomOut")}
						shortcut={formatShortcut(shortcuts.zoomOut)}
						onSelect={() => canvasView.zoom(-1)}
					/>
					<MenubarItem
						label={t("menubar.fitView")}
						shortcut={formatShortcut(shortcuts.fitView)}
						disabled={project.settings == null}
						onSelect={fitToView}
					/>
					<MenubarItem
						label={t("menubar.resetZoom")}
						shortcut={formatShortcut(shortcuts.resetZoom)}
						onSelect={() => canvasView.setScale(1)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.rotateLeft")}
						shortcut={formatShortcut(shortcuts.rotateLeft)}
						onSelect={() => canvasView.rotate(-1)}
					/>
					<MenubarItem
						label={t("menubar.rotateRight")}
						shortcut={formatShortcut(shortcuts.rotateRight)}
						onSelect={() => canvasView.rotate(1)}
					/>
					<MenubarItem
						label={t("menubar.resetRotate")}
						shortcut={formatShortcut(shortcuts.resetRotation)}
						onSelect={() => canvasView.setRotation(0)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.flipHorizontal")}
						shortcut={formatShortcut(shortcuts.flipHorizontal)}
						onSelect={toggleHorizontalFlip}
					/>
					<MenubarItem
						label={t("menubar.flipVertical")}
						shortcut={formatShortcut(shortcuts.flipVertical)}
						onSelect={toggleVerticalFlip}
					/>
					<MenubarItem
						label={t("menubar.resetFlip")}
						shortcut={formatShortcut(shortcuts.resetFlip)}
						onSelect={resetFlip}
					/>
					<MenubarSeparator />
					<MenubarCheckboxItem
						label={
							canvasView.isGridVisible
								? t("menubar.hideGrid")
								: t("menubar.showGrid")
						}
						shortcut={formatShortcut(shortcuts.toggleGrid)}
						checked={canvasView.isGridVisible}
						onCheckedChange={toggleGrid}
					/>
					<MenubarCheckboxItem
						label={
							isOnionSkin ? t("menubar.hideOnionSkin") : t("menubar.showOnionSkin")
						}
						shortcut={formatShortcut(shortcuts.toggleOnionSkin)}
						checked={isOnionSkin}
						onCheckedChange={onIsOnionSkinChange}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.playback")}>
					<MenubarItem
						label={
							playbackContext.isPlaying ? t("menubar.pause") : t("menubar.play")
						}
						shortcut={formatShortcut(shortcuts.togglePlayback)}
						onSelect={() =>
							playbackContext.isPlaying
								? playbackContext.pause()
								: playbackContext.play()
						}
					/>
					<MenubarItem
						label={t("menubar.stop")}
						onSelect={playbackContext.stop}
					/>
					<MenubarSeparator />
					<MenubarCheckboxItem
						label={t("menubar.loop")}
						shortcut={formatShortcut(shortcuts.toggleLoop)}
						checked={playbackContext.isLoop}
						onCheckedChange={() =>
							playbackContext.setIsLoop(!playbackContext.isLoop)
						}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={t("menubar.firstFrame")}
						shortcut={formatShortcut(shortcuts.firstFrame)}
						onSelect={() =>
							playbackContext.setCurrentFrame(playbackContext.startFrame)
						}
					/>
					<MenubarItem
						label={t("menubar.previousFrame")}
						shortcut={formatShortcut(shortcuts.previousFrame)}
						onSelect={() =>
							playbackContext.setCurrentFrame(playbackContext.currentFrame - 1)
						}
					/>
					<MenubarItem
						label={t("menubar.nextFrame")}
						shortcut={formatShortcut(shortcuts.nextFrame)}
						onSelect={() =>
							playbackContext.setCurrentFrame(playbackContext.currentFrame + 1)
						}
					/>
					<MenubarItem
						label={t("menubar.lastFrame")}
						shortcut={formatShortcut(shortcuts.lastFrame)}
						onSelect={() =>
							playbackContext.setCurrentFrame(playbackContext.endFrame)
						}
					/>
				</MenubarMenu>
				<MenubarMenu label={t("menubar.settings")}>
					<MenubarItem
						label={t("menubar.shortcutSettings")}
						onSelect={() => setShortcutSettingsDialogOpen(true)}
					/>
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
			<ShortcutSettingsDialog
				open={isShortcutSettingsDialogOpen}
				onOpenChange={setShortcutSettingsDialogOpen}
			/>
		</>
	);
};

export default GlobalMenubar;
