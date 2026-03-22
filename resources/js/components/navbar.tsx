import { Link, usePage } from '@inertiajs/react';
import {
    BookUser,
    Flag,
    GitPullRequest,
    House,
    Info,
    Menu,
    Phone,
    SquareAsterisk,
    Users,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { about, contact, dashboard, home as homeRoute, login, register } from '@/routes';
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
    const { url: currentUrl } = usePage();

    const isActive = (href: string) =>
        currentUrl === href || currentUrl.startsWith(`${href}/`);

    const desktopLinkClass = (href: string) =>
        `p-1 transition flex hover:text-primary ${
            isActive(href) ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''
        }`;
    const closeMenu = () => setOpenMenu(false);
    const mobileLinkClass = (href: string) =>
        `flex items-center gap-2 p-1 transition hover:text-primary ${
            isActive(href) ? 'text-primary font-semibold border-b-2 border-primary pb-1' : ''
        }`;

    useEffect(() => {
        if (!openMenu) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [openMenu]);

    return (
        <div className="w-full px-1 pt-1">
            <div className=" w-full  rounded-full border border-gray-200 bg-primary-foreground/30 backdrop-blur-sm">
                <div className="flex items-center justify-between px-6 py-0">
                <Link
                    className="transition hover:text-primary"
                    href={homeRoute.url()}
                >
                    <img
                        src="/favicon-2.png"
                        alt="Pro finder logo"
                        className="w-30 h-25 "
                    />
                </Link>

                <div className="hidden justify-between gap-15 md:flex">
                    <Link
                        className={desktopLinkClass(homeRoute.url())}
                        href={homeRoute.url()}
                    >
                        <House className='mx-2' />
                        Home
                    </Link>
                    {user?.role === 'provider' ? (
                        <Link
                            className={desktopLinkClass(providerRequestsIndex.url())}
                            href={providerRequestsIndex.url()}
                        >
                            <GitPullRequest className='mx-2' />
                            Requests
                        </Link>
                    ) : user?.role === 'admin' ? (
                        <Link
                            className={desktopLinkClass('/admin/reports')}
                            href="/admin/reports"
                        >
                            <Flag className='mx-2' />
                            Reports
                        </Link>
                    ) : null}
                    {user?.role === 'provider' ? (
                        <Link
                            className={desktopLinkClass(providerServicesIndex.url())}
                            href={providerServicesIndex.url()}
                        >
                            <BookUser className='mx-2' />
                            My Services
                        </Link>
                    ) : user?.role === 'admin' ? (
                        <Link
                            className={desktopLinkClass('/admin/users')}
                            href="/admin/users"
                        >
                            <Users className='mx-2' />
                            Users
                        </Link>
                    ) : (
                        <Link
                            className={desktopLinkClass(servicesIndex.url())}
                            href={servicesIndex.url()}
                        >
                            <SquareAsterisk className='mx-2' />
                            Services
                        </Link>
                    )}
                        <Link
                            className={desktopLinkClass(about.url())}
                            href={about.url()}
                        >
                            <Info className='mx-2' />
                            About
                        </Link>
                        <Link
                            className={desktopLinkClass(contact.url())}
                            href={contact.url()}
                        >
                           <Phone className='mx-2' />
                            Contact
                        </Link>
                </div>

                <div className="relative md:hidden">
                    <button
                        onClick={() => setOpenMenu(!openMenu)}
                        aria-expanded={openMenu}
                        aria-label="Toggle navigation menu"
                        type="button"
                        className="rounded-full p-1 transition"
                    >
                        {openMenu ? (
                            <X
                                size={28}
                                className="text-foreground transition-transform duration-200"
                            />
                        ) : (
                            <Menu
                                size={28}
                                className="text-foreground transition-transform duration-200"
                            />
                        )}
                    </button>

                    <div
                        className={`fixed top-24 right-4 z-40 flex w-[min(22rem,calc(100vw-2rem))] origin-top-right flex-col gap-3 rounded-4xl border border-gray-200 bg-primary-foreground/95 p-4 backdrop-blur-xl transition-all text-black duration-250 ease-out ${
                            openMenu
                                ? 'translate-y-0 scale-100 opacity-100'
                                : 'pointer-events-none -translate-y-3 scale-95 opacity-0'
                        }`}
                    >
                        {user ? (
                            <Link
                                href={dashboard().url}
                                onClick={closeMenu}
                                className="inline-flex items-center justify-center rounded-full border border-gray-200 px-5 py-1.5 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex justify-center gap-3">
                                <Link
                                    href={login().url}
                                    onClick={closeMenu}
                                    className="flex items-center justify-center rounded-3xl border border-gray-200 px-4 py-1.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register().url}
                                        onClick={closeMenu}
                                        className="inline-flex items-center justify-center rounded-3xl border border-gray-200 bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-foreground hover:text-background"
                                    >
                                        Register
                                    </Link>
                                )}
                            </div>
                        )}

                        <Link
                            className={mobileLinkClass(homeRoute.url())}
                            href={homeRoute.url()}
                            onClick={closeMenu}
                        >
                            <House /> Home
                        </Link>

                        {user?.role === 'provider' ? (
                            <Link
                                className={mobileLinkClass(providerRequestsIndex.url())}
                                href={providerRequestsIndex.url()}
                                onClick={closeMenu}
                            >
                                <GitPullRequest /> Requests
                            </Link>
                        ) : user?.role === 'admin' ? (
                            <Link
                                className={mobileLinkClass('/admin/reports')}
                                href="/admin/reports"
                                onClick={closeMenu}
                            >
                                <Flag /> Reports
                            </Link>
                        ) : null}

                        {user?.role === 'provider' ? (
                            <Link
                                className={mobileLinkClass(providerServicesIndex.url())}
                                href={providerServicesIndex.url()}
                                onClick={closeMenu}
                            >
                                <SquareAsterisk /> My Services
                            </Link>
                        ) : user?.role === 'admin' ? (
                            <Link
                                className={mobileLinkClass('/admin/users')}
                                href="/admin/users"
                                onClick={closeMenu}
                            >
                                <UsersRound /> Users
                            </Link>
                        ) : (
                            <Link
                                className={mobileLinkClass(servicesIndex.url())}
                                href={servicesIndex.url()}
                                onClick={closeMenu}
                            >
                                <SquareAsterisk /> Services
                            </Link>
                        )}

                        <Link
                            className={mobileLinkClass(about.url())}
                            href={about.url()}
                            onClick={closeMenu}
                        >
                            <Info /> About
                        </Link>
                        <Link
                            className={mobileLinkClass(contact.url())}
                            href={contact.url()}
                            onClick={closeMenu}
                        >
                            <Info /> Contact
                        </Link>
                    </div>
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
        </div>
    );
}
