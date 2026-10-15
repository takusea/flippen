import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useI18n } from "~/features/i18n/useI18n";
import Button from "./Button";

type Props = React.ComponentProps<typeof DialogPrimitive.Root> & {
	title: string;
	description?: string;
	cancelText?: string;
	submitText?: string;
	onCancel?: () => void;
	onSubmit?: () => void;
};

const Dialog = ({
	title,
	description,
	cancelText,
	submitText,
	onCancel,
	onSubmit,
	children,
	...props
}: Props) => {
	const { t } = useI18n();
	return (
		<DialogPrimitive.Root {...props}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
				<DialogPrimitive.Content className="z-50 fixed grid grid-rows-[auto_1fr_auto] gap-4 left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-120 -translate-x-1/2 -translate-y-1/2 p-4 border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-xl">
					<div className="flex w-full justify-between items-start">
						<DialogPrimitive.Title className="text-lg font-medium">
							{title}
						</DialogPrimitive.Title>
					</div>
					{description && (
						<DialogPrimitive.Description>
							{description}
						</DialogPrimitive.Description>
					)}
					<div className="overflow-y-auto">{children}</div>
					<div className="flex w-full justify-end gap-1">
						<DialogPrimitive.Close asChild>
							<Button
								label={cancelText ?? t("common.close")}
								onClick={onCancel}
							/>
						</DialogPrimitive.Close>
						{submitText && (
							<DialogPrimitive.Close asChild>
								<Button
									variant="primary"
									label={submitText}
									onClick={onSubmit}
								/>
							</DialogPrimitive.Close>
						)}
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
};

export default Dialog;
