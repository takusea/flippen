import { use } from "react";
import { CoreContext } from "./CoreContextValue";

export const useCore = () => {
	const core = use(CoreContext);

	if (core == null) throw new Error("CoreContext is not provided");

	return core;
};
