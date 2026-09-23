import type { ReactNode } from "react";
import { ClipProvider } from "~/features/clip/ClipContext";
import { UndoStackProvider } from "~/features/history/UndoStackContext";
import { LayerProvider } from "~/features/layer/LayerContext";
import { PlaybackProvider } from "~/features/playback/PlaybackContext";
import { ProjectProvider } from "~/features/project/ProjectContext";
import { ToolProvider } from "~/features/tool/ToolContext";
import { CoreProvider } from "~/infrastructure/core/CoreContext";

type Props = {
	children: ReactNode;
};

function AppProviders({ children }: Props) {
	return (
		<CoreProvider>
			<LayerProvider>
				<ProjectProvider>
					<PlaybackProvider>
						<ClipProvider>
							<UndoStackProvider>
								<ToolProvider>{children}</ToolProvider>
							</UndoStackProvider>
						</ClipProvider>
					</PlaybackProvider>
				</ProjectProvider>
			</LayerProvider>
		</CoreProvider>
	);
}

export default AppProviders;
