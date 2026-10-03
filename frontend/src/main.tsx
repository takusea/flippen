import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import Editor from "~/app/App";
import AppProviders from "~/app/AppProviders";
import GlobalNavigation from "~/widgets/global-navigation/GlobalNavigation";

const preventDefault = (event: Event) => event.preventDefault();
const preventKeydownDefault = (event: KeyboardEvent) => {
	const target = event.target;
	if (
		target instanceof HTMLElement &&
		(target.isContentEditable || target.closest("input, textarea, select"))
	) {
		return;
	}

	event.preventDefault();
};

document.addEventListener("contextmenu", preventDefault);
document.addEventListener("keydown", preventKeydownDefault);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppProviders>
			<GlobalNavigation>
				<Editor />
			</GlobalNavigation>
		</AppProviders>
	</StrictMode>,
);
