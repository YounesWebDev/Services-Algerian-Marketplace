import { Head, Link, useForm } from "@inertiajs/react";
import { CircleX } from "lucide-react";

import InputError from "@/components/input-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { store as reportStore } from "@/routes/reports";

type Target = {
  type: "service" | "provider" | "request";
  id: number;
  title: string;
};

export default function Create({ target }: { target: Target }) {
  const { data, setData, post, processing, errors } = useForm<{
    target_type: Target["type"];
    target_id: number;
    reason: string;
    description: string;
  }>({
    target_type: target.type,
    target_id: target.id,
    reason: "",
    description: "",
  });
  const formErrors = errors as {
    target_type?: string;
    target_id?: string;
    reason?: string;
    description?: string;
    report?: string;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(reportStore().url);
  };

  const typeLabel =
    target.type === "service"
      ? "Service"
      : target.type === "provider"
      ? "Provider"
      : "Request";

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
      <Head title="Report" />

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Report</h1>
            <p className="text-sm text-muted-foreground">
              Report inappropriate content or suspicious behavior.
            </p>
          </div>

          <button className="rounded-3xl px-3 py-2 text-red-600 border border-gray-200 transition duration-700 hover:text-background hover:bg-foreground">
            <Link href={dashboard().url}>Back</Link>
          </button>
        </div>

        <Card className="rounded-4xl bg-primary-foreground/30 border border-gray-200">
          <CardHeader>
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span>{" "}
              <span className="font-medium">{typeLabel}</span>
            </div>
            <div className="truncate">
              <span className="text-muted-foreground">Title:</span>{" "}
              <span className="font-medium">{target.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>{" "}
              <span className="font-medium">#{target.id}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-4xl bg-primary-foreground/30 border border-gray-200">
          <CardHeader>
            <CardTitle>Report details</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              {/* Hidden fields */}
              <input type="hidden" name="target_type" value={data.target_type} />
              <input type="hidden" name="target_id" value={data.target_id} />

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input className="rounded-3xl p-2 border border-gray-200 "
                  id="reason"
                  value={data.reason}
                  onChange={(e) => setData("reason", e.target.value)}
                  placeholder="Example: Scam / Fake information / Spam"
                  required
                />
                <InputError message={formErrors.reason} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                className="rounded-3xl p-2 border border-gray-200 "
                  id="description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  placeholder="Explain what happened (optional)..."
                  rows={6}
                />
                <InputError message={formErrors.description} />
                <p className="text-xs text-muted-foreground">
                  Note: description is optional. (If you didnâ€™t add a DB column,
                  it wonâ€™t be stored yet.)
                </p>
              </div>

              {formErrors.report && (
                <p className="text-sm font-medium text-red-600">{formErrors.report}</p>
              )}

              <div className="flex items-center gap-3">
                <button disabled={processing} className="rounded-3xl border bg-primary border-gray-200 transition duration-700 hover:bg-foreground hover:text-background p-2 ">Submit report</button>
                <button disabled={processing} className="rounded-3xl flex items-center px-3 py-2 text-red-600 border border-gray-200 transition duration-700 hover:text-background hover:bg-foreground">
                  <Link href={dashboard().url}>
                    <div className="flex items-center gap-2"><CircleX /> Cancel</div>
                  </Link>
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Admin will review your report and take action if needed.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
