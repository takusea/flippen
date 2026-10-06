import { useCallback, useEffect, useRef, useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

type Options = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	isLayerLocked: (layer: number) => boolean;
	revision: number;
};

export const useClipTransform = ({
	clips,
	selectedClipId,
	isLayerLocked,
	revision,
}: Options) => {
	const core = useCore();
	const [transform, setTransform] = useState<Transform>();
	const currentRevision = useRef(revision);
	const currentSelectedClipId = useRef(selectedClipId);
	currentRevision.current = revision;
	currentSelectedClipId.current = selectedClipId;

	const syncTransform = useCallback(async () => {
		if (selectedClipId == null) {
			setTransform(undefined);
			return;
		}
		const nextTransform = await core.getClipTransform(selectedClipId);
		if (
			currentRevision.current === revision &&
			currentSelectedClipId.current === selectedClipId
		) {
			setTransform(nextTransform);
		}
	}, [core, revision, selectedClipId]);

	const changeTransform = async (id: string, nextTransform: Transform) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_index)) return;
		setTransform(await core.updateClipTransform(id, nextTransform));
	};

	useEffect(() => {
		void syncTransform();
	}, [syncTransform]);

	return { transform, changeTransform, syncTransform };
};
