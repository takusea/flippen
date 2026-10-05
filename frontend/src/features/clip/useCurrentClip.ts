import { useMemo } from "react";
import type { ClipMetadata } from "~/shared/lib/clip";

export const useCurrentClip = (
	clips: ClipMetadata[],
	layer: number,
	frame: number,
) =>
	useMemo(
		() =>
			clips.find(
				(clip) =>
					clip.layer_index === layer &&
					clip.start <= frame &&
					frame < clip.start + clip.duration,
			),
		[clips, frame, layer],
	);
