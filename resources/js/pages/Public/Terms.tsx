import { Link } from "@inertiajs/react";

import { home as homeRoute } from "@/routes";

export default function Terms() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Terms of Use</h1>
                    <Link
                        href={homeRoute.url()}
                        className="rounded-full border px-4 py-2 text-sm hover:bg-muted transition"
                    >
                        Back Home
                    </Link>
                </div>

                <div className="space-y-5 text-sm leading-7 text-muted-foreground">
                    <section>
                        <h2 className="text-base font-semibold text-foreground">1. Platform Role</h2>
                        <p>
                            PROfinder connects clients and providers. Service quality and execution are the provider's
                            responsibility.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">2. User Accounts</h2>
                        <p>
                            Users must keep account details accurate and protect their login credentials.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">3. Payments and Bookings</h2>
                        <p>
                            Payment flow and booking statuses are shown inside each booking page. Disputes should be
                            reported through the platform tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold text-foreground">4. Abuse and Reports</h2>
                        <p>
                            Fraud, harassment, and misuse are not allowed. Report suspicious behavior immediately.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
