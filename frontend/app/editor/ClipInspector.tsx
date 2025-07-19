import Slider from "~/base/Slider";
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
			{props.transform.position[0]}
			<Slider
				min={0}
				max={100}
				value={[props.transform.position[0]]}
				onValueChange={(value) => {
					props.onTransformChange({
						...props.transform,
						position: [value[0], props.transform.position[1]],
					});
				}}
			/>
			{props.transform.position[1]}
			<Slider
				min={0}
				max={100}
				value={[props.transform.position[1]]}
				onValueChange={(value) => {
					props.onTransformChange({
						...props.transform,
						position: [props.transform.position[0], value[0]],
					});
				}}
			/>
			{props.transform.rotation}
			<Slider
				min={0}
				max={360}
				value={[props.transform.rotation]}
				onValueChange={(value) => {
					props.onTransformChange({
						...props.transform,
						rotation: value[0],
					});
				}}
			/>
			{props.transform.scale[0]}
			<Slider
				min={0}
				max={10}
				step={0.01}
				value={[props.transform.scale[0]]}
				onValueChange={(value) => {
					props.onTransformChange({
						...props.transform,
						scale: [value[0], props.transform.scale[1]],
					});
				}}
			/>
			{props.transform.scale[1]}
			<Slider
				min={0}
				max={10}
				step={0.01}
				value={[props.transform.scale[1]]}
				onValueChange={(value) => {
					props.onTransformChange({
						...props.transform,
						scale: [props.transform.scale[0], value[0]],
					});
				}}
			/>
		</>
	);
};

export default ClipInspector;
