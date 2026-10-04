import type { MessageKey } from "~/features/i18n/I18nContext";

export const shortcutDefinitions = {
	newProject: { label: "shortcut.newProject", defaultKey: "ctrl+n" },
	openProject: { label: "shortcut.openProject", defaultKey: "ctrl+o" },
	saveProject: { label: "shortcut.saveProject", defaultKey: "ctrl+s" },
	undo: { label: "shortcut.undo", defaultKey: "ctrl+z" },
	redo: { label: "shortcut.redo", defaultKey: "ctrl+shift+z" },
	cut: { label: "shortcut.cut", defaultKey: "ctrl+x" },
	copy: { label: "shortcut.copy", defaultKey: "ctrl+c" },
	paste: { label: "shortcut.paste", defaultKey: "ctrl+v" },
	selectAll: { label: "shortcut.selectAll", defaultKey: "ctrl+a" },
	clearSelection: { label: "shortcut.clearSelection", defaultKey: "escape" },
	zoomIn: { label: "shortcut.zoomIn", defaultKey: "ctrl+shift+equal" },
	zoomOut: { label: "shortcut.zoomOut", defaultKey: "ctrl+minus" },
	fitView: { label: "shortcut.fitView", defaultKey: "ctrl+shift+0" },
	resetZoom: { label: "shortcut.resetZoom", defaultKey: "ctrl+0" },
	rotateLeft: {
		label: "shortcut.rotateLeft",
		defaultKey: "ctrl+alt+ArrowLeft",
	},
	rotateRight: {
		label: "shortcut.rotateRight",
		defaultKey: "ctrl+alt+ArrowRight",
	},
	resetRotation: { label: "shortcut.resetRotation", defaultKey: "ctrl+alt+0" },
	flipHorizontal: {
		label: "shortcut.flipHorizontal",
		defaultKey: "ctrl+alt+h",
	},
	flipVertical: { label: "shortcut.flipVertical", defaultKey: "ctrl+alt+v" },
	resetFlip: { label: "shortcut.resetFlip", defaultKey: "ctrl+alt+shift+f" },
	toggleGrid: { label: "shortcut.toggleGrid", defaultKey: "ctrl+alt+g" },
	toggleOnionSkin: {
		label: "shortcut.toggleOnionSkin",
		defaultKey: "ctrl+shift+o",
	},
	togglePlayback: { label: "shortcut.togglePlayback", defaultKey: "space" },
	toggleLoop: { label: "shortcut.toggleLoop", defaultKey: "ctrl+l" },
	firstFrame: {
		label: "shortcut.firstFrame",
		defaultKey: "ctrl+shift+ArrowLeft",
	},
	previousFrame: {
		label: "shortcut.previousFrame",
		defaultKey: "ctrl+ArrowLeft",
	},
	nextFrame: { label: "shortcut.nextFrame", defaultKey: "ctrl+ArrowRight" },
	lastFrame: {
		label: "shortcut.lastFrame",
		defaultKey: "ctrl+shift+ArrowRight",
	},
	moveTool: { label: "shortcut.moveTool", defaultKey: "1" },
	penTool: { label: "shortcut.penTool", defaultKey: "2" },
	eraserTool: { label: "shortcut.eraserTool", defaultKey: "3" },
	fillTool: { label: "shortcut.fillTool", defaultKey: "4" },
	selectTool: { label: "shortcut.selectTool", defaultKey: "5" },
	deleteClip: { label: "shortcut.deleteClip", defaultKey: "delete" },
} satisfies Record<string, { label: MessageKey; defaultKey: string }>;

export type ShortcutId = keyof typeof shortcutDefinitions;
export type Shortcuts = Record<ShortcutId, string>;

export const defaultShortcuts = Object.fromEntries(
	Object.entries(shortcutDefinitions).map(([id, definition]) => [
		id,
		definition.defaultKey,
	]),
) as Shortcuts;

export const formatShortcut = (shortcut: string) =>
	shortcut
		.split("+")
		.map((part) => {
			if (part === "ctrl") return "Ctrl";
			if (part === "alt") return "Alt";
			if (part === "shift") return "Shift";
			if (part === "meta") return "Meta";
			if (part === "equal") return "=";
			if (part === "minus") return "-";
			if (part === "ArrowLeft") return "←";
			if (part === "ArrowRight") return "→";
			if (part === "ArrowUp") return "↑";
			if (part === "ArrowDown") return "↓";
			if (part === "space") return "Space";
			return part.length === 1 ? part.toUpperCase() : part;
		})
		.join("+");
