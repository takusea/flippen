import { IconFilePlus, IconFolderOpen } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useClip } from "~/features/clip/useClip";
import { useI18n } from "~/features/i18n/useI18n";
import { useLayer } from "~/features/layer/useLayer";
import { useProject } from "~/features/project/useProject";
import { useProjectDialogs } from "~/features/project/useProjectDialogs";
import { useTool } from "~/features/tool/useTool";
import { useCore } from "~/infrastructure/core/useCore";
import Button from "~/shared/ui/Button";
import Splitter from "~/shared/ui/Splitter";
import DrawCanvas from "~/widgets/canvas/Canvas";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import ClipInspector from "~/widgets/inspector/ClipInspector";
import ColorInspector from "~/widgets/inspector/ColorInspector";
import ToolInspector from "~/widgets/inspector/ToolInspector";
import Timeline from "~/widgets/timeline/Timeline";
import Toolbar from "~/widgets/toolbar";

const SPLITTER_HEIGHT = 6;
const MIN_CANVAS_HEIGHT = 160;
const MIN_TIMELINE_HEIGHT = 96;

type Props = {
	isOnionSkin?: boolean;
	onIsOnionSkinChange?: () => void;
};

const App: React.FC<Props> = ({
	isOnionSkin = false,
	onIsOnionSkinChange = () => undefined,
}) => {
	const { t } = useI18n();
	const canvasView = useCanvasView();
	const toolContext = useTool();
	const core = useCore();
	const project = useProject();
	const clipContext = useClip();
	const layerContext = useLayer();
	const projectDialogs = useProjectDialogs();
	const selectedClip = clipContext.clips.find(
		(clip) => clip.id === clipContext.selectedClipId,
	);

	const [timelineHeight, setTimelineHeight] = useState<number>(160);
	const mainRef = useRef<HTMLElement>(null);
	const maxTimelineHeight = Math.max(
		MIN_TIMELINE_HEIGHT,
		(mainRef.current?.clientHeight ?? document.documentElement.clientHeight) -
			MIN_CANVAS_HEIGHT -
			SPLITTER_HEIGHT,
	);

	return (
		<main
			ref={mainRef}
			className="w-full h-full grid grid-cols-[minmax(0,1fr)]"
			style={{
				gridTemplateRows: `minmax(0, 1fr) ${SPLITTER_HEIGHT}px ${timelineHeight}px`,
			}}
		>
			<div className="relative w-full h-full grid grid-cols-[auto_1fr_auto] grid-rows-[1fr]">
				{project.settings ? (
					<DrawCanvas isOnionSkin={isOnionSkin} canvasView={canvasView} />
				) : (
					<div className="absolute grid place-content-center w-full h-full gap-2">
						<Button
							label={t("app.newProject")}
							icon={IconFilePlus}
							size="large"
							onClick={projectDialogs.openCreateProjectDialog}
						/>
						<Button
							label={t("app.openProject")}
							icon={IconFolderOpen}
							size="large"
							onClick={() => project.open()}
						/>
					</div>
				)}
				<div className="h-full w-60 p-2 flex flex-col gap-2 overflow-y-auto">
					<ToolInspector
						properties={toolContext.properties}
						onPropertyChange={(key, value) => {
							toolContext.setProperty(key, value);
						}}
					/>
					<ColorInspector
						currentColor={toolContext.color}
						colorHistory={toolContext.colorHistory}
						onCurrentColorChange={toolContext.setColor}
					/>
				</div>
				<div className="p-2 mx-auto mt-auto overflow-x-auto">
					<Toolbar
						isOnionSkin={isOnionSkin}
						onIsOnionSkinChange={onIsOnionSkinChange}
						canvasView={canvasView}
					/>
				</div>
				<div className="h-full w-60 p-2 flex flex-col gap-2 overflow-y-auto">
					{selectedClip && clipContext.transform && (
						<ClipInspector
							clip={selectedClip}
							isLayerLocked={layerContext.isLayerLocked(selectedClip.layer_id)}
							transform={clipContext.transform}
							onStartChange={(start) =>
								clipContext.moveClip(
									selectedClip.id,
									start,
									selectedClip.layer_id,
								)
							}
							onDurationChange={(duration) =>
								clipContext.changeClipDuration(selectedClip.id, duration)
							}
							onNameChange={(name) =>
								clipContext.changeClipName(selectedClip.id, name)
							}
							onPropertiesChange={(properties) =>
								clipContext.changeClipProperties(selectedClip.id, {
									hidden: selectedClip.hidden,
									alpha_locked: selectedClip.alpha_locked,
									locked: selectedClip.locked,
									opacity: selectedClip.opacity,
									blend_mode: selectedClip.blend_mode,
									...properties,
								})
							}
							onTransformChange={(transform) => {
								clipContext.changeTransform(selectedClip.id, transform);
							}}
							onInteractionStart={() => {
								void core.beginActionGroup();
							}}
							onInteractionEnd={() => {
								void core.endActionGroup();
							}}
						/>
					)}
				</div>
			</div>
			<Splitter
				orientation="horizontal"
				label={t("app.resizeTimeline")}
				value={timelineHeight}
				min={MIN_TIMELINE_HEIGHT}
				max={maxTimelineHeight}
				onResize={(delta) => {
					setTimelineHeight((height) =>
						Math.min(
							maxTimelineHeight,
							Math.max(MIN_TIMELINE_HEIGHT, height - delta),
						),
					);
				}}
			/>
			<div className="min-h-0 grid place-content-stretch bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-10">
				<Timeline />
			</div>
		</main>
	);
};

export default App;
