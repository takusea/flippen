import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useEffect,
	useState,
} from "react";
import enMessages from "./locales/en.json";
import jaMessages from "./locales/ja.json";

const messages = { en: enMessages, ja: jaMessages };

export type Locale = keyof typeof messages;
export type MessageKey = keyof typeof enMessages;

type I18nContextValue = {
	locale: Locale;
	setLocale: Dispatch<SetStateAction<Locale>>;
	t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextValue | null>(null);

const getInitialLocale = (): Locale =>
	navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [locale, setLocale] = useState<Locale>(getInitialLocale);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const t: I18nContextValue["t"] = (key, values = {}) =>
		messages[locale][key].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
			String(values[name] ?? placeholder),
		);

	return <I18nContext value={{ locale, setLocale, t }}>{children}</I18nContext>;
};
