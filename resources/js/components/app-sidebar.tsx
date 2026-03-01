import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    LayoutGrid,
    User as userIcon,
    Tags,
    Briefcase,
    BadgePercent,
    BookUser,
    CircleUser,
    ShieldCheck,
    Flag,
    FileWarning,
    MessageSquare,
    PhoneIncoming,
    Info,
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
import { about, contact, dashboard } from "@/routes";
import { index as adminCategoriesIndex } from "@/routes/admin/categories";
import { index as adminDisputesIndex } from "@/routes/admin/disputes";
import { index as adminPaymentsIndex } from "@/routes/admin/payments";
import { index as adminPayoutsIndex } from "@/routes/admin/payouts";
import { index as adminReportsIndex } from "@/routes/admin/reports";
import { index as adminRequestsIndex } from "@/routes/admin/requests";
import { index as adminServicesIndex } from "@/routes/admin/services";
import { index as adminUsersIndex } from "@/routes/admin/users";
import { index as providersVerificationsIndex } from "@/routes/admin/verifications/providers";
import { index as clientBookingsIndex } from "@/routes/client/bookings";
import {index as requestsIndex} from "@/routes/client/my/requests"
import { index as clientOffersIndex } from "@/routes/client/offers";
import {index as ProvidersProfiles} from "@/routes/client/providers"
import { index as myChatsIndex } from "@/routes/my/chats";
import { show as profileShow } from "@/routes/profiles";
import { index as providerBookingsIndex } from "@/routes/provider/bookings";
import {
    index as providerServicesIndex,
} from "@/routes/provider/my/services";
import { index as providerPayoutsIndex } from "@/routes/provider/payouts";
import { show as providerVerificationShow } from "@/routes/provider/verification";
import { index as servicesIndex } from "@/routes/services";
import { type NavItem, type SharedData, type User } from "@/types";

import AppLogo from "./app-logo";

// ----------------------------
// Footer (same for everyone)
// ----------------------------
const footerNavItems: NavItem[] = [
    {
    title: "About Us",
    href: about.url(),
    icon: Info,
    },
    {
    title: "Contact",
    href: contact.url(),
    icon: PhoneIncoming,
    },
];

// ----------------------------
// Client nav
// ----------------------------
const clientNavItems = (user: User): NavItem[] => [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "Browse Services", href: servicesIndex.url(), icon: Briefcase },
    { title: "My Requests", href: requestsIndex.url(), icon: Briefcase },
    { title: "Providers", href: ProvidersProfiles.url(), icon: CircleUser },
    { title: "Offers", href: clientOffersIndex.url(), icon: BadgePercent },
    { title: "Bookings", href: clientBookingsIndex.url(), icon: BookOpen },
    { title: "Chats", href: myChatsIndex.url(), icon: MessageSquare },
    { title: "Profile", href: profileShow(user.id).url, icon: userIcon },
];

// ----------------------------
// Provider nav
// ----------------------------
const providerNavItems = (user: User): NavItem[] => [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "My Services", href: providerServicesIndex().url, icon: BookUser },
    { title: "Browse Requests", href: "/requests", icon: Briefcase },
    { title: "Verification", href: providerVerificationShow().url, icon: CircleUser },
    { title: "Bookings", href: providerBookingsIndex.url(), icon: BookOpen },
    { title: "Chats", href: myChatsIndex.url(), icon: MessageSquare },
    { title: "Payouts", href: providerPayoutsIndex().url, icon: BadgePercent },
    { title: "Profile", href: profileShow(user.id).url, icon: userIcon },
];

// ----------------------------
// Admin nav
// ----------------------------
const adminNavItems: NavItem[] = [
    { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
    { title: "Users", href: adminUsersIndex().url, icon: userIcon },
    { title: "Services", href: adminServicesIndex().url, icon: Briefcase },
    { title: "Requests", href: adminRequestsIndex().url, icon: BookOpen },
    { title: "Payments", href: adminPaymentsIndex().url, icon: BadgePercent },
    { title: "Payouts", href: adminPayoutsIndex().url, icon: BadgePercent },
    { title: "Categories", href: adminCategoriesIndex().url, icon: Tags },
    { title: "Provider Verifications",href: providersVerificationsIndex().url,icon: ShieldCheck },
    { title: "Disputes",href: adminDisputesIndex().url,icon: Flag },
    { title: "Reports",href: adminReportsIndex().url,icon: FileWarning },
];

// ----------------------------
// Helper: pick menu by role
// role is unknown in your types, so we convert safely.
// ----------------------------
function getNavItems(user: User | undefined): NavItem[] {
    if (!user) return [];

    const r = typeof user.role === "string" ? user.role : undefined;

    if (r === "admin") return adminNavItems;
    if (r === "provider") return providerNavItems(user);

  // default to client
    return clientNavItems(user);
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    const mainNavItems = getNavItems(user);

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
