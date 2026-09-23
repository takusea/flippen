import { createContext } from "react";
import type { HSVAColor } from "~/shared/lib/color";
import type { ToolKind } from "./type";

type ToolContextType = {
	tool: ToolKind;
	color: HSVAColor;
	colorHistory: HSVAColor[];
	properties: { [key: string]: unknown };
	setTool: (tool: ToolKind) => void;
	setColor: (color: HSVAColor) => void;
	setProperty: (key: string, value: unknown) => void;
	pushColorHistory: (color: HSVAColor) => void;
};

export const ToolContext = createContext<ToolContextType | null>(null);
