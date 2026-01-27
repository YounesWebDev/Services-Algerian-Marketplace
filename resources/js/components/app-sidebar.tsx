import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Folder,
    LayoutGrid,
    Wrench,
    ClipboardList,
    MessageSquare,
    Wallet,
    User,
    Tags,
    MapPin,
    Users,
    Briefcase,
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
    { title: "Browse Services", href: "/services", icon: Briefcase },
    { title: "My Requests", href: "/requests", icon: ClipboardList },
    { title: "Chats", href: "/chats", icon: MessageSquare },
    { title: "Bookings", href: "/bookings", icon: ClipboardList },
    { title: "Profile", href: "/profile", icon: User },
];

// ----------------------------
// Provider nav
// ----------------------------
const providerNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "My Services", href: "/services", icon: Wrench  },
    { title: "Requests", href: "/requests", icon: ClipboardList },
    { title: "Chats", href: "/chats", icon: MessageSquare },
    { title: "Payouts", href: "/payouts", icon: Wallet },
    { title: "Profile", href: "/profile", icon: User },
];

// ----------------------------
// Admin nav
// ----------------------------
const adminNavItems: NavItem[] = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
    { title: "Categories", href: "/admin/categories", icon: Tags },
    { title: "Cities", href: "/admin/cities", icon: MapPin },
    { title: "Users", href: "/admin/users", icon: Users },
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

  // logo link: admin goes to /admin/dashboard, others to dashboard()
    const logoHref =
    typeof user?.role === "string" && user.role === "admin"
        ? "/admin/dashboard"
        : dashboard();

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
