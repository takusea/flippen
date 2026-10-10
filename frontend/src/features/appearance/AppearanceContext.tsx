import {
	createContext,
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useEffect,
} from "react";
import {
	type TernaryDarkMode,
	useLocalStorage,
	useTernaryDarkMode,
} from "usehooks-ts";

const STORAGE_KEY = "flippen.accentColor";

type AppearanceContextValue = {
	ternaryDarkMode: TernaryDarkMode;
	setTernaryDarkMode: Dispatch<SetStateAction<TernaryDarkMode>>;
	accentColor: number;
	setAccentColor: Dispatch<SetStateAction<number>>;
};

export const AppearanceContext = createContext<AppearanceContextValue | null>(
	null,
);

export const AppearanceProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
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
