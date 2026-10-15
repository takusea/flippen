import { useCore } from "~/core/useCore";
import type { ClipMetadata } from "~/lib/clip";
import type { LayerId } from "~/lib/layer";
import type { Transform } from "~/lib/transform";

type Options = {
	clips: ClipMetadata[];
	clipTransforms: Record<string, Transform>;
	selectedClipId: string | undefined;
	isLayerLocked: (layerId: LayerId) => boolean;
};

export const useClipTransform = ({
	clips,
	clipTransforms,
	selectedClipId,
	isLayerLocked,
}: Options) => {
	const core = useCore();
	const transform =
		selectedClipId == null ? undefined : clipTransforms[selectedClipId];

	const changeTransform = async (id: string, nextTransform: Transform) => {
		const clip = clips.find((candidate) => candidate.id === id);
		if (clip == null || isLayerLocked(clip.layer_id)) return;
		await core.updateClipTransform(id, nextTransform);
	};

	return { transform, changeTransform };
};
