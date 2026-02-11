import { echo } from '@laravel/echo-react';

// Minimal channel type we need from Echo.
type EchoPrivateChannel = {
    listen: (eventName: string, callback: (data: unknown) => void) => void;
    stopListening: (eventName: string) => void;
};

type EchoClient = {
    private: (channelName: string) => EchoPrivateChannel;
    leave: (channelName: string) => void;
    socketId?: () => string | undefined;
};

function getEcho(): EchoClient | null {
    if (typeof window === 'undefined') {
        return null;
    }

    try {
        return echo() as unknown as EchoClient;
    } catch {
        return null;
    }
}

// Start listening to an event on a private channel.
export function listenPrivate(
    channelName: string,
    eventName: string,
    callback: (data: unknown) => void,
): void {
    const echoClient = getEcho();

    if (!echoClient) {
        return;
    }

    echoClient.private(channelName).listen(eventName, callback);
}

// Stop listening to one event on a private channel.
export function stopListeningPrivate(
    channelName: string,
    eventName: string,
): void {
    const echoClient = getEcho();

    if (!echoClient) {
        return;
    }

    echoClient.private(channelName).stopListening(eventName);
}

// Leave the channel completely.
export function leaveChannel(channelName: string): void {
    const echoClient = getEcho();

    if (!echoClient) {
        return;
    }

    echoClient.leave(channelName);
}

// Current websocket socket id used by Laravel broadcast()->toOthers().
export function getSocketId(): string | null {
    const echoClient = getEcho();

    if (!echoClient || !echoClient.socketId) {
        return null;
    }

    return echoClient.socketId() ?? null;
}
