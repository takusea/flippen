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
	onInteractionStart?: () => void;
	onInteractionEnd?: () => void;
};

const NumberField: React.FC<Props> = (props) => {
	const {
		onValueChange,
		onBlur,
		onInteractionStart,
		onInteractionEnd,
		...inputProps
	} = props;
	const input = useRef<HTMLInputElement>(null);
	const dragValue = useRef<number | null>(null);
	const lastCommittedValue = useRef<number | null>(null);
	const interactionStarted = useRef(false);

	const [isMoved, setIsMoved] = useState<boolean>(false);
	const [innerValue, setInnerValue] = useState<string>("");

	useEffect(() => {
		setInnerValue(
			props.value?.toString() ?? props.defaultValue?.toString() ?? "",
		);
	}, [props.value, props.defaultValue]);

	const min = props.min ?? Number.MIN_SAFE_INTEGER;
	const max = props.max ?? Number.MAX_SAFE_INTEGER;
	const step = Number(props.step ?? 1);
	const clamp = (value: number) => {
		return Math.max(min, Math.min(Math.round(value / step) * step, max));
	};

	const cursor = isMoved ? "cursor-ew-resize" : "cursor-text";

	const handlePointerMove = (event: React.PointerEvent) => {
		if (props.disabled || !(event.buttons & 1) || props.value == null) return;

		event.currentTarget.setPointerCapture(event.pointerId);

		if (Math.abs(event.movementX) > 0) {
			setIsMoved(true);
		}

		const currentValue = dragValue.current ?? props.value;
		const nextValue = clamp(currentValue + event.movementX * step);
		dragValue.current = nextValue;
		onValueChange?.(nextValue);
	};

	const finishInteraction = () => {
		dragValue.current = null;
		if (interactionStarted.current) {
			interactionStarted.current = false;
			onInteractionEnd?.();
		}
	};

	const handlePointerDown = (event: React.PointerEvent) => {
		if (props.disabled || event.button !== 0) return;
		interactionStarted.current = true;
		onInteractionStart?.();
	};

	const handlePointerUp = () => {
		finishInteraction();
		if (props.disabled) {
			setIsMoved(false);
			return;
		}

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
		if (props.disabled) return;
		if (!(event.currentTarget instanceof HTMLInputElement)) {
			throw new Error("event.currentTarget is not instanceof HTMLInputElement");
		}

		setInnerValue(event.currentTarget.value);
		lastCommittedValue.current = null;
	};

	const commitValue = (target: HTMLInputElement) => {
		if (props.disabled) return;

		const value = target.valueAsNumber;
		if (!Number.isFinite(value) || value === lastCommittedValue.current) return;

		const nextValue = clamp(value);
		lastCommittedValue.current = nextValue;
		onValueChange?.(nextValue);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			if (!(event.currentTarget instanceof HTMLInputElement)) {
				throw new Error(
					"event.currentTarget is not instanceof HTMLInputElement",
				);
			}

			commitValue(event.currentTarget);
		}
	};

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		commitValue(event.currentTarget);
		onBlur?.(event);
	};

	return (
		<div
			className={`relative h-8 border border-zinc-500/25 bg-zinc-500/25 rounded ${props.disabled ? "opacity-50" : cursor}`}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerCancel={() => {
				finishInteraction();
				setIsMoved(false);
			}}
		>
			<input
				{...inputProps}
				ref={input}
				type="number"
				value={innerValue}
				className="absolute -inset-px px-2 pointer-events-none focus:pointer-events-auto"
				onPointerMove={handleInputPointerMove}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
			/>
		</div>
	);
};

export default NumberField;
