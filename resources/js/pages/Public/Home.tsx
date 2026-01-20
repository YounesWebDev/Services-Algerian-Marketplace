import { Head, Link, usePage } from '@inertiajs/react';

import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

export default function Home({
    canRegister,
    featuredCategories = [],
    topCities = [],
    }: {
    canRegister: boolean;
    featuredCategories: Category[];
    topCities: City[];
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>
                        <section>
                            <h2 className="font-semibold mb-2">Categories</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {featuredCategories.map((c) => (
                                <div key={c.id} className="border rounded p-2">
                                {c.name}
                                </div>
                            ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="font-semibold mb-2">Cities</h2>
                            <div className="flex flex-wrap gap-2">
                            {topCities.map((city) => (
                                <span key={city.id} className="border rounded px-2 py-1">
                                {city.name}
                                </span>
                            ))}
                            </div>
                        </section>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
