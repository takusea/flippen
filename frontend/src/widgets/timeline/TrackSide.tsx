import { IconEye, IconEyeOff } from "@tabler/icons-react";
import IconButton from "~/shared/ui/IconButton";

type Props = {
	numTracks: number;
	layerHeight: number;
	scrollY: number;
	hiddenLayers: number[];
	selectedLayer: number;
	onLayerSelect: (id: number) => void;
	onLayerShow: (id: number) => void;
	onLayerHide: (id: number) => void;
};

const TrackSide: React.FC<Props> = (props) => {
	return (
		<div
			className="absolute size-full"
			style={{ translate: `0 -${props.scrollY}px` }}
		>
			{[...Array(props.numTracks)].map((_, i) => {
				const isHidden = props.hiddenLayers.includes(i);
				return (
					<div
						key={i}
						className={`w-full flex items-center justify-between gap-1 border-l-2 border-b border-zinc-500/25 bg-zinc-500/25 ${props.selectedLayer === i ? "border-l-teal-500" : "border-l-transparent"} ${isHidden ? "opacity-50" : ""}`}
						style={{ height: `${props.layerHeight}px` }}
					>
						<button
							type="button"
							className="flex-1 h-full pl-2 text-left"
							onClick={() => props.onLayerSelect(i)}
						>
							Layer {i}
						</button>
						<IconButton
							label={`Layer ${i} を${props.hiddenLayers.includes(i) ? "表示" : "非表示"}`}
							icon={isHidden ? IconEyeOff : IconEye}
							size="small"
							toolTipSide="right"
							onClick={() =>
								isHidden ? props.onLayerHide(i) : props.onLayerShow(i)
							}
						/>
					</div>
				);
			})}
		</div>
	);
};

export default TrackSide;
