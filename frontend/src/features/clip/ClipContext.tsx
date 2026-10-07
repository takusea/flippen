import { useLayer } from "~/features/layer/useLayer";
import { usePlayback } from "~/features/playback/usePlayback";
import { useProject } from "~/features/project/useProject";
import { useCoreSnapshot } from "~/infrastructure/core/useCoreSnapshot";
import { ClipContext } from "./ClipContextValue";
import { useClipboard } from "./useClipboard";
import { useClipCommands } from "./useClipCommands";
import { useClipSelection } from "./useClipSelection";
import { useClipTransform } from "./useClipTransform";
import { useCurrentClip } from "./useCurrentClip";

export const ClipProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const layerContext = useLayer();
	const playbackContext = usePlayback();
	const projectContext = useProject();
	const { clips, revision } = useCoreSnapshot();

	const currentClip = useCurrentClip(
		clips,
		layerContext.selectedLayerId,
		playbackContext.currentFrame,
	);
	const selectionState = useClipSelection({
		clips,
		currentClip,
		currentLayerId: layerContext.selectedLayerId,
		currentFrame: playbackContext.currentFrame,
		selectLayer: layerContext.selectLayer,
		projectSettings: projectContext.settings,
	});
	const commands = useClipCommands({
		clips,
		isLayerLocked: layerContext.isLayerLocked,
		onClipSelected: selectionState.markClipSelected,
	});
	const clipboard = useClipboard({
		currentClip,
		selection: selectionState.selection,
		selectedLayerId: layerContext.selectedLayerId,
		currentFrame: playbackContext.currentFrame,
		projectSettings: projectContext.settings,
		isLayerLocked: layerContext.isLayerLocked,
		onClipSelected: selectionState.markClipSelected,
	});
	const clipTransform = useClipTransform({
		clips,
		selectedClipId: selectionState.selectedClipId,
		isLayerLocked: layerContext.isLayerLocked,
		revision,
	});

	return (
		<ClipContext
			value={{
				clips,
				selectedClipId: selectionState.selectedClipId,
				transform: clipTransform.transform,
				selection: selectionState.selection,
				selectClip: selectionState.selectClip,
				setSelection: selectionState.setSelection,
				...clipboard,
				selectAll: selectionState.selectAll,
				...commands,
				changeTransform: clipTransform.changeTransform,
				syncTransform: clipTransform.syncTransform,
			}}
		>
			{children}
		</ClipContext>
	);
};
