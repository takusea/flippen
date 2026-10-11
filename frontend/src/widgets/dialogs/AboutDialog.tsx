import { useI18n } from "~/features/i18n/useI18n";
import { Dialog, DialogContent } from "~/shared/ui/Dialog";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

const AboutDialog: React.FC<Props> = ({ open, onOpenChange }) => {
	const { t } = useI18n();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent title={t("about.title")} cancelText={t("common.close")}>
				<div className="grid grid-cols-[auto_1fr] gap-2">
					<img
						src="favicon.png"
						width={16}
						height={16}
						alt=""
						className="w-16 [image-rendering:pixelated]"
					/>
					<div className="flex flex-col gap-2">
						<span className="text-lg font-bold">Flippen</span>
						<span>Ver 0.0.1</span>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default AboutDialog;
