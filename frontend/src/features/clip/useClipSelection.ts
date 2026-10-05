import { useEffect, useRef, useState } from "react";
import type { ClipMetadata } from "~/shared/lib/clip";

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
	currentLayer: number;
	currentFrame: number;
	selectLayer: (layer: number) => void;
	projectSettings: ProjectSettings | undefined;
};

export const useClipSelection = ({
	clips,
	currentClip,
	currentLayer,
	currentFrame,
	selectLayer,
	projectSettings,
}: Options) => {
	const [selectedClipId, setSelectedClipId] = useState<string>();
	const [selection, setSelection] = useState<SelectionRectangle>();
	const selectionContext = useRef({
		layer: currentLayer,
		frame: currentFrame,
	});

	const markClipSelected = (
		id: string,
		layer: number,
		shouldSelectLayer = false,
	) => {
		selectionContext.current = { layer, frame: currentFrame };
		if (shouldSelectLayer) selectLayer(layer);
		setSelectedClipId(id);
	};

	const selectClip = (id: string) => {
		const clip = clips.find((candidate) => candidate.id === id);
		setSelectedClipId(id);
		if (clip != null) {
			selectionContext.current = {
				layer: clip.layer_index,
				frame: currentFrame,
			};
			selectLayer(clip.layer_index);
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
			selectionContext.current.layer !== currentLayer ||
			selectionContext.current.frame !== currentFrame;
		if (playheadChanged) setSelection(undefined);
		selectionContext.current = { layer: currentLayer, frame: currentFrame };
		if (
			!playheadChanged &&
			selectedClipId != null &&
			clips.some((clip) => clip.id === selectedClipId)
		) {
			return;
		}
		setSelectedClipId(currentClip?.id);
	}, [clips, currentClip, currentFrame, currentLayer, selectedClipId]);

	return {
		selectedClipId,
		selection,
		setSelection,
		selectClip,
		selectAll,
		markClipSelected,
	};
};
