import { router, usePage } from '@inertiajs/react';
import { type PropsWithChildren, useEffect, useMemo, useState } from 'react';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { leaveChannel, listenPrivate } from '@/lib/echo';
import { show as myChatsShow } from '@/routes/my/chats';
import { offline, ping } from '@/routes/presence';
import { type BreadcrumbItem, type SharedData } from '@/types';

type AlertData = {
    chat_id: number;
    sender_id: number;
    sender_name: string | null;
    sender_avatar_path: string | null;
    preview: string | null;
};

function toStorageUrl(path: string | null): string {
    if (!path) {
        return '';
    }

    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('/')) {
        return path;
    }

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    return `/storage/${path}`;
}

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
            const cookieEntries = document.cookie.split(';');

            for (const entry of cookieEntries) {
                const trimmedEntry = entry.trim();

                if (!trimmedEntry.startsWith('XSRF-TOKEN=')) {
                    continue;
                }

                return decodeURIComponent(trimmedEntry.slice('XSRF-TOKEN='.length));
            }

            return null;
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
                <Alert
                    role="button"
                    tabIndex={0}
                    onClick={openChatFromAlert}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openChatFromAlert();
                        }
                    }}
                    className="fixed right-4 bottom-4 z-50 w-80 cursor-pointer rounded-lg bg-white p-3 shadow-lg hover:bg-gray-50 grid-cols-[1fr]"
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage
                                src={toStorageUrl(alertData.sender_avatar_path)}
                                alt={alertData.sender_name ?? 'User'}
                            />
                            <AvatarFallback className="bg-gray-100 text-sm font-semibold text-gray-600">
                                {(alertData.sender_name ?? 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <AlertTitle className="col-start-auto text-sm font-semibold">
                                {alertData.sender_name ?? 'User'}
                            </AlertTitle>
                            <AlertDescription className="col-start-auto mt-1 truncate text-xs text-gray-600">
                                {alertData.preview ?? 'Open chat'}
                            </AlertDescription>
                        </div>
                    </div>
                </Alert>
            ) : null}
        </AppShell>
    );
}
