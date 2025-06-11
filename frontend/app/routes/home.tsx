import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Flippen" },
		{ name: "description", content: "Flipbook app!" },
	];
}

export default function Home() {
	return <Welcome />;
}
