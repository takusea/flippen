import { createContext, useState } from "react";
import type { HSVAColor } from "~/util/color";
import type { ToolKind } from "./type";

type ToolContextType = {
	tool: ToolKind;
	color: HSVAColor;
	setTool: (tool: ToolKind) => void;
	setColor: (color: HSVAColor) => void;
};

export const ToolContext = createContext<ToolContextType | null>(null);

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [tool, setTool] = useState<ToolKind>("move");
	const [color, setColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});

	return (
		<ToolContext value={{ tool, color, setTool, setColor }}>
			{children}
		</ToolContext>
	);
};
