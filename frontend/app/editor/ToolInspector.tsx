import Card from "~/base/Card";
import Slider from "~/base/Slider";
import { useTool } from "~/feature/Tool/useTool";

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
				{Object.entries(props.properties).map(([key, value]) => (
					<div key={key}>
						<div className="flex gap-1 justify-between">
							<span>{key}</span>
							<span>{value}</span>
						</div>
						<Slider
							min={1}
							max={1000}
							value={[value]}
							onValueChange={(value) => {
								props.onPropertyChange(key, value[0]);
							}}
						/>
					</div>
				))}
			</div>
		</Card>
	);
};

export default ToolInspector;
