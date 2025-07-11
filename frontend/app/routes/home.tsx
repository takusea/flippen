import { ClipProvider } from "~/feature/Clip/ClipContext";
import { CoreProvider } from "~/feature/Core/CoreContext";
import { LayerProvider } from "~/feature/layer/LayerContext";
import { PlaybackProvider } from "~/feature/Playback/PlaybackContext";
import { ProjectProvider } from "~/feature/Project/ProjectContext";
import { ToolProvider } from "~/feature/Tool/ToolContext";
import { UndoStackProvider } from "~/feature/UndoStack/UndoStackContext";
import GlobalNavigation from "~/layout/GlobalNavigation";
import { Editor } from "../editor";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Flippen" },
		{ name: "description", content: "Flipbook app!" },
	];
}

export default function Home() {
	return (
		<CoreProvider>
			<ClipProvider>
				<LayerProvider>
					<PlaybackProvider>
						<ProjectProvider>
							<UndoStackProvider>
								<ToolProvider>
									<GlobalNavigation>
										<Editor />
									</GlobalNavigation>
								</ToolProvider>
							</UndoStackProvider>
						</ProjectProvider>
					</PlaybackProvider>
				</LayerProvider>
			</ClipProvider>
		</CoreProvider>
	);
}
