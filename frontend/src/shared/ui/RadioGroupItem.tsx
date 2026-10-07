import * as RadioGroupPrimitive from "radix-ui/radio-group";

type Props = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
	label: string;
};

const RadioGroupItem = (props: Props) => (
	<div className="grid grid-cols-[auto_1fr] place-content-center rounded-md hover:not-disabled:bg-zinc-500/20">
		<RadioGroupPrimitive.Item className="group p-1 cursor-pointer" {...props}>
			<div className="size-6 rounded-full border border-zinc-500/40 bg-zinc-500/25 flex items-center justify-center group-data-[state=checked]:bg-teal-500">
				<RadioGroupPrimitive.Indicator className="bg-white size-2 rounded-full" />
			</div>
		</RadioGroupPrimitive.Item>
		<label className="flex items-center cursor-pointer" htmlFor={props.id}>
			{props.label}
		</label>
	</div>
);

export default RadioGroupItem;
