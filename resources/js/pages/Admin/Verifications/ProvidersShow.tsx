import { Head, Link, useForm, usePage } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import {
  approve as approveProvider,
  index as providersIndex,
  reject as rejectProvider,
} from "@/routes/admin/verifications/providers";

type VerificationShow = {
  id: number;
  status: "pending" | "approved" | "rejected";
  doc_type: string;
  doc_number: string;
  doc_path: string;
  created_at?: string | null;
  provider: {
    id: number;
    name: string;
    email: string;
    avatar_path: string | null;
    is_verified: boolean;
  };
  reviewer: { id: number; name: string } | null;
};

const publicFilePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ProvidersVerificationsShow() {
  const { props } = usePage<{
    verification: VerificationShow;
    errors?: Record<string, string>;
    flash?: { success?: string };
  }>();

  const v = props.verification;
  const flash = props.flash?.success;

  const approveForm = useForm({});
  const rejectForm = useForm({});
  const approveErrors = approveForm.errors as { status?: string };
  const rejectErrors = rejectForm.errors as { status?: string };

  const canReview = v.status === "pending";
  const docUrl = publicFilePath(v.doc_path);
  const avatar = publicImagePath(v.provider.avatar_path);

  return (
    <AppLayout>
      <Head title="Provider verification" />

      <div className="p-6 max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Provider verification</h1>
            <p className="text-sm text-muted-foreground">
              Review document and decide.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={providersIndex().url}>Back</Link>
          </Button>
        </div>

        {flash ? (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flash}</AlertDescription>
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
              <div className="font-medium">Submission details</div>
              {statusBadge(v.status)}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar} alt={v.provider.name} />
                <AvatarFallback>{initials(v.provider.name)}</AvatarFallback>
              </Avatar>

              <div>
                <div className="font-medium">{v.provider.name}</div>
                <div className="text-xs text-muted-foreground">{v.provider.email}</div>
              </div>

              <div className="ml-auto flex gap-2">
                {v.provider.is_verified ? (
                  <Badge>Profile verified</Badge>
                ) : (
                  <Badge variant="outline">Not verified</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <span className="text-muted-foreground">Document type:</span>{" "}
              <span className="font-medium">{v.doc_type}</span>
            </div>

            <div>
              <span className="text-muted-foreground">Document number:</span>{" "}
              <span className="font-medium">{v.doc_number}</span>
            </div>

            <div>
              <span className="text-muted-foreground">File:</span>{" "}
              {docUrl ? (
                <a className="underline" href={docUrl} target="_blank" rel="noreferrer">
                  View / download
                </a>
              ) : (
                <span className="text-muted-foreground">No file</span>
              )}
            </div>

            {v.reviewer ? (
              <div className="text-xs text-muted-foreground">
                Reviewed by: {v.reviewer.name}
              </div>
            ) : null}
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
                <AlertDescription>
                  This verification is not pending anymore.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!canReview || approveForm.processing}
                onClick={() =>
                  approveForm.post(approveProvider(v.id).url, {
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
                  rejectForm.post(rejectProvider(v.id).url, {
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
