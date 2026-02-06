import { Head, Link, useForm } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { show as bookingShow } from "@/routes/client/bookings";
import { store as reviewStore } from "@/routes/client/bookings/review";
type Booking = {
  id: number;
  status: string;
  service_id: number | null;
  service?: { id: number; title: string; slug: string } | null;
  provider: { id: number; name: string; avatar_path?: string | null };
};

export default function Create({ booking }: { booking: Booking }) {
  const { data, setData, post, processing, errors } = useForm<{
    provider_rating: string; // "" means skipped
    service_rating: string; // "" means skipped
    comment: string;
  }>({
    provider_rating: "",
    service_rating: "",
    comment: "",
  });
  const formErrors = errors as {
    provider_rating?: string;
    service_rating?: string;
    comment?: string;
    review?: string;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Optional client-side guard (server also validates)
    const hasRating = data.provider_rating !== "" || data.service_rating !== "";
    const hasComment = data.comment.trim().length > 0;

    if (!hasRating && !hasComment) {
      // If you use toast in your project, replace this with toast
      alert("Please add a rating or write a comment.");
      return;
    }

    post(reviewStore(booking.id).url);
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Bookings", href: bookingShow(booking.id).url },
        { title: "Review", href: bookingShow(booking.id).url },
      ]}
    >
      <Head title="Write a review" />

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Write a review</h1>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id} •{" "}
              {booking.service_id ? "Service booking" : "Request-offer booking"}
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={bookingShow(booking.id).url}>Back</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {booking.service_id ? "Review this service" : "Review this provider"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Provider</div>
              <div className="font-medium">{booking.provider.name}</div>
            </div>

            {booking.service_id && booking.service && (
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Service</div>
                <div className="font-medium">{booking.service.title}</div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              {/* Rating (optional) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label>Provider rating (optional)</Label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setData("provider_rating", "")}
                    disabled={processing}
                  >
                    Skip provider rating
                  </Button>
                </div>

                <RadioGroup
                  value={data.provider_rating}
                  onValueChange={(v) => setData("provider_rating", v)}
                  className="flex flex-wrap gap-3"
                >
                  {["1", "2", "3", "4", "5"].map((v) => (
                    <div key={v} className="flex items-center gap-2">
                      <RadioGroupItem value={v} id={`provider-rating-${v}`} />
                      <Label htmlFor={`provider-rating-${v}`}>{v}</Label>
                    </div>
                  ))}
                </RadioGroup>

                <InputError message={formErrors.provider_rating} />
              </div>

              {booking.service_id && booking.service && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label>Service rating (optional)</Label>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setData("service_rating", "")}
                      disabled={processing}
                    >
                      Skip service rating
                    </Button>
                  </div>

                  <RadioGroup
                    value={data.service_rating}
                    onValueChange={(v) => setData("service_rating", v)}
                    className="flex flex-wrap gap-3"
                  >
                    {["1", "2", "3", "4", "5"].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`service-rating-${v}`} />
                        <Label htmlFor={`service-rating-${v}`}>{v}</Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <InputError message={formErrors.service_rating} />
                </div>
              )}

              {/* Comment (optional) */}
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={data.comment}
                  onChange={(e) => setData("comment", e.target.value)}
                  placeholder="Write your experience..."
                />
                <InputError message={formErrors.comment} />
              </div>

              {/* Global error */}
              {formErrors.review && (
                <p className="text-sm font-medium text-red-600">{formErrors.review}</p>
              )}

              <Button disabled={processing}>Submit review</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
