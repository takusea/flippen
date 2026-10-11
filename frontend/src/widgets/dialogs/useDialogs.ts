import { use } from "react";
import { DialogsContext } from "./DialogsContextValue";

export const useDialogs = () => {
	const dialogs = use(DialogsContext);

	if (dialogs == null) throw new Error("DialogsContext is not provided");

	return dialogs;
};
