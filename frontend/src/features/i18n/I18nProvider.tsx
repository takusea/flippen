import { type ReactNode, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
	I18nContext,
	type I18nContextValue,
	type Locale,
	messages,
} from "./I18nContext";

const STORAGE_KEY = "flippen.language";

const getInitialLocale = (): Locale =>
	navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [locale, setLocale] = useLocalStorage<Locale>(
		STORAGE_KEY,
		getInitialLocale,
	);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const t: I18nContextValue["t"] = (key, values = {}) =>
		messages[locale][key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
			String(values[name] ?? placeholder),
		);

	return <I18nContext value={{ locale, setLocale, t }}>{children}</I18nContext>;
};
