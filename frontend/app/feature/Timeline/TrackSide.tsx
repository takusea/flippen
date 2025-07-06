type Props = {
	numTracks: number;
	trackHeight: number;
	scrollY: number;
};

const TrackSide: React.FC<Props> = (props) => {
	return (
		<div
			className="absolute size-full"
			style={{ translate: `0 -${props.scrollY}px` }}
		>
			{[...Array(props.numTracks)].map((_, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={i}
					className="w-full grid place-content-center border-b border-zinc-500/25 bg-zinc-500/25"
					style={{ height: `${props.trackHeight}px` }}
				>
					Layer {i}
				</div>
			))}
		</div>
	);
};

export default TrackSide;
