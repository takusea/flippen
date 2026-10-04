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
	const [lockedLayers, setLockedLayers] = useState<number[]>([]);

	const showLayer = (layer: number) => {
		core.showLayer(layer);
	};

	const selectLayer = (layer: number) => {
		setSelectedLayer(layer);
	};

	const hideLayer = (layer: number) => {
		core.hideLayer(layer);
	};

	const toggleLayerLock = (layer: number) => {
		setLockedLayers((current) =>
			current.includes(layer)
				? current.filter((lockedLayer) => lockedLayer !== layer)
				: [...current, layer],
		);
	};

	return (
		<LayerContext
			value={{
				hiddenLayers,
				lockedLayers,
				selectedLayer,
				selectLayer,
				showLayer,
				hideLayer,
				toggleLayerLock,
			}}
		>
			{children}
		</LayerContext>
	);
};
