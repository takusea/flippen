import { use } from "react";
import { ToolContext } from "./ToolContextValue";

export const useTool = () => {
	const tool = use(ToolContext);

	if (tool == null) throw new Error("Tool is null");

	return tool;
};
