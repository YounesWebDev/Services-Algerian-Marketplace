import { Link } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";

import Navbar from "@/components/navbar";
import { home as homeRoute } from "@/routes";
import { index as servicesIndex } from "@/routes/services";
import { type SharedData } from "@/types";

export default function Contact() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user ?? null;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="sticky top-0 z-30">
                <Navbar user={user} canRegister />
            </div>

            <div className="mx-auto max-w-3xl px-6 pb-12 pt-5 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Contact Us</h1>
                    <div className="flex gap-3">
                        <Link
                            href={homeRoute.url()}
                            className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition"
                        >
                            Home
                        </Link>
                        <Link
                            href={servicesIndex.url()}
                            className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition"
                        >
                            Services
                        </Link>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground">
                    Need help with an account, booking, or payment issue? Use the details below.
                </p>

                <div className="space-y-4 rounded-2xl border p-5">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                        <p className="font-medium">support@profinder.local</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Phone</p>
                        <p className="font-medium">+213 000 00 00 00</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Hours</p>
                        <p className="font-medium">Saturday to Thursday, 09:00 - 18:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
