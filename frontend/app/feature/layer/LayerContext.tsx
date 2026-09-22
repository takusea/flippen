import { createContext, useEffect, useState } from "react";
import { useCore } from "../Core/useCore";

type LayerContextType = {
	hiddenLayers: number[];
	selectedLayer: number;
	refreshHiddenLayers: () => void;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextType | null>(null);

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [hiddenLayers, setHiddenLayers] = useState<number[]>([]);
	const [selectedLayer, setSelectedLayer] = useState(0);

	const refreshHiddenLayers = () => {
		if (core) {
			setHiddenLayers(Array.from(core.get_hidden_layers()));
		}
	};

	const showLayer = (layer: number) => {
		core.show_layer(layer);
		refreshHiddenLayers();
	};

	const selectLayer = (layer: number) => {
		setSelectedLayer(layer);
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
			value={{
				hiddenLayers,
				selectedLayer,
				refreshHiddenLayers,
				selectLayer,
				showLayer,
				hideLayer,
			}}
		>
			{children}
		</LayerContext>
	);
};
