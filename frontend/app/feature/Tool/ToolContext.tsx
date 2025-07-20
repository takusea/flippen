import { createContext, useEffect, useState } from "react";
import type { HSVAColor } from "~/util/color";
import { useCore } from "../Core/useCore";
import type { ToolKind } from "./type";

type ToolContextType = {
	tool: ToolKind;
	color: HSVAColor;
	properties: { [key: string]: unknown };
	setTool: (tool: ToolKind) => void;
	setColor: (color: HSVAColor) => void;
	setProperty: (key: string, value: unknown) => void;
};

export const ToolContext = createContext<ToolContextType | null>(null);

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

	const setProperty = (key: string, value: unknown) => {
		core.set_tool_property(tool, key, value);
		syncProperties();
	};

	const syncProperties = () => {
		setProperties(core.get_tool_properties(tool) ?? {});
	};

	useEffect(() => {
		syncProperties();
	}, [tool]);

	return (
		<ToolContext
			value={{ tool, color, setTool, setColor, properties, setProperty }}
		>
			{children}
		</ToolContext>
	);
};
