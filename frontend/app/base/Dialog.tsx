import * as DialogPrimitive from "@radix-ui/react-dialog";
import { IconX } from "@tabler/icons-react";
import IconButton from "./IconButton";
import Button from "./Button";

type Props = React.ComponentProps<typeof DialogPrimitive.Root> & {
	title: string;
	description?: string;
	cancelText?: string;
	submitText?: string;
	onCancel?: () => void;
	onSubmit?: () => void;
};

export const DialogContent: React.FC<Props> = (props) => {
	return (
		<DialogPrimitive.Portal {...props}>
			<DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
			<DialogPrimitive.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 p-4 border-1 border-zinc-500/25 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-xl">
				<div className="flex w-full justify-between items-start">
					<DialogPrimitive.Title className="text-lg font-medium mb-4">
						{props.title}
					</DialogPrimitive.Title>
					<DialogPrimitive.Close asChild>
						<IconButton label="ダイアログを閉じる" icon={IconX} />
					</DialogPrimitive.Close>
				</div>
				{props.description && (
					<DialogPrimitive.Description>
						{props.description}
					</DialogPrimitive.Description>
				)}
				{props.children}
				<div className="flex w-full justify-end gap-1 mt-4">
					{props.cancelText && (
						<DialogPrimitive.Close asChild>
							<Button label={props.cancelText} onClick={props.onCancel} />
						</DialogPrimitive.Close>
					)}
					{props.submitText && (
						<DialogPrimitive.Close asChild>
							<Button
								variant="primary"
								label={props.submitText}
								onClick={props.onSubmit}
							/>
						</DialogPrimitive.Close>
					)}
				</div>
			</DialogPrimitive.Content>
		</DialogPrimitive.Portal>
	);
};

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
