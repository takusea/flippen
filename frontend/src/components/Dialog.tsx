import * as DialogPrimitive from "@radix-ui/react-dialog";
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
	return (
		<DialogPrimitive.Root {...props}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
				<DialogPrimitive.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-120 -translate-x-1/2 -translate-y-1/2 p-4 border border-zinc-500/40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl rounded-xl">
					<div className="flex w-full justify-between items-start">
						<DialogPrimitive.Title className="text-lg font-medium mb-4">
							{title}
						</DialogPrimitive.Title>
					</div>
					{description && (
						<DialogPrimitive.Description>
							{description}
						</DialogPrimitive.Description>
					)}
					{children}
					<div className="flex w-full justify-end gap-1 mt-4">
						{cancelText && (
							<DialogPrimitive.Close asChild>
								<Button label={cancelText} onClick={onCancel} />
							</DialogPrimitive.Close>
						)}
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
