import { Menubar } from "radix-ui";
import type { ReactNode } from "react";

type Props = {
	children: ReactNode;
};

const MenuBarRoot: React.FC<Props> = (props) => {
	return <Menubar.Root className="flex">{props.children}</Menubar.Root>;
};

export default MenuBarRoot;
