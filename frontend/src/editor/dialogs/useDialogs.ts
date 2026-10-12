import { use } from "react";
import { DialogsContext } from "./DialogsContext";

export const useDialogs = () => {
	const context = use(DialogsContext);

	if (context == null) throw new Error("DialogsContext is not provided");

	return context;
};
