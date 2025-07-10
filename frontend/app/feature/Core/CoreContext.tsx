import { createContext, useEffect, useState } from "react";
import init, { FlippenCore } from "~/pkg/flippen_wasm";

type CoreContextType = {
	core: FlippenCore | null;
	isLoaded: boolean;
	error: Error | null;
};

export const CoreContext = createContext<CoreContextType>({
	core: null,
	isLoaded: false,
	error: null,
});

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [core, setCore] = useState<FlippenCore | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		init()
			.then(() => {
				setCore(new FlippenCore(1280, 720));
				setIsLoaded(true);
			})
			.catch(setError);
	}, []);

	return (
		<CoreContext value={{ core, isLoaded, error }}>{children}</CoreContext>
	);
};
