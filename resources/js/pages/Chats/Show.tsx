import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { leaveChannel, listenPrivate } from '@/lib/echo';
import { index as myChatsIndex } from '@/routes/my/chats';
import { store as myChatMessagesStore } from '@/routes/my/chats/messages';
import { show as presenceShow } from '@/routes/presence';
import { SharedData } from '@/types';

type ChatData = {
    id: number;
    type: string;
    other_user: {
        id: number;
        name: string;
        avatar_path: string | null;
    } | null;
};

type MessageRow = {
    id: number;
    chat_id: number;
    body: string;
    sender_id: number;
    sender_name: string | null;
    sender_avatar_path: string | null;
    read_at?: string | null;
    created_at: string | null;
};

type MessageSentData = {
    id: number;
    chat_id: number;
    body: string;
    sender_id: number;
    sender_name: string | null;
    sender_avatar_path: string | null;
    read_at?: string | null;
    created_at: string | null;
};

type MessageSeenData = {
    message_ids: number[];
    seen_at: string;
};

type PresenceInfo = {
    user_id: number;
    is_online: boolean;
    last_seen_at: string | null;
    offline_for_seconds: number | null;
};

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

function formatLastSeen(isoDate: string | null): string {
    if (!isoDate) {
        return 'Last seen unknown';
    }

    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return 'Last seen unknown';
    }

    return `Last seen ${date.toLocaleString()}`;
}

