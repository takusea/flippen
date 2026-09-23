import { createContext } from "react";
import type { ClipMetadata } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

export type ClipContextValue = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	transform: Transform | undefined;
	selectClip: (id: string) => void;
	addClip: (start: number, layer: number) => void;
	deleteClip: (id: string) => void;
	moveClip: (id: string, start: number, layer: number) => void;
	changeClipDuration: (id: string, duration: number) => void;
	changeTransform: (id: string, transform: Transform) => void;
	syncTransform: () => void;
	ensureClipAt: (frame: number, layer: number) => string | undefined;
};

export const ClipContext = createContext<ClipContextValue | null>(null);
