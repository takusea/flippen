type Props = Omit<React.ComponentProps<"input">, "className" | "type">;

const TextField: React.FC<Props> = (props) => {
	return (
		<input
			{...props}
			type="text"
			className="h-8 px-2 border border-gray-300 rounded"
		/>
	);
};

export default TextField;
