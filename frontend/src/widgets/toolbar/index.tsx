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
import { useI18n } from "~/features/i18n/useI18n";
import { useUndoStack } from "~/features/history/useUndoStack";
import { usePlayback } from "~/features/playback/usePlayback";
import { useTool } from "~/features/tool/useTool";
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

	useHotkeys("ctrl+z", undo);
	useHotkeys("ctrl+shift+z", redo);
	useHotkeys("ctrl+x", clipContext.cut);
	useHotkeys("ctrl+c", clipContext.copy);
	useHotkeys("ctrl+v", clipContext.paste);
	useHotkeys("ctrl+a", (event) => {
		event.preventDefault();
		clipContext.selectAll();
	});
	useHotkeys("escape", () => clipContext.setSelection(undefined));
	useHotkeys("space", () =>
		playbackContext.isPlaying
			? playbackContext.pause()
			: playbackContext.play(),
	);
	useHotkeys("ctrl+o", props.onIsOnionSkinChange);
	useHotkeys("ctrl+l", () =>
		playbackContext.setIsLoop(!playbackContext.isLoop),
	);
	useHotkeys("ctrl+shift+ArrowLeft", () => playbackContext.setCurrentFrame(0));
	useHotkeys("ctrl+ArrowLeft", () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame - 1),
	);
	useHotkeys("ctrl+ArrowRight", () =>
		playbackContext.setCurrentFrame(playbackContext.currentFrame + 1),
	);
	useHotkeys("ctrl+shift+ArrowRight", () =>
		playbackContext.setCurrentFrame(playbackContext.maxFrameCount - 1),
	);
	useHotkeys("1", () => toolContext.setTool("move"));
	useHotkeys("2", () => toolContext.setTool("pen"));
	useHotkeys("3", () => toolContext.setTool("eraser"));
	useHotkeys("4", () => toolContext.setTool("fill"));
	useHotkeys("5", () => toolContext.setTool("select"));

	return (
		<div className="flex gap-2">
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label={t("toolbar.undo")}
					icon={IconArrowBackUp}
					size="small"
					onClick={undo}
				/>
				<IconButton
					label={t("toolbar.redo")}
					icon={IconArrowForwardUp}
					size="small"
					onClick={redo}
				/>
				<IconButton
					label={t("toolbar.cut")}
					icon={IconScissors}
					size="small"
					onClick={clipContext.cut}
				/>
				<IconButton
					label={t("toolbar.copy")}
					icon={IconCopy}
					size="small"
					onClick={clipContext.copy}
				/>
				<IconButton
					label={t("toolbar.paste")}
					icon={IconClipboard}
					size="small"
					onClick={clipContext.paste}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label={t("toolbar.play")}
					icon={playbackContext.isPlaying ? IconPlayerPause : IconPlayerPlay}
					variant={playbackContext.isPlaying ? "primary" : "default"}
					size="small"
					onClick={() =>
						playbackContext.isPlaying
							? playbackContext.pause()
							: playbackContext.play()
					}
				/>
				<IconButton
					label={t("toolbar.stop")}
					icon={IconPlayerStop}
					size="small"
					onClick={playbackContext.stop}
				/>
				<IconButton
					label={t("toolbar.loop")}
					icon={IconRefresh}
					variant={playbackContext.isLoop ? "primary" : "default"}
					size="small"
					onClick={() => playbackContext.setIsLoop(!playbackContext.isLoop)}
				/>
				<IconButton
					label={t("toolbar.onionSkin")}
					icon={IconLayersDifference}
					variant={props.isOnionSkin ? "primary" : "default"}
					size="small"
					onClick={props.onIsOnionSkinChange}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label={t("toolbar.rewind")}
					icon={IconPlayerSkipBack}
					size="small"
					onClick={() => playbackContext.setCurrentFrame(0)}
				/>
				<IconButton
					label={t("toolbar.prev")}
					icon={IconPlayerTrackPrev}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.currentFrame - 1)
					}
				/>
				<IconButton
					label={t("toolbar.next")}
					icon={IconPlayerTrackNext}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.currentFrame + 1)
					}
				/>
				<IconButton
					label={t("toolbar.forward")}
					icon={IconPlayerSkipForward}
					size="small"
					onClick={() =>
						playbackContext.setCurrentFrame(playbackContext.maxFrameCount - 1)
					}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label={t("toolbar.move")}
					icon={IconArrowsMove}
					size="small"
					variant={toolContext.tool === "move" ? "primary" : "default"}
					onClick={() => toolContext.setTool("move")}
				/>
				<IconButton
					label={t("toolbar.pen")}
					icon={IconPencil}
					size="small"
					variant={toolContext.tool === "pen" ? "primary" : "default"}
					onClick={() => toolContext.setTool("pen")}
				/>
				<IconButton
					label={t("toolbar.eraser")}
					icon={IconEraser}
					size="small"
					variant={toolContext.tool === "eraser" ? "primary" : "default"}
					onClick={() => toolContext.setTool("eraser")}
				/>
				<IconButton
					label={t("toolbar.fill")}
					icon={IconBucketDroplet}
					size="small"
					variant={toolContext.tool === "fill" ? "primary" : "default"}
					onClick={() => toolContext.setTool("fill")}
				/>
				<IconButton
					label={t("toolbar.select")}
					icon={IconLasso}
					size="small"
					variant={toolContext.tool === "select" ? "primary" : "default"}
					onClick={() => toolContext.setTool("select")}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
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
					icon={IconZoom}
					size="small"
					onClick={() => props.canvasView.setScale(1)}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
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
					icon={IconRotate}
					size="small"
					onClick={() => props.canvasView.setRotation(0)}
				/>
			</div>
			<div className="flex gap-1 p-1 border bg-white/90 dark:bg-zinc-950/90 border-zinc-500/25 rounded-lg shadow-sm backdrop-blur-xl">
				<IconButton
					label={t("toolbar.flipHorizontal")}
					icon={IconFlipHorizontal}
					variant={props.canvasView.isFlippedHorizontal ? "primary" : "default"}
					size="small"
					onClick={() =>
						props.canvasView.setIsFlippedHorizontal((prev) => !prev)
					}
				/>
				<IconButton
					label={t("toolbar.flipVertical")}
					icon={IconFlipVertical}
					variant={props.canvasView.isFlippedVertical ? "primary" : "default"}
					size="small"
					onClick={() => props.canvasView.setIsFlippedVertical((prev) => !prev)}
				/>
			</div>
		</div>
	);
};

export default Toolbar;
