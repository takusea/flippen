import { useState } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import Button from "~/shared/ui/Button";
import { Dialog, DialogContent } from "~/shared/ui/Dialog";
import {
	formatShortcut,
	type ShortcutId,
	shortcutDefinitions,
} from "./shortcutDefinitions";
import { useShortcuts } from "./useShortcuts";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const modifiers = new Set(["Control", "Alt", "Shift", "Meta"]);
const keyNames: Record<string, string> = {
	" ": "space",
	ArrowDown: "ArrowDown",
	ArrowLeft: "ArrowLeft",
	ArrowRight: "ArrowRight",
	ArrowUp: "ArrowUp",
	Backspace: "backspace",
	Delete: "delete",
	End: "end",
	Enter: "enter",
	Escape: "escape",
	Home: "home",
	PageDown: "pagedown",
	PageUp: "pageup",
	Tab: "tab",
};

const getShortcutFromEvent = (event: React.KeyboardEvent): string | null => {
	if (modifiers.has(event.key)) return null;

	let key = keyNames[event.key];
	if (event.key === "=" || event.key === "+") key = "equal";
	else if (event.key === "-") key = "minus";
	else if (key == null && event.key.length === 1) key = event.key.toLowerCase();
	if (key == null) return null;

	return [
		event.ctrlKey && "ctrl",
		event.altKey && "alt",
		event.shiftKey && "shift",
		event.metaKey && "meta",
		key,
	]
		.filter(Boolean)
		.join("+");
};

const ShortcutSettingsDialog: React.FC<Props> = ({ open, onOpenChange }) => {
	const { t } = useI18n();
	const { shortcuts, setShortcut, resetShortcuts } = useShortcuts();
	const [recording, setRecording] = useState<ShortcutId | null>(null);
	const [conflict, setConflict] = useState(false);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setRecording(null);
				setConflict(false);
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent
				title={t("shortcutSettings.title")}
				cancelText={t("common.close")}
			>
				<div className="max-h-[60vh] overflow-y-auto">
					<div className="flex flex-col gap-2">
						{(
							Object.entries(shortcutDefinitions) as [
								ShortcutId,
								(typeof shortcutDefinitions)[ShortcutId],
							][]
						).map(([id, definition]) => (
							<div key={id} className="flex items-center justify-between gap-4">
								<span>{t(definition.label)}</span>
								<Button
									onClick={() => {
										setRecording(id);
										setConflict(false);
									}}
									onKeyDown={(event) => {
										if (recording !== id) return;
										event.preventDefault();
										event.stopPropagation();
										const nextShortcut = getShortcutFromEvent(event);
										if (nextShortcut == null) return;
										if (
											Object.entries(shortcuts).some(
												([otherId, value]) =>
													otherId !== id && value === nextShortcut,
											)
										) {
											setConflict(true);
											return;
										}
										setShortcut(id, nextShortcut);
										setRecording(null);
										setConflict(false);
									}}
									label={
										recording === id
											? t("shortcutSettings.pressKeys")
											: formatShortcut(shortcuts[id])
									}
								></Button>
							</div>
						))}
					</div>
				</div>
				<div className="mt-2 grid grid-cols-[1fr_auto]">
					{conflict && (
						<p role="alert" className="mt-2 text-red-600">
							{t("shortcutSettings.conflict")}
						</p>
					)}
					<div className="col-start-2">
						<Button
							label={t("shortcutSettings.reset")}
							onClick={() => {
								resetShortcuts();
								setRecording(null);
								setConflict(false);
							}}
						/>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ShortcutSettingsDialog;
