import { use } from "react";
import { LayerContext } from "./LayerContextValue";

export const useLayer = () => {
	const layer = use(LayerContext);

	if (layer == null) throw new Error("Layer is null");

	return layer;
};
