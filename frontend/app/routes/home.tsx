import { Editor } from "../editor";
import type { Route } from "./+types/home";
import GlobalNavigation from "~/layout/GlobalNavigation";
import { CoreProvider } from "~/feature/Core/CoreContext";
import { ClipProvider } from "~/feature/Clip/ClipContext";
import { LayerProvider } from "~/feature/layer/LayerContext";
import { PlaybackProvider } from "~/feature/PlayBack/PlayBackContext";
import { ProjectProvider } from "~/feature/Project/ProjectContext";
import { UndoStackProvider } from "~/feature/UndoStack/UndoStackContext";
import { ToolProvider } from "~/feature/Tool/ToolContext";

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
