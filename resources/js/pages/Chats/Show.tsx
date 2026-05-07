import { Head, usePage } from '@inertiajs/react';
import {
    ChangeEvent,
    FormEvent,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { getSocketId, leaveChannel, listenPrivate } from '@/lib/echo';
import { dashboard } from '@/routes';
import { index as myChatsIndex } from '@/routes/my/chats';
import { store as myChatMessagesStore } from '@/routes/my/chats/messages';
import { show as presenceShow } from '@/routes/presence';
import { SharedData } from '@/types';

import { Check, MoreHorizontal, Pencil, Send, Trash2, X } from 'lucide-react';

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

function formatSeenAt(isoDate: string | null | undefined): string {
    if (!isoDate) {
        return 'Seen';
    }

    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return 'Seen';
    }

    return `Seen at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
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

    const imageExtensions = [
        '.png',
        '.jpg',
        '.jpeg',
        '.gif',
        '.webp',
        '.bmp',
        '.svg',
    ];

    return imageExtensions.some((extension) => fileName.endsWith(extension));
}

export default function ChatsShow() {
    const { props } = usePage<
        { chat: ChatData; messages: MessageRow[] } & SharedData
    >();

    const chat = props.chat;
    const me = props.auth.user;

    const otherUserId = chat.other_user?.id ?? null;

    const [messages, setMessages] = useState<MessageRow[]>(
        props.messages ?? [],
    );

    const [presenceInfo, setPresenceInfo] = useState<PresenceInfo | null>(null);

    const [body, setBody] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [bodyError, setBodyError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    const [editingMessageId, setEditingMessageId] = useState<number | null>(
        null,
    );

    const [editingBody, setEditingBody] = useState('');

    const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

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

    async function updateMessage(messageId: number) {
        const cleanBody = editingBody.trim();

        if (!cleanBody) {
            return;
        }

        try {
            const xsrfToken = getXsrfToken();

            const response = await fetch(`/my/chats/messages/${messageId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ?? '',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    body: cleanBody,
                }),
            });

            if (!response.ok) {
                return;
            }

            setMessages((prev) =>
                prev.map((message) =>
                    message.id === messageId
                        ? {
                              ...message,
                              body: cleanBody,
                          }
                        : message,
                ),
            );

            setEditingMessageId(null);
            setEditingBody('');
        } catch {
            //
        }
    }

    function deleteForMe(messageId: number) {
        setMessages((prev) =>
            prev.filter((message) => message.id !== messageId),
        );
    }

    async function deleteForEveryone(messageId: number) {
        try {
            const xsrfToken = getXsrfToken();

            const response = await fetch(`/my/chats/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': xsrfToken ?? '',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                return;
            }

            setMessages((prev) =>
                prev.filter((message) => message.id !== messageId),
            );
        } catch {
            //
        }
    }

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        const tooLargeFiles = files.filter(
            (file) => file.size > maxUploadSizeBytes,
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
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

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
                setMessages((prev) =>
                    prev.filter((message) => message.id !== optimisticId),
                );
                setBodyError('Session expired. Refreshing page...');
                setBody(cleanBody);
                window.location.reload();

                return;
            }

            if (response.status === 422) {
                const payload = (await response.json()) as {
                    errors?: Record<string, string[] | undefined>;
                };
                const errors = payload.errors ?? {};
                const firstAttachmentError = Object.entries(errors).find(
                    ([key, value]) =>
                        key.startsWith('attachments.') &&
                        Array.isArray(value) &&
                        value.length > 0,
                )?.[1]?.[0];
                const uploadError =
                    firstAttachmentError ?? errors.attachments?.[0];

                setMessages((prev) =>
                    prev.filter((message) => message.id !== optimisticId),
                );

                if (uploadError?.toLowerCase().includes('failed to upload')) {
                    setBodyError(
                        'Upload failed. Please try a smaller file or retry.',
                    );
                    setBody(cleanBody);

                    return;
                }

                setBodyError(
                    errors.body?.[0] ?? uploadError ?? 'Message is invalid.',
                );
                setBody(cleanBody);

                return;
            }

            if (!response.ok) {
                setMessages((prev) =>
                    prev.filter((message) => message.id !== optimisticId),
                );
                setBodyError(
                    `Could not send message (HTTP ${response.status}).`,
                );
                setBody(cleanBody);

                return;
            }

            const payload = (await response.json()) as { message?: MessageRow };

            if (payload.message) {
                setMessages((prev) => {
                    const withoutOptimistic = prev.filter(
                        (message) => message.id !== optimisticId,
                    );

                    if (
                        withoutOptimistic.some(
                            (message) => message.id === payload.message!.id,
                        )
                    ) {
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
            setMessages((prev) =>
                prev.filter((message) => message.id !== optimisticId),
            );
            setBodyError('Network error. Please try again.');
            setBody(cleanBody);
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        listenPrivate(channelName, '.MessageSent', (data) => {
            const eventData = data as MessageSentData;

            if (eventData.chat_id !== chat.id) {
                return;
            }

            setMessages((prev) => {
                if (prev.some((message) => message.id === eventData.id)) {
                    return prev;
                }

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

            setMessages((prev) =>
                prev.map((message) =>
                    eventData.message_ids.includes(message.id)
                        ? { ...message, read_at: eventData.seen_at }
                        : message,
                ),
            );
        });

        return () => {
            leaveChannel(channelName);
        };
    }, [channelName, chat.id, me.id]);

    useEffect(() => {
        if (!otherUserId) {
            return;
        }

        let isActive = true;

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

                if (isActive) {
                    setPresenceInfo(data);
                }
            } catch {
                //
            }
        };

        void loadPresence();

        const intervalId = window.setInterval(() => {
            void loadPresence();
        }, 30_000);

        return () => {
            isActive = false;
            window.clearInterval(intervalId);
        };
    }, [otherUserId]);

    useEffect(() => {
        if (boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: dashboard().url },
                { title: 'My Chats', href: myChatsIndex.url() },
                {
                    title: chat.other_user?.name ?? `Chat #${chat.id}`,
                    href: '#',
                },
            ]}
        >
            <Head title={`Chat #${chat.id}`} />

            <div className="flex h-[calc(100vh-70px)] flex-col bg-background">
                <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
                    <div className="flex items-center justify-between px-4 py-3 md:px-6">
                        <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-11 w-11 border">
                                <AvatarImage
                                    src={toStorageUrl(
                                        chat.other_user?.avatar_path ?? null,
                                    )}
                                />
                                <AvatarFallback>
                                    {getInitial(chat.other_user?.name)}
                                </AvatarFallback>
                            </Avatar>

                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold md:text-base">
                                    {chat.other_user?.name}
                                </div>

                                {presenceInfo?.is_online ? (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />
                                        Online
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">
                                        {formatOfflineSince(
                                            presenceInfo?.offline_for_seconds ??
                                                null,
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    ref={boxRef}
                    className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-6"
                >
                    {messages.map((message) => {
                        const isMine = message.sender_id === me.id;

                        return (
                            <div
                                key={message.id}
                                className={`flex items-end gap-2 ${
                                    isMine ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {!isMine && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={toStorageUrl(
                                                message.sender_avatar_path ??
                                                    null,
                                            )}
                                        />
                                        <AvatarFallback>
                                            {getInitial(message.sender_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div className="max-w-[85%] md:max-w-[70%]">
                                    <div className="relative">
                                        {isMine && (
                                            <div className="absolute -top-1 right-0 z-30">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMenuOpenId(
                                                            menuOpenId ===
                                                                message.id
                                                                ? null
                                                                : message.id,
                                                        )
                                                    }
                                                    className="rounded-full p-1 opacity-70 transition hover:bg-black/10 hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>

                                                {menuOpenId === message.id && (
                                                    <div className="absolute right-0 mt-2 w-52 rounded-2xl border bg-background p-1 shadow-2xl">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingMessageId(
                                                                    message.id,
                                                                );

                                                                setEditingBody(
                                                                    message.body,
                                                                );

                                                                setMenuOpenId(
                                                                    null,
                                                                );
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                deleteForMe(
                                                                    message.id,
                                                                );

                                                                setMenuOpenId(
                                                                    null,
                                                                );
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete for me
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                deleteForEveryone(
                                                                    message.id,
                                                                );

                                                                setMenuOpenId(
                                                                    null,
                                                                );
                                                            }}
                                                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-muted"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            Delete for everyone
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div
                                            className={`rounded-3xl px-4 py-2 shadow-sm ${
                                                isMine
                                                    ? 'rounded-br-md bg-primary text-primary-foreground'
                                                    : 'rounded-bl-md border bg-muted'
                                            }`}
                                        >
                                            {editingMessageId === message.id ? (
                                                <div className="space-y-2">
                                                    <Textarea
                                                        value={editingBody}
                                                        onChange={(e) =>
                                                            setEditingBody(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />

                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setEditingMessageId(
                                                                    null,
                                                                );

                                                                setEditingBody(
                                                                    '',
                                                                );
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            type="button"
                                                            onClick={() =>
                                                                updateMessage(
                                                                    message.id,
                                                                )
                                                            }
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm break-words whitespace-pre-wrap">
                                                    {message.body}
                                                </div>
                                            )}

                                            {message.attachments &&
                                            message.attachments.length > 0 ? (
                                                <div className="mt-2 space-y-1">
                                                    {message.attachments.map(
                                                        (attachment) => {
                                                            const sizeLabel =
                                                                formatAttachmentSize(
                                                                    attachment.size_bytes,
                                                                );
                                                            const title =
                                                                attachment.original_name ??
                                                                'Attachment';

                                                            if (
                                                                !attachment.path
                                                            ) {
                                                                return (
                                                                    <div
                                                                        key={
                                                                            attachment.id
                                                                        }
                                                                        className="text-xs underline"
                                                                    >
                                                                        {title}
                                                                        {sizeLabel
                                                                            ? ` (${sizeLabel})`
                                                                            : ''}
                                                                    </div>
                                                                );
                                                            }

                                                            if (
                                                                isImageAttachment(
                                                                    attachment,
                                                                )
                                                            ) {
                                                                return (
                                                                    <a
                                                                        key={
                                                                            attachment.id
                                                                        }
                                                                        href={toStorageUrl(
                                                                            attachment.path,
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="block"
                                                                    >
                                                                        <img
                                                                            src={toStorageUrl(
                                                                                attachment.path,
                                                                            )}
                                                                            alt={
                                                                                title
                                                                            }
                                                                            className="max-h-52 w-auto rounded-md border"
                                                                        />
                                                                        <div className="mt-1 text-xs underline">
                                                                            {
                                                                                title
                                                                            }
                                                                            {sizeLabel
                                                                                ? ` (${sizeLabel})`
                                                                                : ''}
                                                                        </div>
                                                                    </a>
                                                                );
                                                            }

                                                            return (
                                                                <a
                                                                    key={
                                                                        attachment.id
                                                                    }
                                                                    href={toStorageUrl(
                                                                        attachment.path,
                                                                    )}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="block text-xs underline"
                                                                >
                                                                    {title}
                                                                    {sizeLabel
                                                                        ? ` (${sizeLabel})`
                                                                        : ''}
                                                                </a>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div
                                        className={`mt-1 px-2 text-[11px] text-muted-foreground ${
                                            isMine ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        {message.created_at
                                            ? new Date(
                                                  message.created_at,
                                              ).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : ''}

                                        {isMine && message.read_at
                                            ? ` - ${formatSeenAt(
                                                  message.read_at,
                                              )}`
                                            : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t bg-background p-3 md:p-4">
                    <form
                        onSubmit={submit}
                        className="mx-auto flex max-w-5xl flex-col gap-3"
                    >
                        {selectedFiles.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {selectedFiles.map((file) => (
                                    <Badge
                                        key={file.name}
                                        variant="secondary"
                                        className="rounded-full px-3 py-1"
                                    >
                                        {file.name}
                                    </Badge>
                                ))}
                            </div>
                        ) : null}

                        {bodyError ? (
                            <Alert variant="destructive">
                                <AlertDescription>{bodyError}</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="flex items-end gap-2">
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={1}
                                placeholder="Type a message..."
                                className="max-h-40 min-h-[48px] flex-1 resize-none rounded-3xl border border-gray-200 bg-primary-foreground/30 px-4 py-3"
                            />

                            <Input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z"
                                onChange={handleFileChange}
                                className="max-w-[140px] rounded-full border border-gray-200 bg-primary-foreground/30 px-4"
                            />

                            <Button
                                type="submit"
                                disabled={sending}
                                className="rounded-full p-3"
                            >
                                <Send className="h-7 w-7" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
