import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { getSocketId, leaveChannel, listenPrivate } from '@/lib/echo';
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
    attachments?: MessageAttachment[];
    read_at?: string | null;
    created_at: string | null;
};

type MessageAttachment = {
    id: number;
    path: string;
    original_name: string | null;
    type: string | null;
    size_bytes: number | null;
};

type MessageSentData = {
    id: number;
    chat_id: number;
    body: string;
    sender_id: number;
    sender_name: string | null;
    sender_avatar_path: string | null;
    attachments?: MessageAttachment[];
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

function formatAttachmentSize(sizeBytes: number | null): string {
    if (!sizeBytes || sizeBytes <= 0) {
        return '';
    }

    if (sizeBytes < 1024) {
        return `${sizeBytes} B`;
    }

    if (sizeBytes < 1024 * 1024) {
        return `${Math.round(sizeBytes / 1024)} KB`;
    }

    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageAttachment(attachment: MessageAttachment): boolean {
    if (attachment.type && attachment.type.startsWith('image/')) {
        return true;
    }

    const fileName = (attachment.original_name ?? '').toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'];

    return imageExtensions.some((extension) => fileName.endsWith(extension));
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
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [bodyError, setBodyError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const maxUploadSizeBytes = 10 * 1024 * 1024;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const channelName = useMemo(() => `private-chat.${chat.id}`, [chat.id]);
    const boxRef = useRef<HTMLDivElement | null>(null);

    function getXsrfToken(): string | null {
        const cookieEntries = document.cookie.split(';');

        for (const entry of cookieEntries) {
            const trimmedEntry = entry.trim();

            if (!trimmedEntry.startsWith('XSRF-TOKEN=')) {
                continue;
            }

            return decodeURIComponent(trimmedEntry.slice('XSRF-TOKEN='.length));
        }

        return null;
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();

        const cleanBody = body.trim();

        if (!cleanBody && selectedFiles.length === 0) {
            setBodyError('Write a message or attach at least one file.');
            return;
        }

        const xsrfToken = getXsrfToken();

        if (!xsrfToken) {
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
            attachments: selectedFiles.map((file, index) => ({
                id: -Date.now() - index - 1,
                path: '',
                original_name: file.name,
                type: file.type || null,
                size_bytes: file.size,
            })),
            read_at: null,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const formData = new FormData();

            if (cleanBody) {
                formData.set('body', cleanBody);
            }

            selectedFiles.forEach((file) => {
                formData.append('attachments[]', file);
            });

            const socketId = getSocketId();

            const response = await fetch(myChatMessagesStore.url(chat.id), {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken,
                    ...(socketId ? { 'X-Socket-ID': socketId } : {}),
                },
                body: formData,
                credentials: 'same-origin',
            });

            if (response.status === 419) {
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
                setBodyError('Session expired. Refreshing page...');
                setBody(cleanBody);
                window.location.reload();
                return;
            }

            if (response.status === 422) {
                const payload = (await response.json()) as {
                    errors?: Record<string, string[] | undefined>;
                };
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
                const errors = payload.errors ?? {};
                const firstAttachmentError = Object.entries(errors).find(([key, value]) =>
                    key.startsWith('attachments.') && Array.isArray(value) && value.length > 0,
                )?.[1]?.[0];
                const uploadError = firstAttachmentError ?? errors.attachments?.[0];

                if (uploadError?.toLowerCase().includes('failed to upload')) {
                    setBodyError('Upload failed. Please try a smaller file or retry.');
                    setBody(cleanBody);

                    return;
                }

                setBodyError(
                    errors.body?.[0]
                        ?? uploadError
                        ?? 'Message is invalid.',
                );
                setBody(cleanBody);
                return;
            }

            if (!response.ok) {
                setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
                setBodyError(`Could not send message (HTTP ${response.status}).`);
                setBody(cleanBody);
                return;
            }

            const payload = (await response.json()) as { message?: MessageRow };

            if (payload.message) {
                setMessages((prev) => {
                    const withoutOptimistic = prev.filter((message) => message.id !== optimisticId);

                    if (withoutOptimistic.some((message) => message.id === payload.message!.id)) {
                        return withoutOptimistic;
                    }

                    return [...withoutOptimistic, payload.message!];
                });

                setSelectedFiles([]);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
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

                // If this tab already has an optimistic copy of my own message,
                // replace it instead of appending a duplicate.
                if (eventData.sender_id === me.id) {
                    const optimisticIndex = prev.findIndex(
                        (message) =>
                            message.id < 0 &&
                            message.sender_id === me.id &&
                            message.body === eventData.body,
                    );

                    if (optimisticIndex !== -1) {
                        const next = [...prev];
                        next[optimisticIndex] = eventData;

                        return next;
                    }
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
                <Card>
                    <CardHeader className="space-y-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
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
                                    <CardTitle className="text-xl">
                                        Chat with {chat.other_user?.name ?? 'Unknown User'}
                                    </CardTitle>
                                    {presenceInfo ? (
                                        presenceInfo.is_online ? (
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
                                            <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
                                                <div>{formatOfflineSince(presenceInfo.offline_for_seconds)}</div>
                                                <div>{formatLastSeen(presenceInfo.last_seen_at)}</div>
                                            </div>
                                        )
                                    ) : null}
                                </div>
                            </div>

                            <Button variant="outline" size="sm" asChild>
                                <Link href={myChatsIndex.url()}>
                                    Back
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div
                            ref={boxRef}
                            className="h-100 space-y-3 overflow-y-auto rounded-lg border p-4"
                        >
                            {messages.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No messages yet.</div>
                            ) : (
                                messages.map((message) => {
                                    const isMine = message.sender_id === me.id;

                                    return (
                                        <div
                                            key={message.id}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={
                                                    isMine
                                                        ? 'max-w-[80%] rounded-lg border border-primary/20 bg-primary p-3 text-primary-foreground'
                                                        : 'max-w-[80%] rounded-lg border bg-card p-3'
                                                }
                                            >
                                                <div
                                                    className={
                                                        isMine
                                                            ? 'mb-1 text-xs text-primary-foreground/80'
                                                            : 'mb-1 text-xs text-muted-foreground'
                                                    }
                                                >
                                                    {message.sender_name ?? 'Unknown'}
                                                </div>
                                                <div className="wrap-break-words text-sm whitespace-pre-wrap">
                                                    {message.body !== '' ? message.body : null}
                                                </div>

                                                {message.attachments && message.attachments.length > 0 ? (
                                                    <div className="mt-2 space-y-1">
                                                        {message.attachments.map((attachment) => {
                                                            const sizeLabel = formatAttachmentSize(
                                                                attachment.size_bytes,
                                                            );
                                                            const title = attachment.original_name ?? 'Attachment';

                                                            if (!attachment.path) {
                                                                return (
                                                                    <div
                                                                        key={attachment.id}
                                                                        className="text-xs underline"
                                                                    >
                                                                        {title}
                                                                        {sizeLabel ? ` (${sizeLabel})` : ''}
                                                                    </div>
                                                                );
                                                            }

                                                            if (isImageAttachment(attachment)) {
                                                                return (
                                                                    <a
                                                                        key={attachment.id}
                                                                        href={toStorageUrl(attachment.path)}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="block"
                                                                    >
                                                                        <img
                                                                            src={toStorageUrl(attachment.path)}
                                                                            alt={title}
                                                                            className="max-h-52 w-auto rounded-md border"
                                                                        />
                                                                        <div className="mt-1 text-xs underline">
                                                                            {title}
                                                                            {sizeLabel ? ` (${sizeLabel})` : ''}
                                                                        </div>
                                                                    </a>
                                                                );
                                                            }

                                                            return (
                                                                <a
                                                                    key={attachment.id}
                                                                    href={toStorageUrl(attachment.path)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="block text-xs underline"
                                                                >
                                                                    {title}
                                                                    {sizeLabel ? ` (${sizeLabel})` : ''}
                                                                </a>
                                                            );
                                                        })}
                                                    </div>
                                                ) : null}

                                                {isMine && message.read_at ? (
                                                    <div className="mt-2 text-[11px] text-primary-foreground/80">
                                                        {formatSeenAt(message.read_at)}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Send message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-3">
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={3}
                                placeholder="Type your message..."
                            />
                            <Input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z"
                                onChange={(event) => {
                                    const files = Array.from(event.target.files ?? []);
                                    const tooLargeFiles = files.filter((file) =>
                                        file.size > maxUploadSizeBytes,
                                    );

                                    if (tooLargeFiles.length > 0) {
                                        setBodyError(
                                            'Some files are larger than 10MB. Please choose smaller files.',
                                        );
                                        setSelectedFiles([]);
                                        event.currentTarget.value = '';

                                        return;
                                    }

                                    setBodyError(null);
                                    setSelectedFiles(files);
                                }}
                            />
                            {selectedFiles.length > 0 ? (
                                <div className="text-xs text-muted-foreground">
                                    {selectedFiles.map((file) => file.name).join(', ')}
                                </div>
                            ) : null}
                            {bodyError ? (
                                <Alert variant="destructive">
                                    <AlertDescription>{bodyError}</AlertDescription>
                                </Alert>
                            ) : null}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={sending}>
                                    {sending ? 'Sending...' : 'Send'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

