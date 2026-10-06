import {
	IconEye,
	IconEyeOff,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-react";
import { useI18n } from "~/features/i18n/useI18n";
import type { LayerState } from "~/shared/lib/layer";
import IconButton from "~/shared/ui/IconButton";

type Props = {
	layers: LayerState[];
	layerHeight: number;
	scrollY: number;
	selectedLayer: number;
	onLayerSelect: (id: number) => void;
	onLayerShow: (id: number) => void;
	onLayerHide: (id: number) => void;
	onLayerLockToggle: (id: number) => void;
	onWheel: (event: React.WheelEvent<HTMLDivElement>) => void;
};

const TrackSide: React.FC<Props> = (props) => {
	const { t } = useI18n();

	return (
		<div
			className="absolute size-full"
			style={{ translate: `0 -${props.scrollY}px` }}
			onWheel={props.onWheel}
		>
			{props.layers.map((layer, i) => {
				const isHidden = !layer.visible;
				const isLocked = layer.locked;
				return (
					<div
						key={layer.id}
						className={`w-full overflow-hidden flex items-center justify-between gap-1 border-l-2 border-b border-zinc-500/25 bg-zinc-500/25 ${props.selectedLayer === i ? "border-l-teal-500" : "border-l-transparent"} ${isHidden ? "opacity-50" : ""}`}
						style={{ height: `${props.layerHeight}px` }}
					>
						<button
							type="button"
							className="flex-1 h-full px-2 text-left"
							onClick={() => props.onLayerSelect(i)}
						>
							{t("timeline.layer", { index: i })}
						</button>
						<IconButton
							label={t(isHidden ? "timeline.showLayer" : "timeline.hideLayer", {
								index: i,
							})}
							icon={isHidden ? IconEyeOff : IconEye}
							variant={isHidden ? "primary" : "default"}
							size="small"
							aria-pressed={isHidden}
							onClick={() =>
								isHidden ? props.onLayerShow(i) : props.onLayerHide(i)
							}
						/>
						<IconButton
							label={t(
								isLocked ? "timeline.unlockLayer" : "timeline.lockLayer",
								{ index: i },
							)}
							icon={isLocked ? IconLock : IconLockOpen}
							size="small"
							aria-pressed={isLocked}
							variant={isLocked ? "primary" : "default"}
							onClick={() => props.onLayerLockToggle(i)}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default TrackSide;
