import { useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import { useCoreSnapshot } from "~/infrastructure/core/useCoreSnapshot";
import { LayerContext } from "./LayerContextValue";

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const { layers } = useCoreSnapshot();
	const [selectedLayer, setSelectedLayer] = useState(0);

	const showLayer = async (layer: number) => {
		await core.showLayer(layer);
	};

	const selectLayer = (layer: number) => {
		setSelectedLayer(layer);
	};

	const hideLayer = async (layer: number) => {
		await core.hideLayer(layer);
	};

	const toggleLayerLock = async (layer: number) => {
		if (layers[layer]?.locked) {
			await core.unlockLayer(layer);
			return;
		}
		await core.lockLayer(layer);
	};

	return (
		<LayerContext
			value={{
				layers,
				isLayerHidden: (layer) => layers[layer]?.hidden ?? false,
				isLayerLocked: (layer) => layers[layer]?.locked ?? false,
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
