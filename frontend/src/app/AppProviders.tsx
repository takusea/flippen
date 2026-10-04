import type { ReactNode } from "react";
import { ClipProvider } from "~/features/clip/ClipContext";
import { UndoStackProvider } from "~/features/history/UndoStackContext";
import { I18nProvider } from "~/features/i18n/I18nContext";
import { LayerProvider } from "~/features/layer/LayerContext";
import { PlaybackProvider } from "~/features/playback/PlaybackContext";
import { ProjectProvider } from "~/features/project/ProjectContext";
import { ProjectDialogsProvider } from "~/features/project/ProjectDialogsContext";
import { ToolProvider } from "~/features/tool/ToolContext";
import { CoreProvider } from "~/infrastructure/core/CoreContext";
import { CanvasViewProvider } from "~/widgets/canvas/useCanvasView";

type Props = {
	children: ReactNode;
};

function AppProviders({ children }: Props) {
	return (
		<I18nProvider>
			<CoreProvider>
				<ProjectProvider>
					<ProjectDialogsProvider>
						<PlaybackProvider>
							<LayerProvider>
								<ToolProvider>
									<ClipProvider>
										<UndoStackProvider>
											<CanvasViewProvider>{children}</CanvasViewProvider>
										</UndoStackProvider>
									</ClipProvider>
								</ToolProvider>
							</LayerProvider>
						</PlaybackProvider>
					</ProjectDialogsProvider>
				</ProjectProvider>
			</CoreProvider>
		</I18nProvider>
	);
}

export default AppProviders;
