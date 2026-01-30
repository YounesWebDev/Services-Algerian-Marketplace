import { Link } from "@inertiajs/react";

import { home as homeRoute, login, register } from "@/routes";
import { index as providerRequestsIndex } from "@/routes/provider/requests";
import { index as servicesIndex } from "@/routes/services";

type NavbarProps = {
  canRegister: boolean;
};

export default function Navbar({ canRegister }: NavbarProps) {
  return (
    <header className="rounded-b-4xl backdrop-blur-sm border-b border-gray-500 fixed w-full z-30 py-3 bg-primary-foreground/30">
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href={homeRoute.url()} className="hover:scale-105 duration-300">
          <div className="font-bold text-xl">PROfinder</div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-10 text-sm">
          <Link href={homeRoute.url()} className="hover:scale-105 duration-300">
            Home
          </Link>
          <Link href={providerRequestsIndex.url()} className="hover:scale-105 duration-300">
            Requests
          </Link>
          <Link href={servicesIndex.url()} className="hover:scale-105 duration-300">
            Services
          </Link>
        </div>

        {/* Auth */}
        <div className="flex gap-3 text-sm">
          <Link href={login()} className="hover:scale-105 duration-300">
            Login
          </Link>

          {canRegister && (
            <Link
              href={register()}
              className="px-3 py-1 border rounded hover:bg-green-500 hover:text-white duration-300"
            >
              Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
