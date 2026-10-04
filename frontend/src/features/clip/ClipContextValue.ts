import { createContext } from "react";
import type { ClipMetadata, ClipProperties } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";

export type ClipContextValue = {
	clips: ClipMetadata[];
	selectedClipId: string | undefined;
	transform: Transform | undefined;
	selection:
		| { x: number; y: number; width: number; height: number }
		| undefined;
	selectClip: (id: string) => void;
	setSelection: (
		selection:
			| { x: number; y: number; width: number; height: number }
			| undefined,
	) => void;
	copy: () => void;
	cut: () => void;
	paste: () => void;
	selectAll: () => void;
	addClip: (start: number, layer: number) => void;
	deleteClip: (id: string) => void;
	moveClip: (id: string, start: number, layer: number) => void;
	changeClipDuration: (id: string, duration: number) => void;
	changeClipName: (id: string, name: string) => void;
	changeClipProperties: (id: string, properties: ClipProperties) => void;
	changeTransform: (id: string, transform: Transform) => void;
	syncTransform: () => void;
	ensureClipAt: (frame: number, layer: number) => string | undefined;
};

export const ClipContext = createContext<ClipContextValue | null>(null);
