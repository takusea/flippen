type Props = Omit<React.ComponentProps<"input">, "className" | "type">;

const TextField: React.FC<Props> = (props) => {
	return (
		<input
			{...props}
			type="text"
			className="h-8 px-2 border border-slate-500/25 bg-slate-500/25 rounded"
		/>
	);
};

export default TextField;
