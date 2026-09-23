import { createContext, useState, useSyncExternalStore } from "react";
import { useCore } from "~/infrastructure/core/useCore";

type LayerContextType = {
	hiddenLayers: number[];
	selectedLayer: number;
	selectLayer: (layer: number) => void;
	showLayer: (layer: number) => void;
	hideLayer: (layer: number) => void;
};

export const LayerContext = createContext<LayerContextType | null>(null);

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const { hiddenLayers } = useSyncExternalStore(
		core.subscribe,
		() => core.getSnapshot(),
		() => core.getSnapshot(),
	);
	const [selectedLayer, setSelectedLayer] = useState(0);

	const showLayer = (layer: number) => {
		core.showLayer(layer);
	};

	const selectLayer = (layer: number) => {
		setSelectedLayer(layer);
	};

	const hideLayer = (layer: number) => {
		core.hideLayer(layer);
	};

	return (
		<LayerContext
			value={{
				hiddenLayers,
				selectedLayer,
				selectLayer,
				showLayer,
				hideLayer,
			}}
		>
			{children}
		</LayerContext>
	);
};
