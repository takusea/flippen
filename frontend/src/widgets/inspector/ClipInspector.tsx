import {
	IconAlpha,
	IconEye,
	IconEyeOff,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-react";
import type { ClipMetadata, ClipProperties } from "~/shared/lib/clip";
import type { Transform } from "~/shared/lib/transform";
import Card from "~/shared/ui/Card";
import IconButton from "~/shared/ui/IconButton";
import NumberField from "~/shared/ui/NumberField";
import Select from "~/shared/ui/Select";
import SelectItem from "~/shared/ui/SelectItem";
import TextField from "~/shared/ui/TextField";

type Props = {
	clip: ClipMetadata;
	isLayerLocked: boolean;
	transform: Transform;
	onStartChange: (start: number) => void;
	onDurationChange: (duration: number) => void;
	onNameChange: (name: string) => void;
	onPropertiesChange: (properties: Partial<ClipProperties>) => void;
	onTransformChange: (transform: Transform) => void;
};

const ClipInspector: React.FC<Props> = (props) => {
	const isLocked = props.clip.locked || props.isLayerLocked;

	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">Property of {props.clip.name}</h2>
				<div className="flex gap-1">
					<IconButton
						icon={props.clip.hidden ? IconEyeOff : IconEye}
						label={props.clip.hidden ? "Show" : "Hide"}
						size="small"
						variant={props.clip.hidden ? "primary" : undefined}
						aria-pressed={props.clip.hidden}
						disabled={isLocked}
						onClick={() =>
							props.onPropertiesChange({ hidden: !props.clip.hidden })
						}
					/>
					<IconButton
						icon={IconAlpha}
						label="Lock Alpha"
						size="small"
						variant={props.clip.alpha_locked ? "primary" : undefined}
						aria-pressed={props.clip.alpha_locked}
						disabled={isLocked}
						onClick={() =>
							props.onPropertiesChange({
								alpha_locked: !props.clip.alpha_locked,
							})
						}
					/>
					<IconButton
						icon={isLocked ? IconLock : IconLockOpen}
						label={isLocked ? "Unlock" : "Lock"}
						size="small"
						variant={isLocked ? "primary" : undefined}
						aria-pressed={isLocked}
						onClick={() => props.onPropertiesChange({ locked: !isLocked })}
					/>
				</div>
				<label htmlFor="clipName">Name</label>
				<TextField
					key={`${props.clip.id}:${props.clip.name}`}
					id="clipName"
					defaultValue={props.clip.name}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
					}}
					onBlur={(event) => {
						const nextName = event.currentTarget.value.trim();
						if (nextName.length === 0) {
							event.currentTarget.value = props.clip.name;
							return;
						}
						event.currentTarget.value = nextName;
						if (nextName !== props.clip.name) props.onNameChange(nextName);
					}}
				/>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipStart">Start</label>
				<NumberField
					id="clipStart"
					min={0}
					value={props.clip.start}
					disabled={isLocked}
					onValueChange={props.onStartChange}
				/>
				<label htmlFor="clipLength">Length</label>
				<NumberField
					id="clipLength"
					min={1}
					value={props.clip.duration}
					disabled={isLocked}
					onValueChange={props.onDurationChange}
				/>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipPosition">Position</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipPosition"
						aria-label="Position X"
						value={props.transform.position[0]}
						disabled={isLocked}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [value, props.transform.position[1]],
							});
						}}
					/>
					<NumberField
						id="clipPositionY"
						aria-label="Position Y"
						value={props.transform.position[1]}
						disabled={isLocked}
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
						aria-label="Anchor X"
						min={0}
						max={1}
						step={0.01}
						value={props.transform.anchor[0]}
						disabled={isLocked}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								anchor: [value, props.transform.anchor[1]],
							});
						}}
					/>
					<NumberField
						id="clipAnchorY"
						aria-label="Anchor Y"
						min={0}
						max={1}
						step={0.01}
						value={props.transform.anchor[1]}
						disabled={isLocked}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								anchor: [props.transform.anchor[0], value],
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
					disabled={isLocked}
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
						aria-label="Scale X"
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[0]}
						disabled={isLocked}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								scale: [value, props.transform.scale[1]],
							});
						}}
					/>
					<NumberField
						id="clipScaleY"
						aria-label="Scale Y"
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[1]}
						disabled={isLocked}
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
				<NumberField
					id="clipOpacity"
					min={0}
					max={1}
					step={0.01}
					value={props.clip.opacity}
					disabled={isLocked}
					onValueChange={(opacity) => props.onPropertiesChange({ opacity })}
				/>
				<label htmlFor="clipBlendMode">Blend Mode</label>
				<Select
					id="clipBlendMode"
					value={props.clip.blend_mode}
					disabled={isLocked}
					onValueChange={(blend_mode) =>
						(blend_mode === "normal" ||
							blend_mode === "multiply" ||
							blend_mode === "screen" ||
							blend_mode === "add") &&
						props.onPropertiesChange({ blend_mode })
					}
				>
					<SelectItem value="normal">Normal</SelectItem>
					<SelectItem value="multiply">Multiply</SelectItem>
					<SelectItem value="screen">Screen</SelectItem>
					<SelectItem value="add">Add</SelectItem>
				</Select>
			</div>
		</Card>
	);
};

export default ClipInspector;
