import { IconEyeOff, IconLetterA, IconLock } from "@tabler/icons-react";
import type { Transform } from "~/shared/lib/transform";
import Card from "~/shared/ui/Card";
import IconButton from "~/shared/ui/IconButton";
import NumberField from "~/shared/ui/NumberField";
import Select from "~/shared/ui/Select";
import SelectItem from "~/shared/ui/SelectItem";

type Props = {
	name: string;
	transform: Transform;
	onTransformChange: (transform: Transform) => void;
};

const ClipInspector: React.FC<Props> = (props) => {
	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">Property of {props.name}</h2>
				<div className="flex gap-1">
					<IconButton icon={IconEyeOff} label="Hidden" size="small" />
					<IconButton icon={IconLetterA} label="Lock Alpha" size="small" />
					<IconButton icon={IconLock} label="Lock" size="small" />
				</div>
				<label htmlFor="clipStart">Start</label>
				<NumberField id="clipStart" />
				<label htmlFor="clipLength">Length</label>
				<NumberField id="clipLength" />
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipPosition">Position</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipPosition"
						value={props.transform.position[0]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [value, props.transform.position[1]],
							});
						}}
					/>
					<NumberField
						id="clipPositionY"
						value={props.transform.position[1]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [props.transform.position[0], value],
							});
						}}
					/>
				</div>
				<label htmlFor="clipAnchor">Anchor</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipAnchor"
						value={props.transform.position[0]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [value, props.transform.position[1]],
							});
						}}
					/>
					<NumberField
						id="clipAnchorY"
						value={props.transform.position[1]}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [props.transform.position[0], value],
							});
						}}
					/>
				</div>
				<label htmlFor="clipRotation">Rotation</label>
				<NumberField
					id="clipRotation"
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
				<label htmlFor="clipScale">Scale</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipScale"
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
						id="clipScaleY"
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
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipOpacity">Opacity</label>
				<NumberField id="clipOpacity" min={0} max={1} step={0.01} />
				<label htmlFor="clipBlendMode">Blend Mode</label>
				<Select id="clipBlendMode" value="test1">
					<SelectItem value="test1">test1</SelectItem>
					<SelectItem value="test2">test2</SelectItem>
					<SelectItem value="test3">test3</SelectItem>
					<SelectItem value="test4">test4</SelectItem>
				</Select>
			</div>
		</Card>
	);
};

export default ClipInspector;
