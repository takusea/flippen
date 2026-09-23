import { createContext } from "react";

type LayerContextType = {
	hiddenLayers: number[];
	selectedLayer: number;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextType | null>(null);
