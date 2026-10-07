import { useEffect, useRef, useState } from "react";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { LayerId } from "~/shared/lib/layer";

type SelectionRectangle = {
	x: number;
	y: number;
	width: number;
	height: number;
};

type ProjectSettings = {
	width: number;
	height: number;
} | null;

type Options = {
	clips: ClipMetadata[];
	currentClip: ClipMetadata | undefined;
	currentLayerId: LayerId | null;
	currentFrame: number;
	selectLayer: (layerId: LayerId) => void;
	projectSettings: ProjectSettings | undefined;
};

export const useClipSelection = ({
	clips,
	currentClip,
	currentLayerId,
	currentFrame,
	selectLayer,
	projectSettings,
}: Options) => {
	const [selectedClipId, setSelectedClipId] = useState<string>();
	const [selection, setSelection] = useState<SelectionRectangle>();
	const selectionContext = useRef({
		layerId: currentLayerId,
		frame: currentFrame,
	});

	const markClipSelected = (
		id: string,
		layerId: LayerId,
		shouldSelectLayer = false,
	) => {
		selectionContext.current = { layerId, frame: currentFrame };
		if (shouldSelectLayer) selectLayer(layerId);
		setSelectedClipId(id);
	};

	const selectClip = (id: string) => {
		const clip = clips.find((candidate) => candidate.id === id);
		setSelectedClipId(id);
		if (clip != null) {
			selectionContext.current = {
				layerId: clip.layer_id,
				frame: currentFrame,
			};
			selectLayer(clip.layer_id);
		}
	};

	const selectAll = () => {
		if (projectSettings == null) return;
		setSelection({
			x: 0,
			y: 0,
			width: projectSettings.width,
			height: projectSettings.height,
		});
	};

	useEffect(() => {
		const playheadChanged =
			selectionContext.current.layerId !== currentLayerId ||
			selectionContext.current.frame !== currentFrame;
		if (playheadChanged) setSelection(undefined);
		selectionContext.current = {
			layerId: currentLayerId,
			frame: currentFrame,
		};
		if (
			!playheadChanged &&
			selectedClipId != null &&
			clips.some((clip) => clip.id === selectedClipId)
		) {
			return;
		}
		setSelectedClipId(currentClip?.id);
	}, [clips, currentClip, currentFrame, currentLayerId, selectedClipId]);

	return {
		selectedClipId,
		selection,
		setSelection,
		selectClip,
		selectAll,
		markClipSelected,
	};
};
