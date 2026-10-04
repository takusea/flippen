import { createContext } from "react";

export type LayerContextValue = {
	hiddenLayers: number[];
	lockedLayers: number[];
	selectedLayer: number;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
	toggleLayerLock: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextValue | null>(null);
