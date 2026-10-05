import { useState } from "react";
import { useI18n } from "~/features/i18n/useI18n";
import { Dialog, DialogContent } from "~/shared/ui/Dialog";
import Select from "~/shared/ui/Select";
import SelectItem from "~/shared/ui/SelectItem";
import type { ProjectExportFormat } from "./projectExport";
import { isProjectExportFormat, projectExporters } from "./projectExporters";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onExport: (format: ProjectExportFormat) => void;
};

const ProjectExportDialog: React.FC<Props> = ({
	open,
	onOpenChange,
	onExport,
}) => {
	const { t } = useI18n();
	const [format, setFormat] = useState<ProjectExportFormat>("gif");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				title={t("projectExport.title")}
				cancelText={t("common.cancel")}
				submitText={t("nav.export")}
				onSubmit={() => onExport(format)}
			>
				<div className="flex flex-col gap-2">
					<label htmlFor="project-export-format">
						{t("projectExport.format")}
					</label>
					<Select
						id="project-export-format"
						label={t("projectExport.format")}
						value={format}
						onValueChange={(value) => {
							if (isProjectExportFormat(value)) {
								setFormat(value);
							}
						}}
					>
						{projectExporters.map((exporter) => (
							<SelectItem key={exporter.format} value={exporter.format}>
								{t(exporter.labelKey)}
							</SelectItem>
						))}
					</Select>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ProjectExportDialog;
