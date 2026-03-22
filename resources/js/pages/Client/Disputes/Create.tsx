import { Head, Link, useForm } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { show as bookingShow } from "@/routes/client/bookings";
import { store as disputeStore } from "@/routes/client/bookings/dispute";
import { BadgeCheck, CircleX, ClipboardList, Clock, Info } from "lucide-react";
type Booking = {
  id: number;
  source: "service" | "request_offer";
  status: string;
  total_amount: string | number;
  currency: string;

  service_id: number | null;
  service?: { id: number; title: string; slug: string } | null;

  provider: { id: number; name: string; avatar_path?: string | null };

  offer?: {
    id: number;
    proposed_price: string | number;
    request?: { id: number; title: string } | null;
  } | null;
};

export default function Create({ booking }: { booking: Booking }) {
  const { data, setData, post, processing, errors } = useForm<{
    reason: string;
    description: string;
  }>({
    reason: "",
    description: "",
  });
  const formErrors = errors as {
    reason?: string;
    description?: string;
    dispute?: string;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(disputeStore(booking.id).url);
  };

  const title =
    booking.source === "service"
      ? booking.service?.title ?? "Service booking"
      : booking.offer?.request?.title ?? "Request booking";

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Bookings", href: bookingShow(booking.id).url },
        { title: "Open dispute", href: bookingShow(booking.id).url },
      ]}
    >
      <Head title="Open dispute" />

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Open dispute</h1>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id} • Provider: {booking.provider.name}
            </p>
          </div>

          <button className="rounded-3xl border  border-gray-200 text-red-600 px-2 py-2 hover:text-background transition duration-700 hover:bg-foreground">
            <Link href={bookingShow(booking.id).url}>Back</Link>
          </button>
        </div>

        <Card className="border  border-gray-200 rounded-4xl bg-primary-foreground/30">
          <CardHeader>
            <CardTitle>Booking summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="text-sm">
              
              <span className="text-xl">{title}</span>
            </div>

           <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-fit max-w-full flex flex-wrap items-center gap-2">
                                             <span>Status</span>{" "}
                                             {booking.status === "in_progress" ? (
                                               <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                                                 <ClipboardList className="h-4 w-4" /> in progress
                                               </div>
                                             ) : booking.status === "confirmed" ? (
                                               <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                                                 <BadgeCheck className="h-4 w-4" />
                                                 {booking.status}
                                               </div>
                                             ) : booking.status === "pending" ? (
                                               <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                                                 <Clock className="h-4 w-4" /> {booking.status}
                                               </div>
                                             ) : booking.status === "completed" ? (
                                               <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                                                 <BadgeCheck className="h-4 w-4" />
                                                 {booking.status}
                                               </div>
                                             ) : booking.status === "cancelled" ? (
                                               <div className="font-medium rounded-3xl p-2 border border-gray-200 text-red-600 flex items-center gap-2">
                                                 <CircleX className="h-4 w-4" /> {booking.status}
                                               </div>
                                             ) : null}
                                           </div>

            <div className="text-sm text-foreground rounded-3xl p-1 border border-gray-200 w-max flex items-center gap-2">
              <span className="">Total</span>{" "}
              <span className="font-mediumfont-medium text-foreground rounded-3xl p-2 border border-gray-200 w-max flex items-center">
                {booking.total_amount} {booking.currency}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-4xl bg-primary-foreground/30">
          <CardHeader>
            <CardTitle>Dispute details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={data.reason}
                  onChange={(e) => setData("reason", e.target.value)}
                  placeholder="Example: Provider didn’t show up"
                  required
                  className="rounded-3xl border border-gray-200"
                />
                <InputError message={formErrors.reason} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  placeholder="Explain what happened with details..."
                  rows={6}
                   className="rounded-4xl border border-gray-200"
                />
                <InputError message={formErrors.description} />
              </div>

              {formErrors.dispute && (
                <p className="text-sm font-medium text-red-600">
                  {formErrors.dispute}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button disabled={processing} className="rounded-3xl p-2 border border-gray-200 bg-primary text-primary-foreground hover:text-background transition duration-700 hover:bg-foreground">
                  Submit dispute
                </button>
                <button  type="button" className="rounded-3xl border p-2 border-gray-200 text-foreground hover:text-background transition duration-700 hover:bg-foreground" >
                  <Link href={bookingShow(booking.id).url}>
                    Cancel
                  </Link>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                After you submit, the admin will review your dispute and may
                contact you or the provider.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
