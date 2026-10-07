import {
	IconEye,
	IconEyeOff,
	IconLock,
	IconLockOpen,
} from "@tabler/icons-react";
import { useI18n } from "~/features/i18n/useI18n";
import type { LayerId, LayerState } from "~/shared/lib/layer";
import IconButton from "~/shared/ui/IconButton";

type Props = {
	layers: LayerState[];
	layerHeight: number;
	scrollY: number;
	selectedLayerId: LayerId | null;
	onLayerSelect: (id: LayerId) => void;
	onLayerShow: (id: LayerId) => void;
	onLayerHide: (id: LayerId) => void;
	onLayerLockToggle: (id: LayerId) => void;
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
						className={`w-full overflow-hidden flex items-center justify-between gap-1 border-l-2 border-b border-zinc-500/40 ${props.selectedLayerId === layer.id ? "border-l-teal-500" : "border-l-transparent"} ${isHidden ? "opacity-50" : ""}`}
						style={{ height: `${props.layerHeight}px` }}
					>
						<button
							type="button"
							className="flex-1 h-full px-2 text-left"
							onClick={() => props.onLayerSelect(layer.id)}
						>
							{t("timeline.layer", { index: i })}
						</button>
						<IconButton
							label={t(isHidden ? "timeline.showLayer" : "timeline.hideLayer", {
								index: i,
							})}
							icon={isHidden ? IconEyeOff : IconEye}
							variant={isHidden ? "primary" : "default"}
							aria-pressed={isHidden}
							onClick={() =>
								isHidden
									? props.onLayerShow(layer.id)
									: props.onLayerHide(layer.id)
							}
						/>
						<IconButton
							label={t(
								isLocked ? "timeline.unlockLayer" : "timeline.lockLayer",
								{ index: i },
							)}
							icon={isLocked ? IconLock : IconLockOpen}
							aria-pressed={isLocked}
							variant={isLocked ? "primary" : "default"}
							onClick={() => props.onLayerLockToggle(layer.id)}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default TrackSide;
