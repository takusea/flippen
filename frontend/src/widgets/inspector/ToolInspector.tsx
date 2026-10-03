import { useTool } from "~/features/tool/useTool";
import Card from "~/shared/ui/Card";
import Slider from "~/shared/ui/Slider";

type Props = {
	properties: { [key: string]: unknown };
	onPropertyChange: (key: string, value: unknown) => void;
};

const ToolInspector: React.FC<Props> = (props) => {
	const toolContext = useTool();

	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">
					Property of {toolContext.tool.toUpperCase()} Tool
				</h2>
				{Object.entries(props.properties).map(([key, value]) => {
					const numericValue =
						typeof value === "number" ? value : Number(value);
					const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

					return (
						<div key={key}>
							<div className="flex gap-1 justify-between">
								<span>{key}</span>
								<span>{String(value)}</span>
							</div>
							<Slider
								min={1}
								max={1000}
								value={[safeValue]}
								onValueChange={(value) => {
									props.onPropertyChange(key, value[0]);
								}}
							/>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default ToolInspector;
