import { Link } from '@inertiajs/react';
import {
    Flag,
    GitPullRequest,
    House,
    Info,
    Menu,
    SquareAsterisk,
    UsersRound,
    X,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { about, dashboard, home as homeRoute, login, register } from '@/routes';
import { index as providerServicesIndex } from '@/routes/provider/my/services';
import { index as providerRequestsIndex } from '@/routes/provider/requests';
import { index as servicesIndex } from '@/routes/services';
import { type User } from '@/types';

type NavbarProps = {
    user: User | null;
    canRegister: boolean;
};

export default function Navbar({ user, canRegister }: NavbarProps) {
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <div className="fixed z-30 mx-2 mt-5 w-full rounded-full border border-gray-200 bg-primary-foreground/30 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                <Link
                    className="transition hover:text-primary"
                    href={homeRoute.url()}
                >
                    <div className="text-xl font-bold">PROfinder</div>
                </Link>

                <div className="hidden justify-between gap-15 md:flex">
                    <Link
                        className="p-1 transition hover:text-primary"
                        href={homeRoute.url()}
                    >
                        Home
                    </Link>
                    {user?.role === 'provider' ? (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href={providerRequestsIndex.url()}
                        >
                            Requests
                        </Link>
                    ) : user?.role === 'admin' ? (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href="/admin/reports"
                        >
                            Reports
                        </Link>
                    ) : null}
                    {user?.role === 'provider' ? (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href={providerServicesIndex.url()}
                        >
                            My Services
                        </Link>
                    ) : user?.role === 'admin' ? (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href="/admin/users"
                        >
                            Users
                        </Link>
                    ) : (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href={servicesIndex.url()}
                        >
                            Services
                        </Link>
                    )}
                    {!user && (
                        <Link
                            className="p-1 transition hover:text-primary"
                            href={about.url()}
                        >
                            About
                        </Link>
                    )}
                </div>

                <div>
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        type="button"
                    >
                        {openMenu ? (
                            <X
                                size={28}
                                className="text-black md:hidden dark:text-white"
                            />
                        ) : (
                            <Menu
                                size={28}
                                className="text-black md:hidden dark:text-white"
                            />
                        )}
                    </button>

                    {openMenu && (
                        <div className="flex flex-col">
                            <div className="absolute top-18 right-4 z-40 flex w-[75%] flex-col gap-10 rounded-l-3xl border border-gray-200 bg-black p-5 text-white md:hidden">
                                {user ? (
                                    <Link
                                        href={dashboard().url}
                                        className="inline-block rounded-full border border-[#19140035] px-5 py-1.5 font-bold text-white duration-700 hover:bg-white hover:text-black"
                                    >
                                        <p className="font-bold text-white">
                                            Dashboard
                                        </p>
                                    </Link>
                                ) : (
                                    <div className="flex justify-center gap-3">
                                        <Link
                                            href={login().url}
                                            className="flex items-center justify-center rounded-3xl border border-gray-200 bg-white/30 p-2 py-1.5 text-sm leading-normal font-bold text-foreground backdrop-blur-sm hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                        >
                                            <p className="font-bold">Log in</p>
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register().url}
                                                className="inline-block w-max rounded-3xl border border-gray-200 bg-primary  p-2 text-sm leading-normal font-bold text-white transition-all hover:border-[#1915014a] hover:backdrop-blur-sm dark:hover:border-[#62605b]"
                                            >
                                                <p className="font-bold">
                                                    Register
                                                </p>
                                            </Link>
                                        )}
                                    </div>
                                )}

                                <Link
                                    className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                    href={homeRoute.url()}
                                >
                                    <House /> Home
                                </Link>

                                {user?.role === 'provider' ? (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                        href={providerRequestsIndex.url()}
                                    >
                                        <GitPullRequest /> Requests
                                    </Link>
                                ) : user?.role === 'admin' ? (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                        href="/admin/reports"
                                    >
                                        <Flag /> Reports
                                    </Link>
                                ) : null}

                                {user?.role === 'provider' ? (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                        href={providerServicesIndex.url()}
                                    >
                                        <SquareAsterisk /> My Services
                                    </Link>
                                ) : user?.role === 'admin' ? (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                        href="/admin/users"
                                    >
                                        <UsersRound /> Users
                                    </Link>
                                ) : (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm"
                                        href={servicesIndex.url()}
                                    >
                                        <SquareAsterisk /> Services
                                    </Link>
                                )}

                                {!user && (
                                    <Link
                                        className="flex items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white/30 p-2 backdrop-blur-sm transition"
                                        href={about.url()}
                                    >
                                        <Info /> About
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden justify-between gap-3 text-sm md:flex">
                    {user ? (
                        <Link
                            href={dashboard().url}
                            className="inline-block rounded-full border border-gray-200 p-2 transition duration-700 hover:bg-primary"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login().url}
                                className="inline-block rounded-3xl border border-gray-200 px-5 py-1.5 text-sm leading-normal text-foreground transirion duration-700 hover:bg-foreground hover:text-background"
                            >
                                Log in
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register().url}
                                    className="inline-block rounded-3xl bg-primary  border border-gray-200 px-5 py-1.5 text-sm leading-normal text-foreground hover:bg-foreground transition duration-700 hover:text-background  "
                                >
                                    Register
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
