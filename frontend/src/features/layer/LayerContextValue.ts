import { createContext } from "react";
import type { LayerState } from "~/shared/lib/layer";

export type LayerContextValue = {
	layers: LayerState[];
	isLayerHidden: (layer: number) => boolean;
	isLayerLocked: (layer: number) => boolean;
	selectedLayer: number;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
	toggleLayerLock: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextValue | null>(null);
