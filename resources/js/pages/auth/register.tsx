import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="flex flex-col gap-2">
                                {/* Client option */}
                                <label className="cursor-pointer">
                                    <input
                                    className="peer sr-only"
                                    type="radio"
                                    name="role"
                                    value="client"
                                    defaultChecked
                                    required
                                    />
                                    <div
                                    className="rounded-sm border p-5 transition
                                                peer-checked:border-primary
                                                peer-checked:ring-2 mb-3
                                                peer-checked:ring-primary"
                                    >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">Client</span>
                                        <span
                                        className="ml-auto h-4 w-4 rounded-full border
                                                    peer-checked:border-primary
                                                    peer-checked:bg-primary"
                                        />
                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        I want to post requests and hire providers
                                    </p>
                                    </div>
                                </label>

                                {/* Provider option */}
                                <label className="cursor-pointer">
                                    <input
                                    className="peer sr-only"
                                    type="radio"
                                    name="role"
                                    value="provider"
                                    />
                                    <div
                                    className="rounded-sm border p-5 transition
                                                peer-checked:border-primary
                                                peer-checked:ring-2
                                                peer-checked:ring-primary"
                                    >
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold">Provider</span>
                                        <span
                                        className="ml-auto h-4 w-4 rounded-full border
                                                    peer-checked:border-primary
                                                    peer-checked:bg-primary"
                                        />
                                    </div>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        I want to offer services and get clients
                                    </p>
                                    </div>
                                </label>

                                <InputError message={errors.role} className="mt-2" />
                                </div>


                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
