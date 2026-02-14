import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { leaveChannel, listenPrivate } from '@/lib/echo';
import { show as myChatsShow } from '@/routes/my/chats';
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

export default function ChatsIndex() {
    const { props } = usePage<{ chats: ChatRow[] } & SharedData>();
    const userId = props.auth.user.id;

    const initialChats: ChatListRow[] = (props.chats ?? []).map((chat) => ({
        ...chat,
        last_message_id: chat.last_message_id ?? undefined,
        unread_count: chat.unread_count ?? 0,
    }));

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
        if (unreadCount > 9) return '+9 new messages';
        return `${unreadCount} new messages`;
    }

    function formatOfflineSince(seconds: number | null): string {
        if (seconds === null) return 'Offline';
        if (seconds < 60) return `Offline since ${seconds}s`;
        if (seconds < 3600) return `Offline since ${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `Offline since ${Math.floor(seconds / 3600)}h`;
        return `Offline since ${Math.floor(seconds / 86400)}d`;
    }

    // Realtime chat updates
    useEffect(() => {
        listenPrivate(channelName, '.ChatUpdated', (data) => {
            const eventData = data as ChatUpdatedData;

            setChats((prev) => {
                const found = prev.find((chat) => chat.id === eventData.chat_id);
                if (!found) return prev;
                if (found.last_message_id === eventData.message_id) return prev;

                const isIncoming = eventData.sender_id !== userId;

                const updated: ChatListRow = {
                    ...found,
                    last_message_preview: eventData.last_message_preview,
                    last_message_at: eventData.last_message_at,
                    last_message_id: eventData.message_id,
                    unread_count: isIncoming ? found.unread_count + 1 : 0,
                };

                return [updated, ...prev.filter((c) => c.id !== eventData.chat_id)];
            });
        });

        return () => leaveChannel(channelName);
    }, [channelName, userId]);

    // Presence polling
    useEffect(() => {
        if (otherUserIds.length === 0) return;

        let active = true;

        const loadPresence = async () => {
            const results = await Promise.all(
                otherUserIds.map(async (id) => {
                    try {
                        const res = await fetch(presenceShow.url(id), {
                            headers: {
                                Accept: 'application/json',
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                        });
                        if (!res.ok) return null;
                        return [id, (await res.json()) as PresenceInfo] as const;
                    } catch {
                        return null;
                    }
                }),
            );

            if (!active) return;

            setPresenceByUserId((prev) => {
                const next = { ...prev };
                results.forEach((r) => {
                    if (r) next[r[0]] = r[1];
                });
                return next;
            });
        };

        void loadPresence();
        const interval = window.setInterval(loadPresence, 30_000);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [otherUserIds]);

    return (
        <AppLayout>
            <Head title="My Chats" />

            <div className="space-y-4 p-6">
                <h1 className="text-xl font-semibold">Chats</h1>

                {chats.length === 0 ? (
                    <div className="mt-20 rounded-md border p-4 text-sm text-gray-600">
                        No chats yet.
                    </div>
                ) : (
                    <div className="mt-20 space-y-3">
                        {chats.map((chat) => {
                            const presence = chat.other_user
                                ? presenceByUserId[chat.other_user.id]
                                : null;

                            return (
                                <Link
                                    key={chat.id}
                                    href={myChatsShow.url(chat.id)}
                                    onClick={() =>
                                        setChats((prev) =>
                                            prev.map((row) =>
                                                row.id === chat.id
                                                    ? { ...row, unread_count: 0 }
                                                    : row,
                                            ),
                                        )
                                    }
                                    className="block p-4 hover:bg-primary-foreground/20 rounded-3xl hover:shadow-md transition duration-700"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Avatar */}
                                        {chat.other_user?.avatar_path ? (
                                            <img
                                                src={chat.other_user.avatar_path}
                                                alt={chat.other_user.name}
                                                className="h-14 w-14 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center text-muted font-semibold">
                                                {chat.other_user?.name?.charAt(0) ?? '?'}
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
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
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                                                        <span className="h-2 w-2 rounded-full bg-primary" />
                                                        Online
                                                    </div>
                                                ) : (
                                                    <div className="mt-1 text-xs text-muted-foreground">
                                                        {formatOfflineSince(
                                                            presence.offline_for_seconds,
                                                        )}
                                                    </div>
                                                )
                                            ) : null}

                                            {chat.unread_count > 1 ? (
                                                <div className="mt-1 text-sm font-semibold text-muted">
                                                    {formatUnreadCount(chat.unread_count)}
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        chat.unread_count === 1
                                                            ? 'text-sm font-semibold'
                                                            : 'text-sm text-gray-600'
                                                    }
                                                >
                                                    {chat.last_message_preview ??
                                                        'No messages yet.'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Time */}
                                        <div className="text-xs text-gray-500 whitespace-nowrap">
                                            {chat.last_message_at ?? '-'}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
