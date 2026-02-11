import { router, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { leaveChannel, listenPrivate } from '@/lib/echo';
import { show as myChatsShow } from '@/routes/my/chats';
import { offline, ping } from '@/routes/presence';
import { type BreadcrumbItem, type SharedData } from '@/types';

type AlertData = {
    chat_id: number;
    sender_id: number;
    sender_name: string | null;
    preview: string | null;
};

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { props } = usePage<SharedData>();
    const myUserId = props.auth.user.id;

    // Small popup data (null means hidden).
    const [alertData, setAlertData] = useState<AlertData | null>(null);

    const userChannelName = useMemo(() => `private-user.${myUserId}`, [myUserId]);

    useEffect(() => {
        const getXsrfToken = () => {
            const cookieMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

            if (!cookieMatch) {
                return null;
            }

            return decodeURIComponent(cookieMatch[1]);
        };

        const sendPing = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            const xsrfToken = getXsrfToken();

            if (!xsrfToken) {
                return;
            }

            void fetch(ping.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                credentials: 'same-origin',
            }).catch(() => {
                // Ignore transient network issues for heartbeat.
            });
        };

        const markOffline = () => {
            const xsrfToken = getXsrfToken();

            if (!xsrfToken) {
                return;
            }
            void fetch(offline.url(), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken,
                },
                credentials: 'same-origin',
                keepalive: true,
            }).catch(() => {
                // Ignore unload errors.
            });
        };

        sendPing();

        const timerId = window.setInterval(sendPing, 30_000);

        window.addEventListener('beforeunload', markOffline);

        return () => {
            window.clearInterval(timerId);
            window.removeEventListener('beforeunload', markOffline);
        };
    }, []);

    useEffect(() => {
        // Listen for global message alert on this user's private channel.
        listenPrivate(userChannelName, '.NewMessageAlert', (data) => {
            const eventData = data as AlertData;

            // Skip popup if user is already on the same chat page.
            if (window.location.pathname === myChatsShow.url(eventData.chat_id)) {
                return;
            }

            setAlertData(eventData);

            // Auto hide popup after 6 seconds.
            window.setTimeout(() => {
                setAlertData((current) =>
                    current?.chat_id === eventData.chat_id ? null : current,
                );
            }, 6_000);
        });

        return () => {
            leaveChannel(userChannelName);
        };
    }, [userChannelName]);

    const openChatFromAlert = () => {
        if (!alertData) {
            return;
        }

        router.visit(myChatsShow.url(alertData.chat_id));
        setAlertData(null);
    };

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>

            {/* Global popup alert (visible on all pages). */}
            {alertData ? (
                <button
                    type="button"
                    onClick={openChatFromAlert}
                    className="fixed right-4 bottom-4 z-50 w-80 rounded-lg border bg-white p-3 text-left shadow-lg"
                >
                    <div className="text-sm font-semibold">
                        New message from {alertData.sender_name ?? 'User'}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                        {alertData.preview ?? 'Open chat'}
                    </div>
                </button>
            ) : null}
        </AppShell>
    );
}
