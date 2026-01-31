import { Head, Link, usePage } from "@inertiajs/react";

import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import {
  create as myRequestsCreate,
  index as myRequestsIndex,
} from "@/routes/client/my/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = { id: number; request_id: number; path: string; type: string; position: number };

type RequestItem = {
  id: number;
  title: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  created_at: string;
  category: Category;
  city: City;
  media: Media[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

function renderPagination(links: PaginationLink[]) {
  if (!links?.length) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        {links.map((link, idx) => {
          const labelText = link.label
            .replace(/&laquo;|&raquo;/g, "")
            .replace(/&hellip;/g, "...")
            .replace(/&nbsp;/g, " ")
            .trim();

          const lowerLabel = labelText.toLowerCase();
          const isPrev = lowerLabel.includes("previous");
          const isNext = lowerLabel.includes("next");
          const isEllipsis = labelText === "..." || labelText === "…";

          if (isEllipsis) {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          if (!link.url) {
            return (
              <PaginationItem key={`disabled-${idx}`}>
                <span
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: isPrev || isNext ? "default" : "icon",
                    }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  {isPrev ? "Previous" : isNext ? "Next" : labelText}
                </span>
              </PaginationItem>
            );
          }

          if (isPrev) {
            return (
              <PaginationItem key={`prev-${idx}`}>
                <PaginationPrevious href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          if (isNext) {
            return (
              <PaginationItem key={`next-${idx}`}>
                <PaginationNext href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={`${link.url}-${idx}`}>
              <PaginationLink href={link.url} preserveScroll isActive={link.active}>
                {labelText}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </PaginationContent>
    </Pagination>
  );
}

export default function ClientRequestsIndex() {
  const { requests, filters } = usePage<{
    requests: { data: RequestItem[]; links: PaginationLink[] };
    filters: { status: string };
  }>().props;

  return (
    <AppLayout>
      <Head title="My Requests" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Requests</h1>

          <Link
            href={myRequestsCreate.url()}
            className="inline-flex items-center rounded-md bg-black px-3 py-2 text-white text-sm"
          >
            Create Request
          </Link>
        </div>

        <div className="flex gap-2 items-center">
          <Link
            href={myRequestsIndex.url()}
            className={`px-3 py-1 rounded-md text-sm border ${
              filters.status === "" ? "bg-black text-white" : "bg-white"
            }`}
          >
            All
          </Link>

          {["open", "assigned", "closed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={myRequestsIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-md text-sm border ${
                filters.status === s ? "bg-black text-white" : "bg-white"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {requests.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No requests yet.
            </div>
          ) : (
            requests.data.map((r) => (
              <div key={r.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium">{r.title}</div>
                  <Link
                    href={`/my/requests/${r.id}`}
                    className="text-sm underline"
                  >
                    View
                  </Link>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {r.category?.name} - {r.city?.name}
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-medium">{r.status}</span>
                </div>

                <div className="text-sm text-gray-600 mt-1">
                  Budget:{" "}
                  <span className="font-medium">
                    {r.budget_min ?? "--"} - {r.budget_max ?? "--"} DZD
                  </span>
                  {r.urgency ? (
                    <>
                      {" "}
                      - Urgency: <span className="font-medium">{r.urgency}</span>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {requests.links?.length > 0 && renderPagination(requests.links)}
      </div>
    </AppLayout>
  );
}



