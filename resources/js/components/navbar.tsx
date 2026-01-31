import { Button } from "@headlessui/react";
import { Link } from "@inertiajs/react";
import { Menu, X, House, GitPullRequest, Flag, SquareAsterisk, UsersRound, Info } from "lucide-react";
import { useState } from "react";

import { login, register } from "@/routes";


type NavbarProps = {
  user: any;
  canRegister: boolean;
};

export default function Navbar({ user, canRegister }: NavbarProps) {
  const [openMenu, setOpenMenu] = useState(false);

  const dashboardUrl =
    user?.role === "provider" ? "/services/my" : "/admin/reports";

  return (
    <div className="rounded-full mt-5 mx-2 backdrop-blur-sm border border-gray-200 fixed w-full z-30 bg-primary-foreground/30">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link className="hover:text-primary transition" href="/">
          <div className="font-bold text-xl">PROfinder</div>
        </Link>

        <div className="hidden md:flex gap-6">
          <Link className="hover:text-primary transition" href="/">Home</Link>

          {user?.role === "provider" && (
            <Link className="hover:text-primary transition" href="/requests">
              Requests
            </Link>
          )}

          {user?.role === "admin" && (
            <Link className="hover:text-primary transition" href="/admin/reports">
              Reports
            </Link>
          )}

          {user?.role === "provider" ? (
            <Link className="hover:text-primary transition" href="/services/my">
              My Services
            </Link>
          ) : user?.role === "admin" ? (
            <Link className="hover:text-primary transition" href="/admin/users">
              Users
            </Link>
          ) : (
            <Link className="hover:text-primary transition" href="/services">
              Services
            </Link>
          )}

          {!user && (
            <Link className="hover:text-primary transition" href="/about">
              About
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          onClick={() => setOpenMenu(!openMenu)}
          className="md:hidden"
        >
          {openMenu ? <X size={26} /> : <Menu size={26} />}
        </Button>

        {/* Desktop right */}
        <div className="hidden md:flex gap-3 text-sm">
          {user ? (
            <Link
              href={dashboardUrl}
              className="inline-block rounded-full transition p-2 border border-gray-200 hover:bg-primary"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href={login()} className="px-4 py-1.5">
                Log in
              </Link>
              {canRegister && (
                <Link
                  href={register()}
                  className="rounded-sm border px-4 py-1.5"
                >
                  Register
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {openMenu && (
        <div className="absolute right-4 top-20 border z-40 bg-black text-white border-gray-200 rounded-3xl p-5 flex gap-4 flex-col md:hidden w-[75%]">
          {user && (
            <Link
              href={dashboardUrl}
              className="rounded-full border px-5 py-2 text-center hover:bg-white hover:text-black transition"
            >
              Dashboard
            </Link>
          )}

          <Link className="flex gap-3 items-center p-2" href="/">
            <House /> Home
          </Link>

          {user?.role === "provider" && (
            <Link className="flex gap-3 items-center p-2" href="/requests">
              <GitPullRequest /> Requests
            </Link>
          )}

          {user?.role === "admin" && (
            <Link className="flex gap-3 items-center p-2" href="/admin/reports">
              <Flag /> Reports
            </Link>
          )}

          {user?.role === "provider" ? (
            <Link className="flex gap-3 items-center p-2" href="/services/my">
              <SquareAsterisk /> My Services
            </Link>
          ) : user?.role === "admin" ? (
            <Link className="flex gap-3 items-center p-2" href="/admin/users">
              <UsersRound /> Users
            </Link>
          ) : (
            <Link className="flex gap-3 items-center p-2" href="/services">
              <SquareAsterisk /> Services
            </Link>
          )}

          {!user && (
            <Link className="flex gap-3 items-center p-2" href="/about">
              <Info /> About
            </Link>
          )}

          {!user && (
            <div className="flex gap-3 justify-center">
              <Link
                href={login()}
                className="rounded-3xl border px-4 py-2"
              >
                Log in
              </Link>
              {canRegister && (
                <Link
                  href={register()}
                  className="rounded-3xl bg-white text-black px-4 py-2"
                >
                  Register
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
