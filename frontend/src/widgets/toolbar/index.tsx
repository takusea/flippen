import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconArrowsMove,
	IconBucketDroplet,
	IconClipboard,
	IconCopy,
	IconEraser,
	IconFlipHorizontal,
	IconFlipVertical,
	IconLasso,
	IconLayersDifference,
	IconPencil,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlayerSkipBack,
	IconPlayerSkipForward,
	IconPlayerStop,
	IconPlayerTrackNext,
	IconPlayerTrackPrev,
	IconRefresh,
	IconRotate,
	IconScissors,
	IconZoom,
} from "@tabler/icons-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useClip } from "~/features/clip/useClip";
import { useUndoStack } from "~/features/history/useUndoStack";
import { useI18n } from "~/features/i18n/useI18n";
import { usePlayback } from "~/features/playback/usePlayback";
import { formatShortcut } from "~/features/shortcuts/shortcutDefinitions";
import { useShortcuts } from "~/features/shortcuts/useShortcuts";
import { useTool } from "~/features/tool/useTool";
import Card from "~/shared/ui/Card";
import IconButton from "~/shared/ui/IconButton";
import NumberField from "~/shared/ui/NumberField";
import type { useCanvasView } from "~/widgets/canvas/useCanvasView";

type Props = {
	isOnionSkin: boolean;
	onIsOnionSkinChange: () => void;
	canvasView: ReturnType<typeof useCanvasView>;
};

