import { usePage } from "@inertiajs/react";

import Navbar from "@/components/navbar";
import { type SharedData } from "@/types";

export default function About() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user ?? null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="sticky top-0 z-30">
                <Navbar user={user} canRegister />
            </div>
            <div className="mx-auto max-w-4xl px-6 pb-12 pt-5 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">About PROfinder</h1>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                    PROfinder is a local services marketplace that helps clients find trusted providers faster.
                    Clients can browse services, chat in real-time, and manage bookings from one dashboard.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border p-4">
                        <h2 className="font-semibold">For Clients</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Find providers, compare offers, chat instantly, and track your booking status.
                        </p>
                    </div>
                    <div className="rounded-3xl bg-primary-foreground/30 border p-4 shadow-md transition duration">
                        <h2 className="font-semibold">For Providers</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Publish services, receive requests, and build reputation with verified reviews.
                        </p>
                    </div>
                    <div className="rounded-3xl border p-4">
                        <h2 className="font-semibold">For Safety</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Reporting, verification, and transparent status updates are built into the platform.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}