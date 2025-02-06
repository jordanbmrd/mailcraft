'use client'
import {Input} from "@/components/ui/input";
import {Mail} from "lucide-react";
import {Button} from "@/components/ui/button";
import React from "react";

export default function SubscribeForm(props: SubscribeFormProps) {
    const [email, setEmail] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/newsletter/subscribe/${props.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Subscription failed');
            }

            setMessage({ type: 'success', text: 'Subscription successful!' });
            setEmail("");
        } catch (error) {
            setMessage({
                type: 'error',
                text: error instanceof Error ? error.message : 'Subscription failed'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <div className="relative">
                        <Input
                            id="dialog-subscribe"
                            className="peer ps-9"
                            placeholder="youremail@example.com"
                            type="email"
                            aria-label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div
                            className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                            <Mail size={16} strokeWidth={2} aria-hidden="true"/>
                        </div>
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Subscribing..." : "Subscribe"}
                </Button>
            </form>

            {message && (
                <p className={`mt-4 text-center text-sm ${
                    message.type === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                    {message.text}
                </p>
            )}
        </>
    );
}

interface SubscribeFormProps {
    username: string;
}