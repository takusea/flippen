import { TooltipProvider } from "radix-ui/tooltip";
import type { JSX } from "react";
import { CoreProvider } from "~/core/CoreProvider";
import { DialogsProvider } from "~/editor/dialogs/DialogsProvider";
import { AppearanceProvider } from "~/features/appearance/AppearanceProvider";
import { ClipProvider } from "~/features/clip/ClipProvider";
import { I18nProvider } from "~/features/i18n/I18nProvider";
import { LayerProvider } from "~/features/layer/LayerProvider";
import { PlaybackProvider } from "~/features/playback/PlaybackProvider";
import { ShortcutsProvider } from "~/features/shortcuts/ShortcutsProvider";
import { ToolProvider } from "~/features/tool/ToolProvider";
import { CanvasViewProvider } from "./canvas/CanvasViewProvider";

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
							<PlaybackProvider>
								<LayerProvider>
									<ToolProvider>
										<ClipProvider>
											<DialogsProvider>
												<CanvasViewProvider>{children}</CanvasViewProvider>
											</DialogsProvider>
										</ClipProvider>
									</ToolProvider>
								</LayerProvider>
							</PlaybackProvider>
						</CoreProvider>
					</AppearanceProvider>
				</ShortcutsProvider>
			</I18nProvider>
		</TooltipProvider>
	);
}

export default Editor;
