import { useMemo } from "react";
import type { ClipMetadata } from "~/shared/lib/clip";

export const useCurrentClip = (
	clips: ClipMetadata[],
	layerId: string | null,
	frame: number,
) =>
	useMemo(
		() =>
			layerId == null
				? undefined
				: clips.find(
						(clip) =>
							clip.layer_id === layerId &&
							clip.start <= frame &&
							frame < clip.start + clip.duration,
					),
		[clips, frame, layerId],
	);
