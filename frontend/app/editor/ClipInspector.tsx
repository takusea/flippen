import NumberField from "~/base/NumberField";
import type { Transform } from "~/util/transform";

type Props = {
	name: string;
	transform: Transform;
	onTransformChange: (transform: Transform) => void;
};

const ClipInspector: React.FC<Props> = (props) => {
	return (
		<>
			<h2 className="font-bold">Property of {props.name}</h2>
			<div className="flex flex-col gap-2">
				<span>Position</span>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						min={0}
						max={100}
						value={props.transform.position[0]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [value, props.transform.position[1]],
							});
						}}
					/>
					<NumberField
						min={0}
						max={100}
						value={props.transform.position[1]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [props.transform.position[0], value],
							});
						}}
					/>
				</div>
				<span>Rotation</span>
				<NumberField
					min={0}
					max={360}
					value={props.transform.rotation}
					onValueChange={(value) => {
						props.onTransformChange({
							...props.transform,
							rotation: value,
						});
					}}
				/>
				<span>Scale</span>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[0]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								scale: [value, props.transform.scale[1]],
							});
						}}
					/>
					<NumberField
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[1]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								scale: [props.transform.scale[0], value],
							});
						}}
					/>
				</div>
			</div>
		</>
	);
};

export default ClipInspector;
