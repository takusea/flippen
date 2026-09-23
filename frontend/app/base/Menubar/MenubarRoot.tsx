import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.Root>;

const MenubarRoot: React.FC<Props> = (props) => {
	return (
		<Menubar.Root className="flex" {...props}>
			{props.children}
		</Menubar.Root>
	);
};

export default MenubarRoot;
