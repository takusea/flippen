import { Menubar } from "radix-ui";

type Props = React.ComponentProps<typeof Menubar.Root>;

const MenubarRoot = (props: Props) => {
	return <Menubar.Root className="flex" {...props} />;
};

export default MenubarRoot;
