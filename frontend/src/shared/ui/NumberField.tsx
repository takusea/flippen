import type React from "react";
import { useEffect, useRef, useState } from "react";

type Props = Omit<
	React.ComponentProps<"input">,
	"className" | "type" | "min" | "max" | "value" | "defaultValue"
> & {
	min?: number;
	max?: number;
	value?: number;
	defaultValue?: number;
	onValueChange?: (value: number) => void;
};

const NumberField: React.FC<Props> = (props) => {
	const input = useRef<HTMLInputElement>(null);

	const [isMoved, setIsMoved] = useState<boolean>(false);
	const [innerValue, setInnerValue] = useState<string>("");

	useEffect(() => {
		setInnerValue(
			props.value?.toString() ?? props.defaultValue?.toString() ?? "",
		);
	}, [props.value, props.defaultValue]);

	const cursor = isMoved ? "cursor-ew-resize" : "cursor-text";

	const handlePointerMove = (event: React.PointerEvent) => {
		if (!(event.buttons & 1) || props.value == null) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		if (Math.abs(event.movementX) > 0) {
			setIsMoved(true);
		}

		props.onValueChange?.(
			Math.max(
				props.min ?? 0,
				Math.min(props.value + event.movementX, props.max ?? 100),
			),
		);
	};

	const handlePointerUp = () => {
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

	const handleChange = (event: React.ChangeEvent) => {
		if (!(event.currentTarget instanceof HTMLInputElement)) {
			throw new Error("event.currentTarget is not instanceof HTMLInputElement");
		}

		setInnerValue(event.currentTarget.value);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			if (!(event.currentTarget instanceof HTMLInputElement)) {
				throw new Error(
					"event.currentTarget is not instanceof HTMLInputElement",
				);
			}

			if (Number.isNaN(event.currentTarget.value)) {
				throw new Error("event.currentTarget.value is not a number");
			}

			props.onValueChange?.(
				Math.max(
					props.min ?? 0,
					Math.min(
						Number.parseFloat(event.currentTarget.value),
						props.max ?? 100,
					),
				),
			);
		}
	};

	return (
		<div
			className={`relative h-8 border border-zinc-500/25 bg-zinc-500/25 rounded ${cursor}`}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
		>
			<input
				{...props}
				ref={input}
				type="number"
				value={innerValue}
				className="absolute inset-[-1px] px-2 pointer-events-none focus:pointer-events-auto"
				onPointerMove={handleInputPointerMove}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
			/>
		</div>
	);
};

export default NumberField;
