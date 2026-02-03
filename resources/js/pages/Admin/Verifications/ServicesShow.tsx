import { Head, Link, useForm, usePage } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import {
  approve as approveService,
  index as servicesIndex,
  reject as rejectService,
} from "@/routes/admin/verifications/services";

type ServiceShow = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  pricing_type: string;
  payment_type: string;
  base_price: string | null;

  provider?: { id: number; name: string; avatar_path: string | null };
  category?: { id: number; name: string; slug: string };
  city?: { id: number; name: string };
  media?: Array<{ id: number; path: string; position: number }>;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ServicesVerificationsShow() {
  const { props } = usePage<{
    service: ServiceShow;
    errors?: Record<string, string>;
    flash?: { success?: string };
  }>();

  const s = props.service;
  const canReview = s.status === "pending";

  const approveForm = useForm({});
  const rejectForm = useForm({});
  const approveErrors = approveForm.errors as { status?: string };
  const rejectErrors = rejectForm.errors as { status?: string };

  const sortedMedia = (s.media ?? []).slice().sort((a, b) => a.position - b.position);

  return (
    <AppLayout>
      <Head title="Service review" />

      <div className="p-6 max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Service review</h1>
            <p className="text-sm text-muted-foreground">
              Approve or reject this service.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={servicesIndex().url}>Back</Link>
          </Button>
        </div>

        {props.flash?.success ? (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{props.flash.success}</AlertDescription>
          </Alert>
        ) : null}

        {props.errors?.status ? (
          <Alert variant="destructive">
            <AlertTitle>Action blocked</AlertTitle>
            <AlertDescription>{props.errors.status}</AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">{s.title}</div>
              {statusBadge(s.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="text-muted-foreground whitespace-pre-line">{s.description}</div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground">Provider:</span>{" "}
                <span className="font-medium">{s.provider?.name ?? "—"}</span>
              </div>

              <div>
                <span className="text-muted-foreground">Category:</span>{" "}
                <span className="font-medium">{s.category?.name ?? "—"}</span>
              </div>

              <div>
                <span className="text-muted-foreground">City:</span>{" "}
                <span className="font-medium">{s.city?.name ?? "—"}</span>
              </div>

              <div>
                <span className="text-muted-foreground">Pricing:</span>{" "}
                <span className="font-medium">{s.pricing_type}</span>
              </div>

              <div>
                <span className="text-muted-foreground">Payment:</span>{" "}
                <span className="font-medium">{s.payment_type}</span>
              </div>

              <div>
                <span className="text-muted-foreground">Base price:</span>{" "}
                <span className="font-medium">{s.base_price ?? "—"} </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="font-medium">Media</div>

              {sortedMedia.length === 0 ? (
                <div className="text-sm text-muted-foreground">No images.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sortedMedia.map((m) => {
                    const url = publicImagePath(m.path);
                    return (
                      <a key={m.id} href={url} target="_blank" rel="noreferrer">
                        <img
                          src={url}
                          alt="service media"
                          className="h-28 w-full rounded-md object-cover border"
                        />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="font-medium">Actions</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canReview ? (
              <Alert>
                <AlertTitle>Already reviewed</AlertTitle>
                <AlertDescription>This service is not pending anymore.</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!canReview || approveForm.processing}
                  onClick={() =>
                  approveForm.post(approveService(s.id).url, {
                    preserveScroll: true,
                  })
                  }
                >
                  Approve
                </Button>

                <Button
                  variant="destructive"
                  disabled={!canReview || rejectForm.processing}
                  onClick={() =>
                  rejectForm.post(rejectService(s.id).url, {
                    preserveScroll: true,
                  })
                  }
                >
                  Reject
                </Button>
            </div>

            <InputError message={approveErrors.status} />
            <InputError message={rejectErrors.status} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