function formatSeenAt(isoDate: string | null | undefined): string {
    if (!isoDate) {
        return 'Seen';
    }

    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return 'Seen';
    }

    return `Seen at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ChatsShow() {
    const { props } = usePage<{ chat: ChatData; messages: MessageRow[] } & SharedData>();
    const chat = props.chat;
    const me = props.auth.user;
    const otherUserId = chat.other_user?.id ?? null;

    // Local state so we can append realtime messages.
    const [messages, setMessages] = useState<MessageRow[]>(props.messages ?? []);
    const [presenceInfo, setPresenceInfo] = useState<PresenceInfo | null>(null);
    const [body, setBody] = useState('');
    const [bodyError, setBodyError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const channelName = useMemo(() => `private-chat.${chat.id}`, [chat.id]);
    const boxRef = useRef<HTMLDivElement | null>(null);

    function getCsrfToken(): string | null {
        const metaToken = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (metaToken) {
            return metaToken;
        }

        const cookieMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

        if (!cookieMatch) {
            return null;
        }

        return decodeURIComponent(cookieMatch[1]);
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();

        const cleanBody = body.trim();

        if (!cleanBody) {
            setBodyError('Message is required.');
            return;
        }

        const csrfToken = getCsrfToken();

        if (!csrfToken) {
            setBodyError('Security token is missing. Please refresh the page.');
            return;
        }

        setBodyError(null);
        setSending(true);
        setBody('');

        // Optimistic message so sender sees it instantly.
        const optimisticId = -Date.now();
        const optimisticMessage: MessageRow = {
            id: optimisticId,
            chat_id: chat.id,
            body: cleanBody,
            sender_id: me.id,
            sender_name: me.name,
            sender_avatar_path: me.avatar_path ?? null,
            read_at: null,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const form = new URLSearchParams();
            form.set('_token', csrfToken);
            form.set('body', cleanBody);

            const response = await fetch(myChatMessagesStore.url(chat.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: form,
                credentials: 'same-origin',
            });

            if (response.status === 422) {
                const payload = (await response.json()) as { errors?: { body?: string[] } };
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
                setBodyError(payload.errors?.body?.[0] ?? 'Message is invalid.');
                setBody(cleanBody);
                return;
            }

            if (!response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
                setBodyError('Could not send message. Please try again.');
                setBody(cleanBody);
                return;
            }

            const payload = (await response.json()) as { message?: MessageRow };

            if (payload.message) {
                setMessages((prev) => {
                    return prev.map((m) =>
                        m.id === optimisticId
                            ? payload.message!
                            : m,
                    );
                });
            }
        } catch {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
            setBodyError('Network error. Please try again.');
            setBody(cleanBody);
        } finally {
            setSending(false);
        }
    }

    // Listen to realtime events for this chat.
    useEffect(() => {
        listenPrivate(channelName, '.MessageSent', (data) => {
            const eventData = data as MessageSentData;

            // Guard: only accept events for current chat.
            if (eventData.chat_id !== chat.id) {
                return;
            }

            // Avoid duplicate append (if same message already exists).
            setMessages((prev) => {
                if (prev.some((m) => m.id === eventData.id)) {
                    return prev;
                }

                return [...prev, eventData];
            });

            // If a new message comes from the other user while this chat is open,
            // hit current URL once so backend marks it as seen and broadcasts MessageSeen.
            if (eventData.sender_id !== me.id) {
                void fetch(window.location.href, {
                    headers: {
                        Accept: 'text/html',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });
            }
        });

        listenPrivate(channelName, '.MessageSeen', (data) => {
            const eventData = data as MessageSeenData;

            // Update read_at for all messages marked as seen.
            setMessages((prev) =>
                prev.map((message) =>
                    eventData.message_ids.includes(message.id)
                        ? { ...message, read_at: eventData.seen_at }
                        : message,
                ),
            );
        });

        // Cleanup when leaving this page.
        return () => {
            leaveChannel(channelName);
        };
    }, [channelName, chat.id, me.id]);

    // Poll the other user's presence every 30 seconds.
    useEffect(() => {
        if (!otherUserId) {
            return;
        }

        const loadPresence = async () => {
            try {
                const response = await fetch(presenceShow.url(otherUserId), {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as PresenceInfo;
                setPresenceInfo(data);
            } catch {
                // Ignore transient network issues.
            }
        };

        void loadPresence();

        const intervalId = window.setInterval(() => {
            void loadPresence();
        }, 30_000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [otherUserId]);

    // Always scroll to bottom when messages change.
    useEffect(() => {
        if (boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <AppLayout>
            <Head title={`Chat #${chat.id}`} />

            <div className="max-w-3xl space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold">
                            Chat with {chat.other_user?.name ?? 'Unknown User'}
                        </h1>

                        {presenceInfo ? (
                            presenceInfo.is_online ? (
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                                    <span>Online</span>
                                </div>
                            ) : (
                                <div className="space-y-0.5 text-sm text-gray-500">
                                    <div>{formatOfflineSince(presenceInfo.offline_for_seconds)}</div>
                                    <div>{formatLastSeen(presenceInfo.last_seen_at)}</div>
                                </div>
                            )
                        ) : null}
                    </div>

                    <Link href={myChatsIndex.url()} className="text-sm underline">
                        Back
                    </Link>
                </div>

                <div ref={boxRef} className="h-[400px] space-y-2 overflow-y-auto rounded-md border p-4">
                    {messages.length === 0 ? (
                        <div className="text-sm text-gray-600">No messages yet.</div>
                    ) : (
                        messages.map((message) => {
                            const isMine = message.sender_id === me.id;

                            return (
                                <div key={message.id} className="rounded border p-2">
                                    <div className="text-xs text-gray-500">
                                        {message.sender_name ?? 'Unknown'}
                                    </div>
                                    <div>{message.body}</div>

                                    {isMine && message.read_at ? (
                                        <div className="mt-1 text-xs text-green-600">
                                            {formatSeenAt(message.read_at)}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })
                    )}
                </div>

                <form onSubmit={submit} className="space-y-2">
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full rounded-md border p-2"
                        rows={3}
                        placeholder="Type your message..."
                    />
                    {bodyError ? (
                        <div className="text-sm text-red-600">{bodyError}</div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={sending}
                        className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                    >
                        {sending ? 'Sending...' : 'Send'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
