import { useState, useSyncExternalStore } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import { LayerContext } from "./LayerContextValue";

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
