import { useUndoStack } from "~/features/history/useUndoStack";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import MenubarItem from "~/shared/ui/Menubar/MenubarItem";
import MenubarMenu from "~/shared/ui/Menubar/MenubarMenu";
import MenubarRoot from "~/shared/ui/Menubar/MenubarRoot";
import MenubarSeparator from "~/shared/ui/Menubar/MenubarSeparator";

const GlobalMenubar: React.FC = () => {
	const undoStack = useUndoStack();
	const project = useProject();
	const projectDialogs = useProjectDialogs();

	return (
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
				<MenubarItem label="Cut" shortcut="Ctrl+X" />
				<MenubarItem label="Copy" shortcut="Ctrl+C" />
				<MenubarItem label="Paste" shortcut="Ctrl+V" />
				<MenubarItem label="Select All" shortcut="Ctrl+A" />
			</MenubarMenu>
			<MenubarMenu label="View">
				<MenubarItem label="Zoom In" shortcut="Ctrl+S" />
				<MenubarItem label="Zoom Out" shortcut="Ctrl+S" />
				<MenubarItem label="Fit Of View" shortcut="Ctrl+S" />
				<MenubarItem label="Reset Zoom" shortcut="Ctrl+S" />
				<MenubarSeparator />
				<MenubarItem label="Rotate Left" shortcut="Ctrl+S" />
				<MenubarItem label="Rotate Right" shortcut="Ctrl+S" />
				<MenubarItem label="Reset Rotate" shortcut="Ctrl+S" />
				<MenubarSeparator />
				<MenubarItem label="Flip Horizontal" shortcut="Ctrl+S" />
				<MenubarItem label="Flip Vertical" shortcut="Ctrl+S" />
				<MenubarItem label="Reset Flip" shortcut="Ctrl+S" />
				<MenubarSeparator />
				<MenubarItem label="Show Grid" shortcut="Ctrl+S" />
			</MenubarMenu>
			<MenubarMenu label="Setting">
				<MenubarItem label="Settings..." shortcut="Ctrl+S" />
			</MenubarMenu>
			<MenubarMenu label="Help">
				<MenubarItem label="About Flippen..." shortcut="Ctrl+S" />
			</MenubarMenu>
		</MenubarRoot>
	);
};

export default GlobalMenubar;
