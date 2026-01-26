import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";

type Verification = {
    id: number;
    provider_id: number;
    doc_type: string;
    doc_number: string;
    status: string;
    created_at: string;
};

type Report = {
    id: number;
    reporter_id: number;
    target_type: string;
    target_id: number;
    reason: string;
    status: string;
    created_at: string;
};

type Dispute = {
    id: number;
    booking_id: number;
    opened_by: number;
    reason: string;
    status: string;
    created_at: string;
};

type Payout = {
    id: number;
    provider_id: number;
    amount: number;
    status: string;
    created_at: string;
};

export default function Dashboard({
    actionRequired,
}: {
        actionRequired: {
        verifications: Verification[];
        reports: Report[];
        disputes: Dispute[];
        payouts: Payout[];
    };
}) {
    return (
<AppLayout breadcrumbs={[{ title: "Admin Dashboard", href: "/admin/dashboard" }]}>

    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div className="space-y-1">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
            Simple review center: pending items that need admin action.
        </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Provider Verifications */}
        <Card className="transition duration-800 hover:bg-black hover:text-white hover: ">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Verifications</CardTitle>
             {actionRequired.verifications.length > 0 && (
                    <Badge variant="secondary" className="text-bold rounded-full text-white bg-red-700 ">{actionRequired.verifications.length}</Badge>
                )}
            
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
            {actionRequired.verifications.length === 0 ? (
                <div className="text-muted-foreground">No pending verifications.</div>
            ) : (
                actionRequired.verifications.map((v) => (
                <div key={v.id} className="border rounded-md px-3 py-2">
                    <div className="font-medium">Provider #{v.provider_id}</div>
                    <div className="text-xs text-muted-foreground">
                    {v.doc_type} • {v.doc_number}
                    </div>
                </div>
                ))
            )}

            {/* Later when you build the page */}
            {/* <Link href="/admin/verifications" className="underline text-sm">View all</Link> */}
            </CardContent>
        </Card>

        {/* Reports */}
        <Card className="transition duration-800 hover:bg-black hover:text-white hover">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Open Reports</CardTitle>
             {actionRequired.reports.length > 0 && (
                    <Badge variant="secondary" className="text-bold rounded-full text-white bg-red-700 ">{actionRequired.reports.length}</Badge>
                )}
           
            </CardHeader>
            <CardContent className="space-y-2 text-sm ">
            {actionRequired.reports.length === 0 ? (
                <div className="text-muted-foreground">No open reports.</div>
            ) : (
                actionRequired.reports.map((r) => (
                    <div key={r.id} className="border rounded-md px-3 py-2">
                    <div className="font-medium">
                    {r.target_type} <span className="font-bold"> reporter:#{r.reporter_id}</span>

                    </div>
                    <div className="text-xs text-muted-foreground">{r.reason}</div>
                </div>
                ))
            )}

            {/* Later */}
            {/* <Link href="/admin/reports" className="underline text-sm">View all</Link> */}
            </CardContent>
        </Card>

        {/* Disputes */}
        <Card className="transition duration-800 hover:bg-black hover:text-white hover">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Open Disputes</CardTitle>
            {actionRequired.disputes.length > 0 && (
                    <Badge variant="secondary" className="text-bold rounded-full text-white bg-red-700 ">{actionRequired.disputes.length}</Badge>
                )}
            
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
            {actionRequired.disputes.length === 0 ? (
                <div className="text-muted-foreground">No open disputes.</div>
            ) : (
                actionRequired.disputes.map((d) => (
                <div key={d.id} className="border rounded-md px-3 py-2">
                    <div className="font-medium">Booking #{d.booking_id}</div>
                    <div className="text-xs text-muted-foreground">{d.reason}</div>
                </div>
                ))
            )}

            {/* Later */}
            {/* <Link href="/admin/disputes" className="underline text-sm">View all</Link> */}
            </CardContent>
        </Card >

        {/* Payouts */}
        <Card className="md:w-120 transition duration-800  hover:bg-black hover:text-white hover">
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Payouts</CardTitle>
                {actionRequired.payouts.length > 0 && (
                    <Badge variant="secondary" className="text-bold rounded-full text-white bg-red-400 ">{actionRequired.payouts.length}</Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
            {actionRequired.payouts.length === 0 ? (
                <div className="text-muted-foreground">No pending payouts.</div>
            ) : (
                actionRequired.payouts.map((p) => (
                <div key={p.id} className="border rounded-md px-3 py-2">
                    <div className="font-medium">Provider #{p.provider_id}</div>
                    <div className="text-xs text-muted-foreground">
                    Amount: {Number(p.amount).toLocaleString()} DZD
                    </div>
                </div>
                ))
            )}

            {/* Later */}
            {/* <Link href="/admin/payouts" className="underline text-sm">View all</Link> */}
            </CardContent>
        </Card>
        </div>
    </div>
</AppLayout>
    );
}
