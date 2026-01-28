import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Folder,
    LayoutGrid,
    User,
    Tags,
    Briefcase,
    BadgePercent,
} from "lucide-react";

import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { index as clientBookingsIndex } from "@/routes/client/bookings";
import { index as clientOffersIndex } from "@/routes/client/offers";
import { edit as editProfile } from "@/routes/profile";
import { index as servicesIndex } from "@/routes/services";
import { type NavItem, type SharedData } from "@/types";

import AppLogo from "./app-logo";

// ----------------------------
// Footer (same for everyone)
// ----------------------------
const footerNavItems: NavItem[] = [
    {
    title: "Repository",
    href: "https://github.com/laravel/react-starter-kit",
    icon: Folder,
    },
    {
    title: "Documentation",
    href: "https://laravel.com/docs/starter-kits#react",
    icon: BookOpen,
    },
];

// ----------------------------
// Client nav
// ----------------------------
const clientNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "Browse Services", href: servicesIndex.url(), icon: Briefcase },
    { title: "Offers", href: clientOffersIndex.url(), icon: BadgePercent },
    { title: "Bookings", href: clientBookingsIndex.url(), icon: BookOpen },
    { title: "Profile", href: editProfile(), icon: User },
];

// ----------------------------
// Provider nav
// ----------------------------
const providerNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Browse Requests", href: "/requests", icon: Briefcase },
    { title: "Profile", href: editProfile(), icon: User },
];

// ----------------------------
// Admin nav
// ----------------------------
const adminNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    { title: "Categories", href: "/admin/categories", icon: Tags },
];

// ----------------------------
// Helper: pick menu by role
// role is unknown in your types, so we convert safely.
// ----------------------------
function getNavItems(role: unknown): NavItem[] {
    const r = typeof role === "string" ? role : undefined;

    if (r === "admin") return adminNavItems;
    if (r === "provider") return providerNavItems;

  // default to client
    return clientNavItems;
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const mainNavItems = getNavItems(user?.role);

    const logoHref = dashboard();

    return (
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
                <Link href={logoHref} prefetch>
                <AppLogo />
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
        <NavMain items={mainNavItems} />
        </SidebarContent>

        <SidebarFooter>
        <NavFooter items={footerNavItems} className="mt-auto" />
        <NavUser />
        </SidebarFooter>
    </Sidebar>
    );
}
