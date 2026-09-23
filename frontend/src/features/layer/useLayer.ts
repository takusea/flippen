import { use } from "react";
import { LayerContext } from "./LayerContextValue";

export const useLayer = () => {
	const layer = use(LayerContext);

	if (layer == null) throw new Error("LayerContext is not provided");

	return layer;
};
