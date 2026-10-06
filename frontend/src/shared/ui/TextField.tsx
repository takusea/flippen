import { useEffect, useState } from "react";

type Props = Omit<React.ComponentProps<"input">, "className" | "type"> & {
	onValueChange?: (value: string) => void;
};

const TextField: React.FC<Props> = (props) => {
	const {
		onValueChange,
		onChange,
		onBlur,
		value,
		defaultValue,
		...inputProps
	} = props;
	const [innerValue, setInnerValue] = useState(
		value?.toString() ?? defaultValue?.toString() ?? "",
	);

	useEffect(() => {
		if (value != null) setInnerValue(value.toString());
	}, [value]);

	const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		onValueChange?.(event.currentTarget.value);
		onBlur?.(event);
		setInnerValue(event.currentTarget.value);
	};

	return (
		<input
			{...inputProps}
			type="text"
			value={innerValue}
			onChange={(event) => {
				setInnerValue(event.currentTarget.value);
				onChange?.(event);
			}}
			onBlur={handleBlur}
			className="h-8 px-2 border border-zinc-500/25 bg-zinc-500/25 rounded"
		/>
	);
};

export default TextField;
