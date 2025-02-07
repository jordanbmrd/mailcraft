'use client'
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import React, {useId} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function SignUp() {
    const router = useRouter();
    const id = useId();
    const { toast } = useToast();

    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [usernameError, setUsernameError] = React.useState('');

    const validateUsername = (value: string) => {
        if (value.match(/[A-Z]/)) {
            setUsernameError('Username cannot contain uppercase letters');
            return false;
        }
        if (value.match(/\s/)) {
            setUsernameError('Username cannot contain spaces');
            return false;
        }
        if (!value.match(/^[a-z0-9_-]+$/)) {
            setUsernameError('Username can only contain lowercase letters, numbers, hyphens (-) and underscores (_)');
            return false;
        }
        setUsernameError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validateUsername(username)) {
            return;
        }

        setIsLoading(true);

        try {
            // First create the user in your database
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error,
                });
                setIsLoading(false);
                return;
            }

            // Then sign in the user
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error(result.error);
            }

            router.push('/');
        } catch (error) {
            console.error('Signup error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "An error occurred during registration.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            toast({ variant: "destructive", title: "Error signing in with Google" });
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="mx-auto shadow-xl max-w-md min-w-md">
                <CardContent>
                    <div className="flex flex-col items-center gap-2 mt-8">
                        <div
                            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border"
                            aria-hidden="true"
                        >
                            <svg
                                className="stroke-zinc-800 dark:stroke-zinc-100"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 32 32"
                                aria-hidden="true"
                            >
                                <circle cx="16" cy="16" r="12" fill="none" strokeWidth="8"/>
                            </svg>
                        </div>
                        <CardHeader>
                            <CardTitle className="sm:text-center">Mailcraft - Sign up</CardTitle>
                            <CardDescription className="sm:text-center">
                                We just need a few details to get you started.
                            </CardDescription>
                        </CardHeader>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-2 w-full">
                                    <Label htmlFor={`${id}-username`}>Username</Label>
                                    <Input 
                                        id={`${id}-username`} 
                                        placeholder="mattwelsh" 
                                        type="text" 
                                        value={username} 
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setUsername(value);
                                            validateUsername(value);
                                        }} 
                                        disabled={isLoading}
                                        required
                                    />
                                    {usernameError && (
                                        <p className="text-sm text-red-500 mt-1">{usernameError}</p>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-email`}>Email</Label>
                                <Input 
                                    id={`${id}-email`} 
                                    placeholder="hi@yourcompany.com" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    type="email" 
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-password`}>Password</Label>
                                <Input
                                    id={`${id}-password`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Inscription en cours..." : "Sign up"}
                        </Button>
                    </form>

                    <div
                        className="py-4 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        <span className="text-xs text-muted-foreground">Or</span>
                    </div>

                    <div className="text-center">
                    <Button 
                            variant="outline" 
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <svg className="size-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335"/>
                                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4"/>
                                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.70492L1.27498 6.60992C0.46498 8.22992 0 10.0599 0 11.9999C0 13.9399 0.46498 15.7699 1.28498 17.3899L5.26498 14.2949Z" fill="#FBBC05"/>
                                <path d="M12.0004 24C15.2354 24 17.9504 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.87043 19.245 6.21543 17.135 5.27043 14.29L1.28043 17.385C3.25543 21.31 7.31043 24 12.0004 24Z" fill="#34A853"/>
                            </svg>
                            {isLoading ? 'Signing up...' : 'Continue with Google'}
                        </Button>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By signing up you agree to our{" "}
                        <a className="underline hover:no-underline" href="#">
                            Terms
                        </a>
                        .
                        <br /><br />
                        Already have an account ? <Link href='/signin' className="underline hover:no-underline">Sign in</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default SignUp;
