import { use } from "react";
import { ClipContext } from "./ClipContextValue";

export const useClip = () => {
	const clip = use(ClipContext);

	if (clip == null) throw new Error("Clip is null");

	return clip;
};
