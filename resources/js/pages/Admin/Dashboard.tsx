import { Head, usePage } from '@inertiajs/react';

import InertiaFlashAlert from '@/components/inertia-flash-alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { SharedData } from '@/types';

type Verification = {
    id: number;
    provider_id: number;
    doc_type: string;
    doc_number: string;
};

type Report = {
    id: number;
    reporter_id: number;
    target_type: string;
    reason: string;
};

type Dispute = {
    id: number;
    booking_id: number;
    reason: string;
};

type Payout = {
    id: number;
    provider_id: number;
    amount: number;
};

type ActionRequired = {
    verifications: Verification[];
    reports: Report[];
    disputes: Dispute[];
    payouts: Payout[];
};

type RingProps = {
    label: string;
    value: number;
    percent: number;
};

function Ring({ label, value, percent }: RingProps) {
    const size = 110;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="rounded-2xl border bg-green-500/10 p-4 text-green-600 backdrop-blur transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 shrink-0">
                    <svg width={size} height={size} className="-rotate-90">
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            opacity={0.15}
                            strokeWidth={stroke}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold">{percent}%</div>
                        <div className="text-xs opacity-70">of total</div>
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="text-sm opacity-70">{label}</div>
                    <div className="text-2xl font-bold">{value}</div>

                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-current/10">
                        <div
                            className="h-full rounded-full bg-current"
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard({
    actionRequired,
}: {
    actionRequired: ActionRequired;
}) {
    const { flash } = usePage<
        SharedData & {
            flash?: {
                success?:
                    | string
                    | { title?: string; reason?: string; description?: string };
                error?:
                    | string
                    | { title?: string; reason?: string; description?: string };
            };
        }
    >().props;

    const stats = {
        verifications: actionRequired.verifications.length,
        reports: actionRequired.reports.length,
        disputes: actionRequired.disputes.length,
        payouts: actionRequired.payouts.length,
    };

    const total =
        stats.verifications + stats.reports + stats.disputes + stats.payouts ||
        1;

    const items = [
        {
            label: 'Verifications',
            value: stats.verifications,
            percent: Math.round((stats.verifications / total) * 100),
        },
        {
            label: 'Reports',
            value: stats.reports,
            percent: Math.round((stats.reports / total) * 100),
        },
        {
            label: 'Disputes',
            value: stats.disputes,
            percent: Math.round((stats.disputes / total) * 100),
        },
        {
            label: 'Payouts',
            value: stats.payouts,
            percent: Math.round((stats.payouts / total) * 100),
        },
    ];

    return (
        <AppLayout
            breadcrumbs={[{ title: 'Admin Dashboard', href: dashboard().url }]}
        >
            <Head title="Admin Dashboard" />
            <InertiaFlashAlert message={flash?.success} title="Success" />
            <InertiaFlashAlert
                message={flash?.error}
                title="Action blocked"
                variant="error"
            />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Review and manage platform activity.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) => (
                        <Ring
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            percent={item.percent}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="rounded-2xl border bg-background/60 backdrop-blur transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                Pending Verifications
                            </CardTitle>
                            {stats.verifications > 0 && (
                                <Badge className="rounded-full bg-green-600 text-white">
                                    {stats.verifications}
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm">
                            {stats.verifications === 0 ? (
                                <div className="text-muted-foreground">
                                    No pending verifications.
                                </div>
                            ) : (
                                actionRequired.verifications.map(
                                    (verification) => (
                                        <div
                                            key={verification.id}
                                            className="rounded-lg border px-3 py-2"
                                        >
                                            <div className="font-medium">
                                                Provider #
                                                {verification.provider_id}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {verification.doc_type} -{' '}
                                                {verification.doc_number}
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border bg-background/60 backdrop-blur transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                Open Reports
                            </CardTitle>
                            {stats.reports > 0 && (
                                <Badge className="rounded-full bg-green-600 text-white">
                                    {stats.reports}
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm">
                            {stats.reports === 0 ? (
                                <div className="text-muted-foreground">
                                    No open reports.
                                </div>
                            ) : (
                                actionRequired.reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="rounded-lg border px-3 py-2"
                                    >
                                        <div className="font-medium">
                                            {report.target_type} - reporter #
                                            {report.reporter_id}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {report.reason}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border bg-background/60 backdrop-blur transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                Open Disputes
                            </CardTitle>
                            {stats.disputes > 0 && (
                                <Badge className="rounded-full bg-green-600 text-white">
                                    {stats.disputes}
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm">
                            {stats.disputes === 0 ? (
                                <div className="text-muted-foreground">
                                    No open disputes.
                                </div>
                            ) : (
                                actionRequired.disputes.map((dispute) => (
                                    <div
                                        key={dispute.id}
                                        className="rounded-lg border px-3 py-2"
                                    >
                                        <div className="font-medium">
                                            Booking #{dispute.booking_id}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {dispute.reason}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border bg-background/60 backdrop-blur transition-all hover:shadow-lg">
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle className="text-base">
                                Pending Payouts
                            </CardTitle>
                            {stats.payouts > 0 && (
                                <Badge className="rounded-full bg-green-600 text-white">
                                    {stats.payouts}
                                </Badge>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-2 text-sm">
                            {stats.payouts === 0 ? (
                                <div className="text-muted-foreground">
                                    No pending payouts.
                                </div>
                            ) : (
                                actionRequired.payouts.map((payout) => (
                                    <div
                                        key={payout.id}
                                        className="rounded-lg border px-3 py-2"
                                    >
                                        <div className="font-medium">
                                            Provider #{payout.provider_id}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {Number(
                                                payout.amount,
                                            ).toLocaleString()}{' '}
                                            DZD
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
