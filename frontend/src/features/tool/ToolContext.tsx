import { useEffect, useState } from "react";
import { useCore } from "~/infrastructure/core/useCore";
import type { HSVAColor } from "~/shared/lib/color";
import { ToolContext } from "./ToolContextValue";
import type { ToolKind } from "./type";

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const core = useCore();

	const [tool, setTool] = useState<ToolKind>("move");
	const [properties, setProperties] = useState<{ [key: string]: unknown }>({});
	const [color, setColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [colorHistory, setColorHistory] = useState<HSVAColor[]>([color]);

	const COLOR_HISTORY_LIMIT = 100;

	const setProperty = (key: string, value: unknown) => {
		core.setToolProperty(tool, key, value);
		syncProperties();
	};

	const syncProperties = () => {
		setProperties(core.getToolProperties(tool) ?? {});
	};

	const pushColorHistory = (color: HSVAColor) => {
		setColorHistory((prev) => [color, ...prev.slice(0, COLOR_HISTORY_LIMIT)]);
	};

	useEffect(() => {
		syncProperties();
	}, [tool]);

	return (
		<ToolContext
			value={{
				tool,
				color,
				setTool,
				setColor,
				colorHistory,
				pushColorHistory,
				properties,
				setProperty,
			}}
		>
			{children}
		</ToolContext>
	);
};
