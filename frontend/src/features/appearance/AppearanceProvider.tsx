import { type JSX, useEffect } from "react";
import { useLocalStorage, useTernaryDarkMode } from "usehooks-ts";
import { AppearanceContext } from "./AppearanceContext";

const STORAGE_KEY = "flippen.accentColor";

export const AppearanceProvider = ({ children }: { children: JSX.Element }) => {
	const { isDarkMode, ternaryDarkMode, setTernaryDarkMode } =
		useTernaryDarkMode();
	const [accentColor, setAccentColor] = useLocalStorage(STORAGE_KEY, 180);

	useEffect(() => {
		document.documentElement.style.setProperty("--hue", accentColor.toString());
	});

	useEffect(() => {
		document.documentElement.dataset.theme = isDarkMode ? "dark" : "light";
	});

	return (
		<AppearanceContext
			value={{
				ternaryDarkMode,
				setTernaryDarkMode,
				accentColor,
				setAccentColor,
			}}
		>
			{children}
		</AppearanceContext>
	);
};
