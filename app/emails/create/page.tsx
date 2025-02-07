'use client'
import React, {useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {EditorRef, EmailEditorProps} from "react-email-editor";
import {Button} from "@/components/ui/button";
import {redirect, useSearchParams, useRouter} from "next/navigation";
import generateDefaultEmail from "@/app/data/emails/generateDefaultEmail";
import {SendHorizonal, Check, AlertCircle, Loader2, ArrowLeft} from "lucide-react";
import {useSession} from "next-auth/react";
import SendEmailDialog from "@/app/components/send-email-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import LeaveEditorDialog from "@/app/components/leave-editor-dialog";

const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false })

const CreateEmail = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });
    const emailEditorRef = useRef<EditorRef | null>(null);

    const [preview, setPreview] = useState(false);
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [currentEmailId, setCurrentEmailId] = useState<string | null>(searchParams.get("id"));
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);

    const saveDesign = async () => {
        setIsSaving(true);
        const unlayer = emailEditorRef.current?.editor;

        return new Promise<string>((resolve, reject) => {
            unlayer?.exportHtml(async (data) => {
                const { design, html } = data;
                const emailId = currentEmailId;

                try {
                    if (!emailId) {     // New email, create it
                        const response = await fetch('/api/newsletter/email-templates', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: searchParams.get("subject") ?? "Welcome !",
                                subject: searchParams.get("subject") ?? "Welcome !",
                                jsonContent: design,
                                htmlContent: html
                            })
                        });
                        const newEmail = await response.json();
                        setCurrentEmailId(newEmail.id);
                        setHasUnsavedChanges(false);
                        setIsSaved(true);
                        resolve(newEmail.id);
                    } else {            // Existing email, update it
                        await fetch(`/api/newsletter/email-templates/${emailId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                jsonContent: design,
                                htmlContent: html
                            })
                        });
                        setHasUnsavedChanges(false);
                        setIsSaved(true);
                        resolve(emailId);
                    }
                } catch (error) {
                    reject(error);
                } finally {
                    setIsSaving(false);
                }
            });
        });
    };

    const handleSend = async () => {
        try {
            let emailId = currentEmailId;
            
            // Sauvegarder uniquement s'il y a des modifications non sauvegardées
            if (hasUnsavedChanges) {
                emailId = await saveDesign();
                setCurrentEmailId(emailId);
            }
            
            setShowSendDialog(true);
        } catch (error) {
            console.error('Error saving email:', error);
            // TODO: Show error toast
        }
    };

    const togglePreview = () => {
        const unlayer = emailEditorRef.current?.editor;

        if (preview) {
            unlayer?.hidePreview();
            setPreview(false);
        } else {
            // @ts-expect-error: Unlayer types are not up-to-date
            unlayer?.showPreview('desktop');
            setPreview(true);
        }
    };

    const onDesignLoad = (data: string) => {
        console.log('onDesignLoad', data);
    };

    const onLoad: EmailEditorProps['onLoad'] = (unlayer) => {
        console.log('onLoad', unlayer);
        unlayer.addEventListener('design:loaded', onDesignLoad);
        unlayer.addEventListener('design:updated', () => {
            setHasUnsavedChanges(true);
            setIsSaved(false);
        });

        const emailId = searchParams.get("id");

        if (emailId) {      // Load existing email
            const fetchEmailTemplate = async () => {
                const response = await fetch(`/api/newsletter/email-templates/${emailId}`, { method: 'GET' });
                const existingEmail = await response.json();
                console.log(existingEmail);
                unlayer.loadDesign(existingEmail.jsonContent);
                setHasUnsavedChanges(false);
                setIsSaved(true);
            }
            fetchEmailTemplate();
        } else {
            // @ts-expect-error: Unlayer types are not up-to-date
            unlayer.loadDesign(generateDefaultEmail(searchParams.get("subject") ?? "Welcome !", data?.user.username ?? ''));
            setHasUnsavedChanges(true);
            setIsSaved(false);
        }
    };

    const onReady: EmailEditorProps['onReady'] = (unlayer) => {
        console.log('onReady', unlayer);
    };

    const handleBack = () => {
        if (hasUnsavedChanges) {
            setShowLeaveDialog(true);
        } else {
            router.back();
        }
    };

    const handleLeaveConfirm = async (action: 'save' | 'quit' | 'cancel') => {
        if (action === 'cancel') {
            setShowLeaveDialog(false);
        } else if (action === 'quit') {
            router.back();
        } else if (action === 'save') {
            try {
                await saveDesign();
                router.back();
            } catch (error) {
                console.error('Error saving before leaving:', error);
                // TODO: Show error toast
            }
        }
    };

    if (status === "loading") return "Loading...";

    return (
        <div className="flex flex-col relative h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                    <Button
                        variant="ghost"
                        className="w-fit pl-0 text-muted-foreground hover:bg-transparent"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <h1 className="font-bold text-xl">Build your Email Template</h1>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={togglePreview}>
                        {preview ? 'Hide' : 'Show'} Preview
                    </Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline" 
                                    onClick={saveDesign} 
                                    className="flex gap-2"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : !hasUnsavedChanges && isSaved ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <>
                                            Save Design
                                            {hasUnsavedChanges && (
                                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                            )}
                                        </>
                                    )}
                                </Button>
                            </TooltipTrigger>
                            {!hasUnsavedChanges && isSaved ? (
                                <TooltipContent>
                                    <p>Your email has been saved.</p>
                                </TooltipContent>
                            ) : hasUnsavedChanges && (
                                <TooltipContent>
                                    <p>You have unsaved changes.</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                    <Button onClick={handleSend}>
                        Send
                        <SendHorizonal className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <React.StrictMode>
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
                    onReady={onReady}
                    options={{
                        version: "latest",
                        appearance: {
                            theme: "modern_light"
                        }
                    }}
                />
            </React.StrictMode>

            {currentEmailId && (
                <SendEmailDialog
                    open={showSendDialog}
                    onOpenChange={setShowSendDialog}
                    emailId={currentEmailId}
                />
            )}

            <LeaveEditorDialog
                open={showLeaveDialog}
                onOpenChange={setShowLeaveDialog}
                onConfirm={handleLeaveConfirm}
                isSaving={isSaving}
            />
        </div>
    );
};

export default CreateEmail;