import { use } from "react";
import { ToolContext } from "./ToolContext";

export const useTool = () => {
	const tool = use(ToolContext);

	if (tool == null) throw new Error("ToolContext is not provided");

	return tool;
};
