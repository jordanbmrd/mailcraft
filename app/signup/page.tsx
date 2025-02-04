'use client'
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import React, {useId} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {signIn} from "next-auth/react";
import {useRouter} from "next/navigation";

function SignUp() {
    const router = useRouter();
    const id = useId();

    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // First create the user in your database
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
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
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <Card className="mx-auto shadow-xl">
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
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-first-name`}>First name</Label>
                                    <Input id={`${id}-first-name`} placeholder="Matt" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`${id}-last-name`}>Last name</Label>
                                    <Input id={`${id}-last-name`} placeholder="Welsh" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-email`}>Email</Label>
                                <Input id={`${id}-email`} placeholder="hi@yourcompany.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-password`}>Password</Label>
                                <Input
                                    id={`${id}-password`}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full">
                            Sign up
                        </Button>
                    </form>

                    <div
                        className="py-4 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        <span className="text-xs text-muted-foreground">Or</span>
                    </div>

                    <div className="text-center">
                        <Button variant="outline">Continue with Google</Button>
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
