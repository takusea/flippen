import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useClip } from "~/features/clip/useClip";
import { useUndoStack } from "~/features/history/useUndoStack";
import LanguageSettingDialog from "~/features/i18n/LanguageSettingDialog";
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
				<MenubarMenu label="File">
					<MenubarItem
						label="New Project"
						shortcut="Ctrl+N"
						onSelect={projectDialogs.openCreateProjectDialog}
					/>
					<MenubarItem
						label="Open"
						shortcut="Ctrl+O"
						onSelect={() => project.open()}
					/>
					<MenubarItem
						label="Save"
						shortcut="Ctrl+S"
						onSelect={() => project.save()}
					/>
					<MenubarItem label="Save with..." shortcut="Ctrl+Shift+S" />
					<MenubarSeparator />
					<MenubarItem
						label="Project Settings..."
						onSelect={projectDialogs.openEditProjectSettingsDialog}
					/>
					<MenubarSeparator />
					<MenubarItem label="Close" />
				</MenubarMenu>
				<MenubarMenu label="Edit">
					<MenubarItem
						label="Undo"
						shortcut="Ctrl+Z"
						onSelect={() => undoStack.undo()}
					/>
					<MenubarItem
						label="Redo"
						shortcut="Ctrl+Shift+Z"
						onSelect={() => undoStack.redo()}
					/>
					<MenubarSeparator />
					<MenubarItem
						label="Cut"
						shortcut="Ctrl+X"
						onSelect={clipContext.cut}
					/>
					<MenubarItem
						label="Copy"
						shortcut="Ctrl+C"
						onSelect={clipContext.copy}
					/>
					<MenubarItem
						label="Paste"
						shortcut="Ctrl+V"
						onSelect={clipContext.paste}
					/>
					<MenubarItem
						label="Select All"
						shortcut="Ctrl+A"
						onSelect={clipContext.selectAll}
					/>
				</MenubarMenu>
				<MenubarMenu label="View">
					<MenubarItem
						label="Zoom In"
						shortcut="Ctrl++"
						onSelect={() => canvasView.zoom(1)}
					/>
					<MenubarItem
						label="Zoom Out"
						shortcut="Ctrl+-"
						onSelect={() => canvasView.zoom(-1)}
					/>
					<MenubarItem
						label="Fit View"
						shortcut="Ctrl+Shift+0"
						disabled={project.settings == null}
						onSelect={fitToView}
					/>
					<MenubarItem
						label="Reset Zoom"
						shortcut="Ctrl+0"
						onSelect={() => canvasView.setScale(1)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label="Rotate Left"
						shortcut="Ctrl+Alt+←"
						onSelect={() => canvasView.rotate(-1)}
					/>
					<MenubarItem
						label="Rotate Right"
						shortcut="Ctrl+Alt+→"
						onSelect={() => canvasView.rotate(1)}
					/>
					<MenubarItem
						label="Reset Rotate"
						shortcut="Ctrl+Alt+0"
						onSelect={() => canvasView.setRotation(0)}
					/>
					<MenubarSeparator />
					<MenubarItem
						label="Flip Horizontal"
						shortcut="Ctrl+Alt+H"
						onSelect={toggleHorizontalFlip}
					/>
					<MenubarItem
						label="Flip Vertical"
						shortcut="Ctrl+Alt+V"
						onSelect={toggleVerticalFlip}
					/>
					<MenubarItem
						label="Reset Flip"
						shortcut="Ctrl+Alt+Shift+F"
						onSelect={resetFlip}
					/>
					<MenubarSeparator />
					<MenubarItem
						label={canvasView.isGridVisible ? "Hide Grid" : "Show Grid"}
						shortcut="Ctrl+Alt+G"
						onSelect={toggleGrid}
					/>
				</MenubarMenu>
				<MenubarMenu label="Setting">
					<MenubarItem label="Settings..." shortcut="Ctrl+I" />
					<MenubarItem
						label="Language Settings..."
						onSelect={() => setLanguageSettingDialogOpen(true)}
					/>
				</MenubarMenu>
				<MenubarMenu label="Help">
					<MenubarItem label="About Flippen..." />
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
