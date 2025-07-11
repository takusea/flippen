import { createContext, useEffect, useState } from "react";
import init, { FlippenCore } from "~/pkg/flippen_wasm";

export const CoreContext = createContext<FlippenCore | null>(null);

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [core, setCore] = useState<FlippenCore | null>(null);

	useEffect(() => {
		init().then(() => {
			setCore(new FlippenCore(1280, 720));
		});
	}, []);

	if (core == null) return <div>Loading...</div>;

	return <CoreContext value={core}>{children}</CoreContext>;
};
