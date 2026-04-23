import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { leaveChannel, listenPrivate } from '@/lib/echo';
import { dashboard } from '@/routes';
import { index as myChatsIndex, show as myChatsShow } from '@/routes/my/chats';
import { show as presenceShow } from '@/routes/presence';
import { SharedData } from '@/types';

type ChatRow = {
    id: number;
    type: string;
    last_message_at: string | null;
    last_message_id?: number | null;
    last_message_preview: string | null;
    unread_count: number;
    other_user: {
        id: number;
        name: string;
        avatar_path: string | null;
    } | null;
};

type ChatListRow = ChatRow & {
    last_message_id?: number;
};

type ChatUpdatedData = {
    chat_id: number;
    last_message_preview: string;
    last_message_at: string | null;
    sender_id: number;
    message_id: number;
};

type PresenceInfo = {
    user_id: number;
    is_online: boolean;
    last_seen_at: string | null;
    offline_for_seconds: number | null;
};

function toStorageUrl(path: string | null): string {
    if (!path) {
        return '';
    }

    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    if (path.startsWith('storage/')) {
        return `/${path}`;
    }

    return `/storage/${path}`;
}

function getInitial(name: string | null | undefined): string {
    return (name ?? 'U').charAt(0).toUpperCase();
}

export default function ChatsIndex() {
    const { props } = usePage<{ chats: ChatRow[] } & SharedData>();
    const initialChats: ChatListRow[] = (props.chats ?? []).map((chat) => ({
        ...chat,
        last_message_id: chat.last_message_id ?? undefined,
        unread_count: chat.unread_count ?? 0,
    }));
    const userId = props.auth.user.id;

    // Local state so we can update list from realtime event.
    const [chats, setChats] = useState<ChatListRow[]>(initialChats);
    const [presenceByUserId, setPresenceByUserId] = useState<Record<number, PresenceInfo>>({});

    const channelName = useMemo(() => `private-user.${userId}`, [userId]);
    const otherUserIds = useMemo(() => {
        return Array.from(
            new Set(
                chats
                    .map((chat) => chat.other_user?.id)
                    .filter((id): id is number => Boolean(id)),
            ),
        );
    }, [chats]);

    function formatUnreadCount(unreadCount: number): string {
        if (unreadCount > 9) {
            return '+9 new messages';
        }

        return `${unreadCount} new messages`;
    }

    function formatOfflineSince(seconds: number | null): string {
        if (seconds === null) {
            return 'Offline';
        }

        if (seconds < 60) {
            return `Offline since ${seconds}s`;
        }

        if (seconds < 3600) {
            return `Offline since ${Math.floor(seconds / 60)}m`;
        }

        if (seconds < 86400) {
            return `Offline since ${Math.floor(seconds / 3600)}h`;
        }

        return `Offline since ${Math.floor(seconds / 86400)}d`;
    }

    // Listen to chat-list updates.
    useEffect(() => {
        listenPrivate(channelName, '.ChatUpdated', (data) => {
            const eventData = data as ChatUpdatedData;

            setChats((prev) => {
                const found = prev.find((chat) => chat.id === eventData.chat_id);

                // If chat row not found, keep list as-is.
                if (!found) {
                    return prev;
                }

                // If same message event arrives again, skip duplicate UI updates.
                if (found.last_message_id === eventData.message_id) {
                    return prev;
                }

                // Count unread only for incoming messages.
                const isIncomingMessage = eventData.sender_id !== userId;

                const updated: ChatListRow = {
                    ...found,
                    last_message_preview: eventData.last_message_preview,
                    last_message_at: eventData.last_message_at,
                    last_message_id: eventData.message_id,
                    unread_count: isIncomingMessage ? found.unread_count + 1 : 0,
                };

                // Remove old row, then put updated row at top.
                const rest = prev.filter((chat) => chat.id !== eventData.chat_id);

                return [updated, ...rest];
            });
        });

        // Cleanup when leaving this page.
        return () => {
            leaveChannel(channelName);
        };
    }, [channelName, userId]);

    // Poll presence for all users visible in chat list.
    useEffect(() => {
        if (otherUserIds.length === 0) {
            return;
        }

        let isActive = true;

        const loadPresence = async () => {
            const results = await Promise.all(
                otherUserIds.map(async (otherUserId) => {
                    try {
                        const response = await fetch(presenceShow.url(otherUserId), {
                            headers: {
                                Accept: 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        });

                        if (!response.ok) {
                            return null;
                        }

                        const data = (await response.json()) as PresenceInfo;

                        return [otherUserId, data] as const;
                    } catch {
                        return null;
                    }
                }),
            );

            if (!isActive) {
                return;
            }

            setPresenceByUserId((previous) => {
                const next = { ...previous };

                results.forEach((result) => {
                    if (!result) {
                        return;
                    }

                    const [otherUserId, data] = result;
                    next[otherUserId] = data;
                });

                return next;
            });
        };

        void loadPresence();

        const intervalId = window.setInterval(() => {
            void loadPresence();
        }, 30_000);

        return () => {
            isActive = false;
            window.clearInterval(intervalId);
        };
    }, [otherUserIds]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard().url },
                { title: 'My Chats', href: myChatsIndex().url },
            ]}
        >
            <Head title="My Chats" />

            <div className="space-y-4 p-6">
                <h1 className="text-xl font-semibold">My Chats</h1>

                {chats.length === 0 ? (
                    <Card>
                        <CardContent className="p-4 text-sm text-muted-foreground">
                            No chats yet.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {chats.map((chat) => {
                            const presence = chat.other_user
                                ? presenceByUserId[chat.other_user.id]
                                : null;

                            return (
                            <Link
                                key={chat.id}
                                href={myChatsShow.url(chat.id)}
                                onClick={() => {
                                    // Clear unread counter when user opens that chat.
                                    setChats((prev) =>
                                        prev.map((row) =>
                                            row.id === chat.id ? { ...row, unread_count: 0 } : row,
                                        ),
                                    );
                                }}
                                className="block"
                            >
                                <Card className="gap-0 py-0 transition-colors hover:bg-accent/30 rounded-4xl border border-gray-200 bg-primary-foreground/30">
                                    <CardContent className="flex items-center justify-between gap-3 p-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarImage
                                                    src={toStorageUrl(chat.other_user?.avatar_path ?? null)}
                                                    alt={chat.other_user?.name ?? 'Unknown User'}
                                                />
                                                <AvatarFallback>
                                                    {getInitial(chat.other_user?.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div
                                                    className={
                                                        chat.unread_count > 0
                                                            ? 'font-semibold'
                                                            : 'font-medium'
                                                    }
                                                >
                                                    {chat.other_user?.name ?? 'Unknown User'}
                                                </div>

                                                {presence ? (
                                                    presence.is_online ? (
                                                        <div className="mt-1">
                                                            <Badge
                                                                variant="secondary"
                                                                className="gap-1 text-green-700"
                                                            >
                                                                <span className="h-2 w-2 rounded-full bg-green-500" />
                                                                <span>Online</span>
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-1 text-xs text-muted-foreground">
                                                            {formatOfflineSince(presence.offline_for_seconds)}
                                                        </div>
                                                    )
                                                ) : null}

                                                {chat.unread_count > 1 ? (
                                                    <div className="mt-1">
                                                        <Badge className="font-semibold">
                                                            {formatUnreadCount(chat.unread_count)}
                                                        </Badge>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={
                                                            chat.unread_count === 1
                                                                ? 'mt-1 truncate text-sm font-semibold'
                                                                : 'mt-1 truncate text-sm text-muted-foreground'
                                                        }
                                                    >
                                                        {chat.last_message_preview ?? 'No messages yet.'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-xs text-muted-foreground">
                                            {chat.last_message_at ?? '-'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
