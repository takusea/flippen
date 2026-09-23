import { createContext, useEffect, useState } from "react";
import { CoreService } from "./CoreService";

export const CoreContext = createContext<CoreService | null>(null);

export const CoreProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [core, setCore] = useState<CoreService | null>(null);

	useEffect(() => {
		let disposed = false;
		void CoreService.create().then((service) => {
			if (!disposed) setCore(service);
		});
		return () => {
			disposed = true;
		};
	}, []);

	if (core == null) return;

	return <CoreContext value={core}>{children}</CoreContext>;
};
