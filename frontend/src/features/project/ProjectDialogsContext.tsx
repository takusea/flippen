import { type ReactNode, useState } from "react";
import { Dialog } from "~/shared/ui/Dialog";
import CreateNewProjectDialog from "./CreateNewProjectDialog";
import EditProjectSettingsDialog from "./EditProjectSettingsDialog";
import { ProjectDialogsContext } from "./ProjectDialogsContextValue";

type Props = {
	children: ReactNode;
};

export const ProjectDialogsProvider = ({ children }: Props) => {
	const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
		useState(true);
	const [isEditProjectSettingsDialogOpen, setIsEditProjectSettingsDialogOpen] =
		useState(false);

	return (
		<ProjectDialogsContext
			value={{
				openCreateProjectDialog: () => setIsCreateProjectDialogOpen(true),
				openEditProjectSettingsDialog: () =>
					setIsEditProjectSettingsDialogOpen(true),
			}}
		>
			{children}
			<Dialog
				open={isCreateProjectDialogOpen}
				onOpenChange={setIsCreateProjectDialogOpen}
			>
				{isCreateProjectDialogOpen && <CreateNewProjectDialog />}
			</Dialog>
			<Dialog
				open={isEditProjectSettingsDialogOpen}
				onOpenChange={setIsEditProjectSettingsDialogOpen}
			>
				{isEditProjectSettingsDialogOpen && <EditProjectSettingsDialog />}
			</Dialog>
		</ProjectDialogsContext>
	);
};
