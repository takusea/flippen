import { useRef, useState } from "react";

type Props = Omit<
	React.ComponentProps<"input">,
	"className" | "type" | "min" | "max" | "value"
> & {
	min?: number;
	max?: number;
	value?: number;
	onValueChange?: (value: number) => void;
};

const TextField: React.FC<Props> = (props) => {
	const input = useRef<HTMLInputElement>(null);

	const [isPointerDown, setIsPointerDown] = useState(false);
	const [isMoved, setIsMoved] = useState(false);

	const cursor = isPointerDown ? "cursor-ew-resize" : "cursor-text";

	const handlePointerMove = (event: React.PointerEvent) => {
		if (!(event.buttons & 1) || props.value == null) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		if (event.movementX > 0) {
			setIsMoved(true);
		}

		props.onValueChange?.(
			Math.max(
				props.min ?? 0,
				Math.min(props.value + event.movementX, props.max ?? 100),
			),
		);
	};

	const handlePointerDown = () => {
		setIsPointerDown(true);
	};

	const handlePointerUp = () => {
		setIsPointerDown(false);

		if (!isMoved) {
			if (input.current == null) {
				throw new Error("input.current is null");
			}
			input.current.focus();
			input.current.select();
		}
		setIsMoved(false);
	};

	const handleInputPointerMove = (event: React.PointerEvent) => {
		event.stopPropagation();
	};

	return (
		<div
			className={`relative h-8 border border-zinc-500/25 bg-zinc-500/25 rounded ${cursor}`}
			onPointerMove={handlePointerMove}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
		>
			<input
				{...props}
				ref={input}
				type="number"
				className="absolute inset-[-1px] px-2 pointer-events-none focus:pointer-events-auto"
				onPointerMove={handleInputPointerMove}
			/>
		</div>
	);
};

export default TextField;
