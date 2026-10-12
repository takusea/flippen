import { type JSX, useEffect, useState } from "react";
import { useCore } from "~/core/useCore";
import type { HSVAColor } from "~/lib/color";
import { ToolContext } from "./ToolContext";
import type { ToolKind } from "./type";

type Props = {
	children: JSX.Element;
};

export const ToolProvider = ({ children }: Props) => {
	const core = useCore();

	const [tool, setTool] = useState<ToolKind>("pen");
	const [properties, setProperties] = useState<{ [key: string]: unknown }>({});
	const [color, setColor] = useState<HSVAColor>({
		h: 0,
		s: 0,
		v: 0,
		a: 255,
	});
	const [colorHistory, setColorHistory] = useState<HSVAColor[]>([color]);

	const COLOR_HISTORY_LIMIT = 100;

	const setProperty = async (key: string, value: unknown) => {
		await core.setToolProperty(tool, key, value);
		setProperties((await core.getToolProperties(tool)) ?? {});
	};

	const pushColorHistory = (color: HSVAColor) => {
		setColorHistory((prev) => [color, ...prev.slice(0, COLOR_HISTORY_LIMIT)]);
	};

	useEffect(() => {
		let active = true;
		void core.getToolProperties(tool).then((nextProperties) => {
			if (active) setProperties(nextProperties ?? {});
		});
		return () => {
			active = false;
		};
	}, [core.getToolProperties, tool]);

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
