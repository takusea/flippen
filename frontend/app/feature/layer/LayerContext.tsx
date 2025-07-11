import { createContext, useEffect, useState } from "react";
import { useCore } from "../Core/useCore";

type LayerContextType = {
	hiddenLayers: number[];
	refreshHiddenLayers: () => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextType | null>(null);

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [hiddenLayers, setHiddenLayers] = useState<number[]>([]);

	const refreshHiddenLayers = () => {
		if (core) {
			setHiddenLayers(Array.from(core.get_hidden_layers()));
		}
	};

	const showLayer = (layer: number) => {
		core.show_layer(layer);
		refreshHiddenLayers();
	};

	const hideLayer = (layer: number) => {
		core.hide_layer(layer);
		refreshHiddenLayers();
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		refreshHiddenLayers();
	}, [core]);

	return (
		<LayerContext
			value={{ hiddenLayers, refreshHiddenLayers, showLayer, hideLayer }}
		>
			{children}
		</LayerContext>
	);
};
