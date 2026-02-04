import { Head, Link, useForm } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { show as bookingShow } from "@/routes/client/bookings";
import { store as disputeStore } from "@/routes/client/bookings/dispute";

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
    <AppLayout>
      <Head title="Open dispute" />

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Open dispute</h1>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id} • Provider: {booking.provider.name}
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={bookingShow(booking.id).url}>Back</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking summary</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Title:</span>{" "}
              <span className="font-medium">{title}</span>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Status:</span>{" "}
              <span className="font-medium">{booking.status}</span>
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-medium">
                {booking.total_amount} {booking.currency}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
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
                />
                <InputError message={formErrors.description} />
              </div>

              {formErrors.dispute && (
                <p className="text-sm font-medium text-red-600">
                  {formErrors.dispute}
                </p>
              )}

              <div className="flex items-center gap-3">
                <Button disabled={processing}>Submit dispute</Button>
                <Button variant="outline" type="button" asChild>
                  <Link href={bookingShow(booking.id).url}>
                    Cancel
                  </Link>
                </Button>
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
