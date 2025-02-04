import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useId} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";

function SignIn() {
    const id = useId();
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
                            <CardTitle className="sm:text-center">Welcome back</CardTitle>
                            <CardDescription className="sm:text-center">
                                Enter your credentials to login to your account.
                            </CardDescription>
                        </CardHeader>
                    </div>

                    <form className="space-y-5">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-email`}>Email</Label>
                                <Input id={`${id}-email`} placeholder="hi@yourcompany.com" type="email" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`${id}-password`}>Password</Label>
                                <Input
                                    id={`${id}-password`}
                                    placeholder="Enter your password"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Checkbox id={`${id}-remember`}/>
                                <Label htmlFor={`${id}-remember`} className="font-normal text-muted-foreground">
                                    Remember me
                                </Label>
                            </div>
                            <a className="text-sm underline hover:no-underline" href="#">
                                Forgot password?
                            </a>
                        </div>
                        <Button type="button" className="w-full">
                            Sign in
                        </Button>
                    </form>

                    <div
                        className="py-4 flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        <span className="text-xs text-muted-foreground">Or</span>
                    </div>

                    <div className="text-center">
                        <Button variant="outline">Login with Google</Button>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        You don&apos;t have an account ? <Link href='/signup' className="underline hover:no-underline">Sign
                        up</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default SignIn;
