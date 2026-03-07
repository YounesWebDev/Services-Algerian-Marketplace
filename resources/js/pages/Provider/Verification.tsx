import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  CircleCheckBig,
  Download,
  IdCard,
  UploadCloud,
} from "lucide-react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { store as providerVerificationStore } from "@/routes/provider/verification";

type Verification = {
  id: number;
  doc_type: string;
  doc_number: string;
  doc_path: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string | null;
  updated_at?: string | null;
} | null;

type PageProps = {
  verification: Verification;
  is_verified: boolean;
  flash?: { success?: string };
  errors?: { verification?: string };
};

const publicFilePath = (path?: string | null) => {
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

export default function ProviderVerification() {
  const { props } = usePage<PageProps>();

  const verification = props.verification;
  const isVerified = props.is_verified;

  const middlewareError = props.errors?.verification;
  const flashSuccess = props.flash?.success;

  const form = useForm<{
    doc_type: string;
    doc_number: string;
    doc_file: File | null;
  }>({
    doc_type: verification?.doc_type ?? "",
    doc_number: verification?.doc_number ?? "",
    doc_file: null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    form.post(providerVerificationStore().url, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const canSubmit =
    !isVerified && (!verification || verification.status !== "pending");

  const docUrl = publicFilePath(verification?.doc_path ?? null);

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
      <Head title="Provider verification" />

      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Provider verification</h1>
            <p className="text-sm text-muted-foreground">
              To use provider features (create services, send offers, manage bookings),
              you must verify your account.
            </p>
          </div>

          {!isVerified ? (
            <Button variant="outline" asChild  className="rounded-3xl text-foreground border-gray-200 transition duration-700 hover:bg-foreground hover:text-background">
              <Link href={dashboard().url}>
                Skip for now
            
              </Link>
            </Button>
          ) : null}
        </div>

        {middlewareError ? (
          <Alert variant="destructive">
            <AlertTitle>Verification required</AlertTitle>
            <AlertDescription>{middlewareError}</AlertDescription>
          </Alert>
        ) : null}

        {flashSuccess ? (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flashSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {/* Current status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">Current status</div>
              {isVerified ? (
                <div className="text-primary flex items-center gap-2 border border-gray-200 p-2 rounded-3xl">
                  <CircleCheckBig className="w-4 h-4" /> Verified
                </div>
              ) : (
                <Badge variant="outline" className="rounded-2xl text-red-600 border-gray-200">Not verified</Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {verification ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Submission:</span>
                  {statusBadge(verification.status)}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Document type:</span>{" "}
                  <span className="font-medium flex items-center gap-2">
                    <IdCard className="w-4 h-4" /> {verification.doc_type}
                  </span>
                </div>

                <div>
                  <span className="text-muted-foreground">Document number:</span>{" "}
                  <span className="font-medium">{verification.doc_number}</span>
                </div>

                {docUrl ? (
                  <div>
                    <span className="text-muted-foreground flex items-center">
                      Uploaded file:
                    </span>
                    <a
                      className="text-foreground transition duration-700 hover:text-primary flex items-center"
                      href={docUrl}
                      download
                    >
                      <Download className="w-4 h-4 inline mr-1" /> Download
                    </a>
                  </div>
                ) : null}

                {verification.status === "pending" ? (
                  <p className="text-muted-foreground">
                    Your verification is pending. Please wait for admin review.
                  </p>
                ) : null}

                {verification.status === "rejected" ? (
                  <Alert variant="destructive">
                    <AlertTitle>Rejected</AlertTitle>
                    <AlertDescription>
                      Your verification was rejected. Please submit again with correct details.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {verification.status === "approved" ? (
                  <Alert>
                    <AlertTitle>Approved</AlertTitle>
                    <AlertDescription>
                      Your verification is approved. You can use all provider features now.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">
                You have not submitted verification yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit form */}
        {canSubmit ? (
          <Card>
            <CardHeader>
              <div className="font-medium">Submit verification</div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={submit} className="space-y-4">
                {/* Document number */}
                <div className="grid gap-2">
                  <Label htmlFor="doc_number">Document number</Label>
                  <Input
                    id="doc_number"
                    value={form.data.doc_number}
                    onChange={(e) => form.setData("doc_number", e.target.value)}
                    placeholder="Enter the number on your document"
                    disabled={!canSubmit}
                    className="rounded-3xl bg-primary-foreground/30 border border-gray-200"
                  />
                  <InputError message={form.errors.doc_number} />
                </div>

                {/* Document type + file */}
                <div className="grid gap-6">
                  {/* Document Type Dropdown */}
                  <div className="grid gap-2">
                    <Label htmlFor="doc_type">Document type</Label>

                    <div className="relative">
                      <select
                        id="doc_type"
                        value={form.data.doc_type}
                        onChange={(e) => form.setData("doc_type", e.target.value)}
                        disabled={!canSubmit}
                        className="appearance-none w-full rounded-4xl border border-gray-200 bg-primary-foreground/40 px-4 py-3 pr-10 text-sm shadow-sm transition duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Select document</option>
                        <option value="passport">Passport</option>
                        <option value="id_card">ID Card</option>
                        <option value="driving_license">Driving License</option>
                      </select>

                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>

                    <InputError message={form.errors.doc_type} />
                  </div>

                  {/* File Upload */}
                  <div className="grid gap-2">
                    <Label>Upload document</Label>

                    <label
                      htmlFor="doc_file"
                      className={`flex flex-col items-center justify-center gap-2 rounded-4xl border-2 border-dashed border-gray-300 bg-primary-foreground/30 p-6 text-center cursor-pointer transition duration-300 hover:border-primary hover:bg-primary/5 ${
                        !canSubmit ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <UploadCloud className="h-8 w-8 text-muted-foreground" />

                      {form.data.doc_file ? (
                        <span className="text-sm font-medium text-primary">
                          {form.data.doc_file.name}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Click to upload or drag & drop
                        </span>
                      )}

                      <span className="text-xs text-muted-foreground">
                        PNG / JPG / WEBP / PDF â€¢ Max 4MB
                      </span>
                    </label>

                    <input
                      id="doc_file"
                      type="file"
                      accept="image/png,image/jpg,image/jpeg,image/webp,application/pdf"
                      className="hidden"
                      disabled={!canSubmit}
                      onChange={(e) =>
                        form.setData("doc_file", e.target.files?.[0] ?? null)
                      }
                    />

                    <InputError message={form.errors.doc_file} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button disabled={!canSubmit || form.processing} className="rounded-3xl transition duration-700 hover:bg-foreground hover:text-background">Submit</Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset("doc_file")}
                    disabled={!canSubmit || form.processing}
                     className="rounded-3xl transition border border-gray-200 duration-700 hover:bg-foreground hover:text-background"
                  >
                    Reset file
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
