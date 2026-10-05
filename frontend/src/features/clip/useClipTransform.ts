import { useCallback, useEffect, useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

type Options = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	isLayerLocked: (layer: number) => boolean;
};

export const useClipTransform = ({
	clips,
	selectedClipId,
	isLayerLocked,
}: Options) => {
	const core = useCore();
	const [transform, setTransform] = useState<Transform>();

	const syncTransform = useCallback(async () => {
		if (selectedClipId == null) {
			setTransform(undefined);
			return;
		}
		setTransform(await core.getClipTransform(selectedClipId));
	}, [core, selectedClipId]);

	const changeTransform = async (id: string, nextTransform: Transform) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_index)) return;
		setTransform(await core.updateClipTransform(id, nextTransform));
	};

	useEffect(() => {
		syncTransform();
	}, [syncTransform]);

	return { transform, changeTransform, syncTransform };
};
