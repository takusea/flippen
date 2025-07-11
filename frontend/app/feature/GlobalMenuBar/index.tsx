import MenubarItem from "~/base/Menubar/MenubarItem";
import MenubarMenu from "~/base/Menubar/MenubarMenu";
import MenubarRoot from "~/base/Menubar/MenubarRoot";
import { useProject } from "../Project/useProject";
import { useUndoStack } from "../UndoStack/useUndoStack";

const GlobalMenubar: React.FC = () => {
	const undoStack = useUndoStack();
	const project = useProject();

	return (
		<MenubarRoot>
			<MenubarMenu label="File">
				<MenubarItem label="New Project" shortcut="Ctrl+N" />
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
				<MenubarItem label="Cut" shortcut="Ctrl+X" />
				<MenubarItem label="Copy" shortcut="Ctrl+C" />
				<MenubarItem label="Paste" shortcut="Ctrl+V" />
				<MenubarItem label="Select All" shortcut="Ctrl+A" />
			</MenubarMenu>
			<MenubarMenu label="View">
				<MenubarItem label="test" shortcut="Ctrl+S" />
			</MenubarMenu>
			<MenubarMenu label="Setting">
				<MenubarItem label="test" shortcut="Ctrl+S" />
			</MenubarMenu>
			<MenubarMenu label="Help">
				<MenubarItem label="test" shortcut="Ctrl+S" />
			</MenubarMenu>
		</MenubarRoot>
	);
};

export default GlobalMenubar;
