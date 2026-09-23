import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import Editor from "~/app/App";
import AppProviders from "~/app/AppProviders";
import GlobalNavigation from "~/widgets/global-navigation/GlobalNavigation";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppProviders>
			<GlobalNavigation>
				<Editor />
			</GlobalNavigation>
		</AppProviders>
	</StrictMode>,
);
