import { use } from "react";
import { ClipContext } from "./ClipContext";

export const useClip = () => {
	const clip = use(ClipContext);

	if (clip == null) throw new Error("Clip is null");

	return clip;
};
