import { use } from "react";
import { AppearanceContext } from "./AppearanceContext";

export const useAppearance = () => {
	const appearance = use(AppearanceContext);

	if (appearance == null) throw new Error("AppearanceContext is not provided");

	return appearance;
};
