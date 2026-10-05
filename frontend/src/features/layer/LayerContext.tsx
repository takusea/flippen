import { useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import { useCoreSnapshot } from "~/infrastructure/core/useCoreSnapshot";
import { LayerContext } from "./LayerContextValue";

export const LayerProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const { hiddenLayers } = useCoreSnapshot();
	const [selectedLayer, setSelectedLayer] = useState(0);
	const [lockedLayers, setLockedLayers] = useState<number[]>([]);

	const showLayer = async (layer: number) => {
		await core.showLayer(layer);
	};

	const selectLayer = (layer: number) => {
		setSelectedLayer(layer);
	};

	const hideLayer = async (layer: number) => {
		await core.hideLayer(layer);
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
