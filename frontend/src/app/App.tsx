import {
	IconAdjustmentsHorizontal,
	IconFilePlus,
	IconFolderOpen,
	IconTools,
} from "@tabler/icons-react";
import { type RefObject, useRef, useState } from "react";
import { useMediaQuery, useOnClickOutside, useToggle } from "usehooks-ts";
import { useClip } from "~/features/clip/useClip";
import { useI18n } from "~/features/i18n/useI18n";
import { useLayer } from "~/features/layer/useLayer";
import { useProject } from "~/features/project/useProject";
import { useTool } from "~/features/tool/useTool";
import { useCore } from "~/infrastructure/core/useCore";
import Button from "~/shared/ui/Button";
import Card from "~/shared/ui/Card";
import IconButton from "~/shared/ui/IconButton";
import Splitter from "~/shared/ui/Splitter";
import DrawCanvas from "~/widgets/canvas/Canvas";
import { useCanvasView } from "~/widgets/canvas/useCanvasView";
import { useDialogs } from "~/widgets/dialogs/useDialogs";
import GlobalHeader from "~/widgets/header/GlobalHeader";
import ClipInspector from "~/widgets/inspector/ClipInspector";
import ColorInspector from "~/widgets/inspector/ColorInspector";
import ToolInspector from "~/widgets/inspector/ToolInspector";
import Timeline from "~/widgets/timeline/Timeline";
import Toolbar from "~/widgets/toolbar";

const SPLITTER_HEIGHT = 8;
const MIN_CANVAS_HEIGHT = 160;
const MIN_TIMELINE_HEIGHT = 96;

const App: React.FC = () => {
	const isDesktop: boolean = useMediaQuery("(min-width: 720px)");
	const [isToolInspectorOpen, toggleIsToolInspectorOpen] = useToggle(false);
	const [isClipInspectorOpen, toggleIsClipInspectorOpen] = useToggle(false);
	const { t } = useI18n();
	const canvasView = useCanvasView();
	const toolContext = useTool();
	const core = useCore();
	const project = useProject();
	const clipContext = useClip();
	const layerContext = useLayer();
	const dialogs = useDialogs();
	const selectedClip = clipContext.clips.find(
		(clip) => clip.id === clipContext.selectedClipId,
	);

	const [timelineHeight, setTimelineHeight] = useState<number>(160);
	const maxTimelineHeight = Math.max(
		MIN_TIMELINE_HEIGHT,
		document.documentElement.clientHeight - MIN_CANVAS_HEIGHT - SPLITTER_HEIGHT,
	);

	const toolInspectorRef = useRef<HTMLDivElement>(null);
	const clipInspectorRef = useRef<HTMLDivElement>(null);

	useOnClickOutside(toolInspectorRef as RefObject<HTMLDivElement>, () => {
		if (!isDesktop) {
			toggleIsToolInspectorOpen();
		}
	});

	useOnClickOutside(clipInspectorRef as RefObject<HTMLDivElement>, () => {
		if (!isDesktop) {
			toggleIsClipInspectorOpen();
		}
	});

	return (
		<div
			className="grid w-svw h-svh overflow-hidden"
			style={{
				gridTemplateRows: `48px minmax(0, 1fr) ${SPLITTER_HEIGHT}px ${timelineHeight}px`,
			}}
		>
			<GlobalHeader />
			<main className="relative bg-zinc-50 dark:bg-zinc-950">
				{project.settings ? (
					<DrawCanvas canvasView={canvasView} />
				) : (
					<div className="absolute grid place-content-center w-full h-full gap-2">
						<Button
							label={t("app.newProject")}
							icon={IconFilePlus}
							variant="primary"
							size="large"
							onClick={() => dialogs.open("createProject")}
						/>
						<Button
							label={t("app.openProject")}
							icon={IconFolderOpen}
							size="large"
							onClick={() => project.open()}
						/>
					</div>
				)}
				{!isDesktop && (
					<>
						{!isToolInspectorOpen && (
							<div className="absolute left-2 bottom-16">
								<Card size="small">
									<IconButton
										label="a"
										icon={IconTools}
										onClick={() => toggleIsToolInspectorOpen()}
									/>
								</Card>
							</div>
						)}
						{selectedClip && clipContext.transform && !isClipInspectorOpen && (
							<div className="absolute right-2 bottom-16">
								<Card size="small">
									<IconButton
										label="a"
										icon={IconAdjustmentsHorizontal}
										onClick={() => toggleIsClipInspectorOpen()}
									/>
								</Card>
							</div>
						)}
					</>
				)}
				{(isDesktop || isToolInspectorOpen) && (
					<div
						className="absolute left-0 h-full w-60 p-2 pb-16 flex flex-col gap-2 overflow-y-auto"
						ref={toolInspectorRef}
					>
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
				)}
				{selectedClip &&
					clipContext.transform &&
					(isDesktop || isClipInspectorOpen) && (
						<div
							className="absolute right-0 h-full w-60 p-2 pb-16 flex flex-col gap-2 overflow-y-auto"
							ref={clipInspectorRef}
						>
							<ClipInspector
								clip={selectedClip}
								isLayerLocked={layerContext.isLayerLocked(
									selectedClip.layer_id,
								)}
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
						</div>
					)}
				<div className="absolute bottom-0 left-0 right-0 overflow-x-auto">
					<div className="mx-auto p-2 w-fit">
						<Toolbar />
					</div>
				</div>
			</main>
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
			<Timeline />
		</div>
	);
};

export default App;
