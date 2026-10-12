import { type JSX, useEffect, useState } from "react";
import { CoreContext } from "./CoreContext";
import { CoreService } from "./CoreService";

type Props = {
	children: JSX.Element;
};

export const CoreProvider = ({ children }: Props) => {
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
