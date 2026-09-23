import { createContext, useEffect, useState } from "react";
import init, { FlippenCore } from "~/infrastructure/wasm/flippen_wasm";

export const CoreContext = createContext<FlippenCore | null>(null);

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [core, setCore] = useState<FlippenCore | null>(null);

	useEffect(() => {
		init().then(() => {
			setCore(new FlippenCore());
		});
	}, []);

	if (core == null) return;

	return <CoreContext value={core}>{children}</CoreContext>;
};
