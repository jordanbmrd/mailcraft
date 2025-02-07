import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LeaveEditorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (action: 'save' | 'quit' | 'cancel') => void;
    isSaving?: boolean;
}

const LeaveEditorDialog = ({ open, onOpenChange, onConfirm, isSaving }: LeaveEditorDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="mb-2">
                    <AlertDialogTitle>Do you want to leave the editor?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You have unsaved changes. What would you like to do?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex md:justify-between w-full">
                    <div>
                        <AlertDialogCancel onClick={() => onConfirm('cancel')}>
                            Cancel
                        </AlertDialogCancel>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:text-red-500"
                            onClick={() => onConfirm('quit')}
                        >
                            Leave without saving
                        </Button>
                        <Button
                            onClick={() => onConfirm('save')}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save and leave'
                            )}
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default LeaveEditorDialog; 