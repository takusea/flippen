import {
	IconAlpha,
	IconEye,
	IconEyeOff,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-react";
import Card from "~/components/Card";
import IconButton from "~/components/IconButton";
import NumberField from "~/components/NumberField";
import Select from "~/components/Select/Select";
import SelectItem from "~/components/Select/SelectItem";
import TextField from "~/components/TextField";
import { useI18n } from "~/features/i18n/useI18n";
import type { ClipMetadata, ClipProperties } from "~/lib/clip";
import type { Transform } from "~/lib/transform";

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

const ClipInspector = ({
	clip,
	isLayerLocked,
	transform,
	onStartChange,
	onDurationChange,
	onNameChange,
	onPropertiesChange,
	onTransformChange,
	onInteractionStart,
	onInteractionEnd,
}: Props) => {
	const { t } = useI18n();
	const isLocked = clip.locked || isLayerLocked;

	return (
		<Card>
			<div className="flex flex-col gap-2">
				<h2 className="font-bold">
					{t("inspector.propertyOf", { name: clip.name })}
				</h2>
				<div className="flex gap-1">
					<IconButton
						icon={clip.hidden ? IconEyeOff : IconEye}
						label={clip.hidden ? t("inspector.show") : t("inspector.hide")}
						variant={clip.hidden ? "primary" : undefined}
						aria-pressed={clip.hidden}
						disabled={isLocked}
						onClick={() => onPropertiesChange({ hidden: !clip.hidden })}
					/>
					<IconButton
						icon={IconAlpha}
						label={t("inspector.lockAlpha")}
						variant={clip.alpha_locked ? "primary" : undefined}
						aria-pressed={clip.alpha_locked}
						disabled={isLocked}
						onClick={() =>
							onPropertiesChange({
								alpha_locked: !clip.alpha_locked,
							})
						}
					/>
					<IconButton
						icon={isLocked ? IconLock : IconLockOpen}
						label={isLocked ? t("inspector.unlock") : t("inspector.lock")}
						variant={isLocked ? "primary" : undefined}
						aria-pressed={isLocked}
						onClick={() => onPropertiesChange({ locked: !isLocked })}
					/>
				</div>
				<label htmlFor="clipName">{t("inspector.name")}</label>
				<TextField
					key={`${clip.id}:${clip.name}`}
					id="clipName"
					defaultValue={clip.name}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
					}}
					onBlur={(event) => {
						const nextName = event.currentTarget.value.trim();
						if (nextName.length === 0) {
							event.currentTarget.value = clip.name;
							return;
						}
						event.currentTarget.value = nextName;
						if (nextName !== clip.name) onNameChange(nextName);
					}}
				/>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipStart">{t("inspector.start")}</label>
				<NumberField
					id="clipStart"
					min={0}
					value={clip.start}
					disabled={isLocked}
					onInteractionStart={onInteractionStart}
					onInteractionEnd={onInteractionEnd}
					onValueChange={onStartChange}
				/>
				<label htmlFor="clipLength">{t("inspector.length")}</label>
				<NumberField
					id="clipLength"
					min={1}
					value={clip.duration}
					disabled={isLocked}
					onInteractionStart={onInteractionStart}
					onInteractionEnd={onInteractionEnd}
					onValueChange={onDurationChange}
				/>
				<hr className="text-zinc-500/25" />
				<label htmlFor="clipPosition">{t("inspector.position")}</label>
				<div className="grid grid-cols-2 gap-2">
					<NumberField
						id="clipPosition"
						aria-label={t("inspector.positionX")}
						value={transform.position[0]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								position: [value, transform.position[1]],
							});
						}}
					/>
					<NumberField
						id="clipPositionY"
						aria-label={t("inspector.positionY")}
						value={transform.position[1]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								position: [transform.position[0], value],
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
						value={transform.anchor[0]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								anchor: [value, transform.anchor[1]],
							});
						}}
					/>
					<NumberField
						id="clipAnchorY"
						aria-label={t("inspector.anchorY")}
						min={0}
						max={1}
						step={0.01}
						value={transform.anchor[1]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								anchor: [transform.anchor[0], value],
							});
						}}
					/>
				</div>
				<label htmlFor="clipRotation">{t("inspector.rotation")}</label>
				<NumberField
					id="clipRotation"
					min={0}
					max={360}
					value={transform.rotation}
					disabled={isLocked}
					onInteractionStart={onInteractionStart}
					onInteractionEnd={onInteractionEnd}
					onValueChange={(value) => {
						onTransformChange({
							...transform,
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
						value={transform.scale[0]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								scale: [value, transform.scale[1]],
							});
						}}
					/>
					<NumberField
						id="clipScaleY"
						aria-label={t("inspector.scaleY")}
						min={0}
						max={10}
						step={0.01}
						value={transform.scale[1]}
						disabled={isLocked}
						onInteractionStart={onInteractionStart}
						onInteractionEnd={onInteractionEnd}
						onValueChange={(value) => {
							onTransformChange({
								...transform,
								scale: [transform.scale[0], value],
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
					value={clip.opacity}
					disabled={isLocked}
					onInteractionStart={onInteractionStart}
					onInteractionEnd={onInteractionEnd}
					onValueChange={(opacity) => onPropertiesChange({ opacity })}
				/>
				<label htmlFor="clipBlendMode">{t("inspector.blendMode")}</label>
				<Select
					id="clipBlendMode"
					value={clip.blend_mode}
					disabled={isLocked}
					onValueChange={(blend_mode) =>
						(blend_mode === "normal" ||
							blend_mode === "multiply" ||
							blend_mode === "screen" ||
							blend_mode === "add") &&
						onPropertiesChange({ blend_mode })
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
