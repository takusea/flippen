import "./App.css";
import { Editor } from "~/editor";
import { ClipProvider } from "~/feature/Clip/ClipContext";
import { CoreProvider } from "~/feature/Core/CoreContext";
import { LayerProvider } from "~/feature/layer/LayerContext";
import { PlaybackProvider } from "~/feature/Playback/PlaybackContext";
import { ProjectProvider } from "~/feature/Project/ProjectContext";
import { ToolProvider } from "~/feature/Tool/ToolContext";
import { UndoStackProvider } from "~/feature/UndoStack/UndoStackContext";
import GlobalNavigation from "~/layout/GlobalNavigation";

function App() {
	return (
		<CoreProvider>
			<LayerProvider>
				<ProjectProvider>
					<PlaybackProvider>
						<ClipProvider>
							<UndoStackProvider>
								<ToolProvider>
									<GlobalNavigation>
										<Editor />
									</GlobalNavigation>
								</ToolProvider>
							</UndoStackProvider>
						</ClipProvider>
					</PlaybackProvider>
				</ProjectProvider>
			</LayerProvider>
		</CoreProvider>
	);
}

export default App;
