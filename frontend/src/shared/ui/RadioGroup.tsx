import * as RadioGroupPrimitive from "radix-ui/radio-group";

type Props = React.ComponentProps<typeof RadioGroupPrimitive.Root>;

const RadioGroup = (props: Props) => (
	<RadioGroupPrimitive.Root className="flex flex-col gap-2" {...props} />
);

export default RadioGroup;
