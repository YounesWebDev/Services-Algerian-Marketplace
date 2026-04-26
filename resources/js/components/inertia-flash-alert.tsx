import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2Icon, OctagonAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type FlashMessage =
    | string
    | {
          title?: string | null;
          reason?: string | null;
          description?: string | null;
          message?: string | null;
      };

type InertiaFlashAlertProps = {
    message?: FlashMessage | null;
    title: string;
    variant?: 'success' | 'error';
    duration?: number;
};

export default function InertiaFlashAlert({
    message,
    title,
    variant = 'success',
    duration = 7000,
}: InertiaFlashAlertProps) {
    const [showAlert, setShowAlert] = useState(false);
    const [animate, setAnimate] = useState(false);
    const hideTimer = useRef<number | null>(null);
    const removeTimer = useRef<number | null>(null);

    const content = useMemo(() => {
        if (!message) {
            return null;
        }

        if (typeof message === 'string') {
            const trimmedMessage = message.trim();

            if (!trimmedMessage) {
                return null;
            }

            return {
                title,
                description: trimmedMessage,
            };
        }

        const nextTitle = message.title?.trim() || title;
        const nextDescription =
            message.reason?.trim() ||
            message.description?.trim() ||
            message.message?.trim() ||
            '';

        if (!nextDescription) {
            return null;
        }

        return {
            title: nextTitle,
            description: nextDescription,
        };
    }, [message, title]);

    useEffect(() => {
        return () => {
            if (hideTimer.current !== null) {
                window.clearTimeout(hideTimer.current);
            }

            if (removeTimer.current !== null) {
                window.clearTimeout(removeTimer.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!content || typeof window === 'undefined') {
            setAnimate(false);
            setShowAlert(false);
            return;
        }

        if (hideTimer.current !== null) {
            window.clearTimeout(hideTimer.current);
        }

        if (removeTimer.current !== null) {
            window.clearTimeout(removeTimer.current);
        }

        setShowAlert(true);
        setAnimate(false);

        window.setTimeout(() => setAnimate(true), 10);

        hideTimer.current = window.setTimeout(() => {
            setAnimate(false);
            removeTimer.current = window.setTimeout(
                () => setShowAlert(false),
                300,
            );
        }, duration);
    }, [content, duration]);

    if (!showAlert || !content) {
        return null;
    }

    const alertIcon =
        variant === 'error' ? (
            <OctagonAlert className="text-red-600" />
        ) : (
            <CheckCircle2Icon className="text-primary" />
        );

    const alertTitleClass =
        variant === 'error' ? 'text-red-600' : 'text-primary';

    const alertBackgroundClass =
        variant === 'error' ? 'bg-red-500/10' : 'bg-primary/5';

    return (
        <div className="fixed right-6 bottom-6 z-50">
            <Alert
                className={[
                    alertBackgroundClass,
                    'w-[92vw] shadow-2xl backdrop-blur-sm transition-all duration-300 sm:w-96',
                    animate
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-2 opacity-0',
                ].join(' ')}
            >
                {alertIcon}
                <AlertTitle className={alertTitleClass}>
                    {content.title}
                </AlertTitle>
                <AlertDescription className="text-foreground">
                    {content.description}
                </AlertDescription>
            </Alert>
        </div>
    );
}