const Toolbar: React.FC<Props> = (props) => {
	const { t } = useI18n();
	const playbackContext = usePlayback();
	const clipContext = useClip();
	const toolContext = useTool();
	const { undo, redo } = useUndoStack();
	const { shortcuts } = useShortcuts();

	useHotkeys(shortcuts.undo, undo);
	useHotkeys(shortcuts.redo, redo);
	useHotkeys(shortcuts.cut, clipContext.cut);
	useHotkeys(shortcuts.copy, clipContext.copy);
	useHotkeys(shortcuts.paste, clipContext.paste);
	useHotkeys(shortcuts.selectAll, (event) => {
		event.preventDefault();
		clipContext.selectAll();
	});
	useHotkeys(shortcuts.clearSelection, () =>
		clipContext.setSelection(undefined),
	);
	useHotkeys(shortcuts.togglePlayback, () =>
		playbackContext.isPlaying
			? playbackContext.pause()
			: playbackContext.play(),
	);
	useHotkeys(shortcuts.stop, () => playbackContext.stop());
	useHotkeys(shortcuts.toggleOnionSkin, props.onIsOnionSkinChange);
	useHotkeys(shortcuts.toggleLoop, () =>
		playbackContext.setIsLoop(!playbackContext.isLoop),
	);
	useHotkeys(shortcuts.firstFrame, () =>
		playbackContext.setCurrentFrame(playbackContext.startFrame),
	);
	useHotkeys(shortcuts.previousFrame, () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame - 1),
	);
	useHotkeys(shortcuts.nextFrame, () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame + 1),
	);
	useHotkeys(shortcuts.lastFrame, () =>
		playbackContext.setCurrentFrame(playbackContext.endFrame),
	);
	useHotkeys(shortcuts.moveTool, () => toolContext.setTool("move"));
	useHotkeys(shortcuts.penTool, () => toolContext.setTool("pen"));
	useHotkeys(shortcuts.eraserTool, () => toolContext.setTool("eraser"));
	useHotkeys(shortcuts.fillTool, () => toolContext.setTool("fill"));
	useHotkeys(shortcuts.selectTool, () => toolContext.setTool("select"));

	return (
		<div className="flex gap-2">
			<Card size="small">
				<div className="flex gap-1">
					<IconButton
						label={t("toolbar.pen")}
						shortcut={formatShortcut(shortcuts.penTool)}
						icon={IconPencil}
						variant={toolContext.tool === "pen" ? "primary" : "default"}
						onClick={() => toolContext.setTool("pen")}
					/>
					<IconButton
						label={t("toolbar.eraser")}
						shortcut={formatShortcut(shortcuts.eraserTool)}
						icon={IconEraser}
						variant={toolContext.tool === "eraser" ? "primary" : "default"}
						onClick={() => toolContext.setTool("eraser")}
					/>
					<IconButton
						label={t("toolbar.fill")}
						shortcut={formatShortcut(shortcuts.fillTool)}
						icon={IconBucketDroplet}
						variant={toolContext.tool === "fill" ? "primary" : "default"}
						onClick={() => toolContext.setTool("fill")}
					/>
					<IconButton
						label={t("toolbar.select")}
						shortcut={formatShortcut(shortcuts.selectTool)}
						icon={IconLasso}
						variant={toolContext.tool === "select" ? "primary" : "default"}
						onClick={() => toolContext.setTool("select")}
					/>
					<IconButton
						label={t("toolbar.move")}
						shortcut={formatShortcut(shortcuts.moveTool)}
						icon={IconArrowsMove}
						variant={toolContext.tool === "move" ? "primary" : "default"}
						onClick={() => toolContext.setTool("move")}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<IconButton
						label={t("toolbar.undo")}
						shortcut={formatShortcut(shortcuts.undo)}
						icon={IconArrowBackUp}
						onClick={undo}
					/>
					<IconButton
						label={t("toolbar.redo")}
						shortcut={formatShortcut(shortcuts.redo)}
						icon={IconArrowForwardUp}
						onClick={redo}
					/>
					<IconButton
						label={t("toolbar.cut")}
						shortcut={formatShortcut(shortcuts.cut)}
						icon={IconScissors}
						onClick={clipContext.cut}
					/>
					<IconButton
						label={t("toolbar.copy")}
						shortcut={formatShortcut(shortcuts.copy)}
						icon={IconCopy}
						onClick={clipContext.copy}
					/>
					<IconButton
						label={t("toolbar.paste")}
						shortcut={formatShortcut(shortcuts.paste)}
						icon={IconClipboard}
						onClick={clipContext.paste}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<IconButton
						label={t("toolbar.play")}
						shortcut={formatShortcut(shortcuts.togglePlayback)}
						icon={playbackContext.isPlaying ? IconPlayerPause : IconPlayerPlay}
						variant={playbackContext.isPlaying ? "primary" : "default"}
						onClick={() =>
							playbackContext.isPlaying
								? playbackContext.pause()
								: playbackContext.play()
						}
					/>
					<IconButton
						label={t("toolbar.stop")}
						shortcut={formatShortcut(shortcuts.stop)}
						icon={IconPlayerStop}
						onClick={playbackContext.stop}
					/>
					<IconButton
						label={t("toolbar.loop")}
						shortcut={formatShortcut(shortcuts.toggleLoop)}
						icon={IconRefresh}
						variant={playbackContext.isLoop ? "primary" : "default"}
						onClick={() => playbackContext.setIsLoop(!playbackContext.isLoop)}
					/>
					<IconButton
						label={t("toolbar.onionSkin")}
						shortcut={formatShortcut(shortcuts.toggleOnionSkin)}
						icon={IconLayersDifference}
						variant={props.isOnionSkin ? "primary" : "default"}
						onClick={props.onIsOnionSkinChange}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<IconButton
						label={t("toolbar.rewind")}
						shortcut={formatShortcut(shortcuts.firstFrame)}
						icon={IconPlayerSkipBack}
						onClick={() =>
							playbackContext.setCurrentFrame(playbackContext.startFrame)
						}
					/>
					<IconButton
						label={t("toolbar.prev")}
						shortcut={formatShortcut(shortcuts.previousFrame)}
						icon={IconPlayerTrackPrev}
						onClick={() =>
							playbackContext.setCurrentFrame(playbackContext.currentFrame - 1)
						}
					/>
					<IconButton
						label={t("toolbar.next")}
						shortcut={formatShortcut(shortcuts.nextFrame)}
						icon={IconPlayerTrackNext}
						onClick={() =>
							playbackContext.setCurrentFrame(playbackContext.currentFrame + 1)
						}
					/>
					<IconButton
						label={t("toolbar.forward")}
						shortcut={formatShortcut(shortcuts.lastFrame)}
						icon={IconPlayerSkipForward}
						onClick={() =>
							playbackContext.setCurrentFrame(playbackContext.endFrame)
						}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<div className="w-16">
						<NumberField
							value={Number((props.canvasView.scale * 100).toFixed(2))}
							max={props.canvasView.maxScale * 100}
							min={props.canvasView.minScale * 100}
							step={10}
							onValueChange={(value) => props.canvasView.setScale(value / 100)}
						/>
					</div>
					<IconButton
						label={t("toolbar.resetZoom")}
						shortcut={formatShortcut(shortcuts.resetZoom)}
						icon={IconZoom}
						onClick={() => props.canvasView.setScale(1)}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<div className="w-16">
						<NumberField
							value={props.canvasView.rotation}
							max={180}
							min={-180}
							step={1}
							onValueChange={props.canvasView.setRotation}
						/>
					</div>
					<IconButton
						label={t("toolbar.resetRotate")}
						shortcut={formatShortcut(shortcuts.resetRotation)}
						icon={IconRotate}
						onClick={() => props.canvasView.setRotation(0)}
					/>
				</div>
			</Card>
			<Card size="small">
				<div className="flex gap-1">
					<IconButton
						label={t("toolbar.flipHorizontal")}
						shortcut={formatShortcut(shortcuts.flipHorizontal)}
						icon={IconFlipHorizontal}
						variant={
							props.canvasView.isFlippedHorizontal ? "primary" : "default"
						}
						onClick={() =>
							props.canvasView.setIsFlippedHorizontal((prev) => !prev)
						}
					/>
					<IconButton
						label={t("toolbar.flipVertical")}
						shortcut={formatShortcut(shortcuts.flipVertical)}
						icon={IconFlipVertical}
						variant={props.canvasView.isFlippedVertical ? "primary" : "default"}
						onClick={() =>
							props.canvasView.setIsFlippedVertical((prev) => !prev)
						}
					/>
				</div>
			</Card>
		</div>
	);
};

export default Toolbar;
