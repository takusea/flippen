import { TooltipProvider } from "radix-ui/tooltip";
import type { JSX } from "react";
import { CoreProvider } from "~/core/CoreContext";
import { DialogsProvider } from "~/editor/dialogs/DialogsProvider";
import { AppearanceProvider } from "~/features/appearance/AppearanceContext";
import { ClipProvider } from "~/features/clip/ClipContext";
import { UndoStackProvider } from "~/features/history/UndoStackContext";
import { I18nProvider } from "~/features/i18n/I18nContext";
import { LayerProvider } from "~/features/layer/LayerContext";
import { PlaybackProvider } from "~/features/playback/PlaybackContext";
import { ProjectProvider } from "~/features/project/ProjectContext";
import { ShortcutsProvider } from "~/features/shortcuts/ShortcutsContext";
import { ToolProvider } from "~/features/tool/ToolContext";
import { CanvasViewProvider } from "./canvas/useCanvasView";

type Props = {
	children: JSX.Element;
};

function Editor({ children }: Props) {
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

export default Editor;
