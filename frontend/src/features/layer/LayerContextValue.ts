import { createContext } from "react";

export type LayerContextValue = {
	hiddenLayers: number[];
	selectedLayer: number;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextValue | null>(null);
