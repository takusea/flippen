import { use } from "react";
import { CoreContext } from "./CoreContext";

export const useCore = () => {
	const core = use(CoreContext);

	if (core == null) throw new Error("Core is null");

	return core;
};
