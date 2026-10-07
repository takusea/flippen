import {
	IconAlpha,
	IconEye,
	IconEyeOff,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-react";
import { useI18n } from "~/features/i18n/useI18n";
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
	onInteractionStart: () => void;
	onInteractionEnd: () => void;
};

const ClipInspector: React.FC<Props> = (props) => {
	const { t } = useI18n();
	const isLocked = props.clip.locked || props.isLayerLocked;

	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">
					{t("inspector.propertyOf", { name: props.clip.name })}
				</h2>
				<div className="flex gap-1">
					<IconButton
						icon={props.clip.hidden ? IconEyeOff : IconEye}
						label={
							props.clip.hidden ? t("inspector.show") : t("inspector.hide")
						}
						variant={props.clip.hidden ? "primary" : undefined}
						aria-pressed={props.clip.hidden}
						disabled={isLocked}
						onClick={() =>
							props.onPropertiesChange({ hidden: !props.clip.hidden })
						}
					/>
					<IconButton
						icon={IconAlpha}
						label={t("inspector.lockAlpha")}
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
						label={isLocked ? t("inspector.unlock") : t("inspector.lock")}
						variant={isLocked ? "primary" : undefined}
						aria-pressed={isLocked}
						onClick={() => props.onPropertiesChange({ locked: !isLocked })}
					/>
				</div>
				<label htmlFor="clipName">{t("inspector.name")}</label>
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
				<label htmlFor="clipStart">{t("inspector.start")}</label>
				<NumberField
					id="clipStart"
					min={0}
					value={props.clip.start}
					disabled={isLocked}
					onInteractionStart={props.onInteractionStart}
					onInteractionEnd={props.onInteractionEnd}
					onValueChange={props.onStartChange}
				/>
				<label htmlFor="clipLength">{t("inspector.length")}</label>
				<NumberField
					id="clipLength"
					min={1}
					value={props.clip.duration}
					disabled={isLocked}
					onInteractionStart={props.onInteractionStart}
					onInteractionEnd={props.onInteractionEnd}
					onValueChange={props.onDurationChange}
				/>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipPosition">{t("inspector.position")}</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipPosition"
						aria-label={t("inspector.positionX")}
						value={props.transform.position[0]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [value, props.transform.position[1]],
							});
						}}
					/>
					<NumberField
						id="clipPositionY"
						aria-label={t("inspector.positionY")}
						value={props.transform.position[1]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								position: [props.transform.position[0], value],
							});
						}}
					/>
				</div>
				<label htmlFor="clipAnchor">{t("inspector.anchor")}</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipAnchor"
						aria-label={t("inspector.anchorX")}
						min={0}
						max={1}
						step={0.01}
						value={props.transform.anchor[0]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								anchor: [value, props.transform.anchor[1]],
							});
						}}
					/>
					<NumberField
						id="clipAnchorY"
						aria-label={t("inspector.anchorY")}
						min={0}
						max={1}
						step={0.01}
						value={props.transform.anchor[1]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								anchor: [props.transform.anchor[0], value],
							});
						}}
					/>
				</div>
				<label htmlFor="clipRotation">{t("inspector.rotation")}</label>
				<NumberField
					id="clipRotation"
					min={0}
					max={360}
					value={props.transform.rotation}
					disabled={isLocked}
					onInteractionStart={props.onInteractionStart}
					onInteractionEnd={props.onInteractionEnd}
					onValueChange={(value) => {
						props.onTransformChange({
							...props.transform,
							rotation: value,
						});
					}}
				/>
				<label htmlFor="clipScale">{t("inspector.scale")}</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipScale"
						aria-label={t("inspector.scaleX")}
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[0]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								scale: [value, props.transform.scale[1]],
							});
						}}
					/>
					<NumberField
						id="clipScaleY"
						aria-label={t("inspector.scaleY")}
						min={0}
						max={10}
						step={0.01}
						value={props.transform.scale[1]}
						disabled={isLocked}
						onInteractionStart={props.onInteractionStart}
						onInteractionEnd={props.onInteractionEnd}
						onValueChange={(value) => {
							props.onTransformChange({
								...props.transform,
								scale: [props.transform.scale[0], value],
							});
						}}
					/>
				</div>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipOpacity">{t("inspector.opacity")}</label>
				<NumberField
					id="clipOpacity"
					min={0}
					max={1}
					step={0.01}
					value={props.clip.opacity}
					disabled={isLocked}
					onInteractionStart={props.onInteractionStart}
					onInteractionEnd={props.onInteractionEnd}
					onValueChange={(opacity) => props.onPropertiesChange({ opacity })}
				/>
				<label htmlFor="clipBlendMode">{t("inspector.blendMode")}</label>
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
					<SelectItem value="normal">
						{t("inspector.blendMode.normal")}
					</SelectItem>
					<SelectItem value="multiply">
						{t("inspector.blendMode.multiply")}
					</SelectItem>
					<SelectItem value="screen">
						{t("inspector.blendMode.screen")}
					</SelectItem>
					<SelectItem value="add">{t("inspector.blendMode.add")}</SelectItem>
				</Select>
			</div>
		</Card>
	);
};

export default ClipInspector;
