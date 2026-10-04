import * as RadioGroupPrimitive from "radix-ui/radio-group";

type Props = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
	label: string;
};

const RadioGroupItem = (props: Props) => (
	<div className="flex gap-2 items-center">
		<RadioGroupPrimitive.Item
			className="size-6 rounded-full border border-zinc-500/25 bg-zinc-500/25 flex items-center justify-center data-[state=checked]:bg-teal-500"
			{...props}
		>
			<RadioGroupPrimitive.Indicator className="bg-white size-2 rounded-full" />
		</RadioGroupPrimitive.Item>
		<label htmlFor={props.id}>{props.label}</label>
	</div>
);

export default RadioGroupItem;
