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
    last_message_preview: string | null;
    other_user: {
        id: number;
        name: string;
        avatar_path: string | null;
    } | null;
};

type ChatListRow = ChatRow & {
    unread_count: number;
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
    const initialChats: ChatListRow[] = (props.chats ?? []).map((chat) => ({
        ...chat,
        unread_count: 0,
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
        <AppLayout>
            <Head title="My Chats" />

            <div className="space-y-4 p-6">
                <h1 className="text-xl font-semibold">My Chats</h1>

                {chats.length === 0 ? (
                    <div className="rounded-md border p-4 text-sm text-gray-600">
                        No chats yet.
                    </div>
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
                                className="block rounded-md border p-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className={chat.unread_count > 0 ? 'font-semibold' : 'font-medium'}>
                                            {chat.other_user?.name ?? 'Unknown User'}
                                        </div>
                                        {presence ? (
                                            presence.is_online ? (
                                                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span>Online</span>
                                                </div>
                                            ) : (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    {formatOfflineSince(presence.offline_for_seconds)}
                                                </div>
                                            )
                                        ) : null}
                                        {chat.unread_count > 1 ? (
                                            <div className="mt-1 text-sm font-semibold text-blue-600">
                                                {formatUnreadCount(chat.unread_count)}
                                            </div>
                                        ) : (
                                            <div
                                                className={
                                                    chat.unread_count === 1
                                                        ? 'text-sm font-semibold text-gray-900'
                                                        : 'text-sm text-gray-600'
                                                }
                                            >
                                                {chat.last_message_preview ?? 'No messages yet.'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-500">
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
