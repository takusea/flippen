import { use } from "react";
import { I18nContext } from "./I18nContext";

export const useI18n = () => {
	const i18n = use(I18nContext);

	if (i18n == null) throw new Error("I18nContext is not provided");

	return i18n;
};
