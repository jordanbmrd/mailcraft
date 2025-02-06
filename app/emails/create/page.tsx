'use client'
import React, {useRef, useState} from 'react';
import dynamic from 'next/dynamic';
import {EditorRef, EmailEditorProps} from "react-email-editor";
import {Button} from "@/components/ui/button";
import {redirect, useSearchParams} from "next/navigation";
import generateDefaultEmail from "@/app/data/emails/generateDefaultEmail";
import {SendHorizonal} from "lucide-react";
import {useSession} from "next-auth/react";

const EmailEditor = dynamic(() => import('react-email-editor'), { ssr: false })

const CreateEmail = () => {
    const searchParams = useSearchParams();
    const {data, status} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin");
        },
    });
    const emailEditorRef = useRef<EditorRef | null>(null);

    const [preview, setPreview] = useState(false);

    const saveDesign = () => {
        const unlayer = emailEditorRef.current?.editor;

        unlayer?.saveDesign((design: string) => {
            const emailId = searchParams.get("id");

            if (!emailId) {     // New email, create it
                const createEmailTemplate = async () => {
                    await fetch('/api/newsletter/email-templates', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: searchParams.get("subject") ?? "Welcome !",
                            subject: searchParams.get("subject") ?? "Welcome !",
                            jsonContent: design
                        })
                    })
                    console.log('saveDesign', design);
                    alert('Design has been saved');
                }
                createEmailTemplate();
            } else {            // Existing email, update it
                const editEmailTemplate = async () => {
                    await fetch(`/api/newsletter/email-templates/${emailId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            jsonContent: design
                        })
                    })
                    console.log('saveDesign', design);
                    alert('Design has been updated');
                }
                editEmailTemplate();
            }

        });
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

        const emailId = searchParams.get("id");

        if (emailId) {      // Load existing email
            const fetchEmailTemplate = async () => {
                const response = await fetch(`/api/newsletter/email-templates/${emailId}`, { method: 'GET' });
                const existingEmail = await response.json();
                console.log(existingEmail);
                unlayer.loadDesign(existingEmail.jsonContent);
            }
            fetchEmailTemplate();
        } else {
            // @ts-expect-error: Unlayer types are not up-to-date
            unlayer.loadDesign(generateDefaultEmail(searchParams.get("subject") ?? "Welcome !", data?.user.username ?? ''));
        }

    };

    const onReady: EmailEditorProps['onReady'] = (unlayer) => {
        console.log('onReady', unlayer);
    };

    if (status === "loading") return "Loading...";

    return (
        <div className="flex flex-col relative h-full">
            <div className="flex justify-between mb-4">
                <h1 className="font-bold text-xl">Build your Email Template</h1>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={togglePreview}>
                        {preview ? 'Hide' : 'Show'} Preview
                    </Button>
                    <Button variant="outline" onClick={saveDesign}>Save Design</Button>
                    <Button onClick={saveDesign}>
                        Send to all
                    </Button>
                    <Button onClick={saveDesign}>
                        Send to group(s)
                        <SendHorizonal />
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
        </div>
    );
};

export default CreateEmail;