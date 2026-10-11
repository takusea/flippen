import { TooltipProvider } from "radix-ui/tooltip";
import type { ReactNode } from "react";
import { AppearanceProvider } from "~/features/appearance/AppearanceContext";
import { ClipProvider } from "~/features/clip/ClipContext";
import { UndoStackProvider } from "~/features/history/UndoStackContext";
import { I18nProvider } from "~/features/i18n/I18nContext";
import { LayerProvider } from "~/features/layer/LayerContext";
import { PlaybackProvider } from "~/features/playback/PlaybackContext";
import { ProjectProvider } from "~/features/project/ProjectContext";
import { ShortcutsProvider } from "~/features/shortcuts/ShortcutsContext";
import { ToolProvider } from "~/features/tool/ToolContext";
import { CoreProvider } from "~/infrastructure/core/CoreContext";
import { CanvasViewProvider } from "~/widgets/canvas/useCanvasView";
import { DialogsProvider } from "~/widgets/dialogs/DialogsProvider";

type Props = {
	children: ReactNode;
};

function AppProviders({ children }: Props) {
	return (
		<TooltipProvider delayDuration={200}>
			<I18nProvider>
				<ShortcutsProvider>
					<AppearanceProvider>
						<CoreProvider>
							<ProjectProvider>
								<PlaybackProvider>
									<LayerProvider>
										<ToolProvider>
											<ClipProvider>
												<UndoStackProvider>
													<DialogsProvider>
														<CanvasViewProvider>{children}</CanvasViewProvider>
													</DialogsProvider>
												</UndoStackProvider>
											</ClipProvider>
										</ToolProvider>
									</LayerProvider>
								</PlaybackProvider>
							</ProjectProvider>
						</CoreProvider>
					</AppearanceProvider>
				</ShortcutsProvider>
			</I18nProvider>
		</TooltipProvider>
	);
}

export default AppProviders;
