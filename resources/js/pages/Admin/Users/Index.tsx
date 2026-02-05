import { Head, Link, usePage } from "@inertiajs/react";
import { useMemo } from "react";

import InputError from "@/components/input-error";
import PaginationLinks from "@/components/pagination-links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";

// Wayfinder (adjust import if your generated routes path differs)
import { index as adminUsersIndex, show as adminUsersShow } from "@/routes/admin/users";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "provider" | "client";
  status: "active" | "inactive";
  avatar_path?: string | null;
  created_at?: string | null;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
};

type PageProps = {
  users: Paginated<UserRow>;
  filters: {
    q: string;
    role: string;
    status: string;
  };
  errors?: {
    q?: string;
    role?: string;
    status?: string;
  };
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "muted";
}) {
  const cls = useMemo(() => {
    switch (variant) {
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "danger":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "muted":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  }, [variant]);

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export default function AdminUsersIndex() {
  const { props } = usePage<PageProps>();
  const { users, filters } = props;

  return (
    <AppLayout>
      <Head title="Users Management" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Search and manage users (status + role).
          </p>
        </div>

        {/* Filters */}
        <form method="get" action={adminUsersIndex().url} className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" placeholder="Name or email..." defaultValue={filters.q ?? ""} />
              <InputError message={props.errors?.q} />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              {/* Shadcn Select doesn't submit a value automatically, so we keep a hidden input */}
              <input type="hidden" name="role" value={filters.role ?? ""} />
              <Select
                defaultValue={filters.role ?? ""}
                onValueChange={(v) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="role"]');
                  if (input) input.value = v === "__all" ? "" : v;
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <input type="hidden" name="status" value={filters.status ?? ""} />
              <Select
                defaultValue={filters.status ?? ""}
                onValueChange={(v) => {
                  const input = document.querySelector<HTMLInputElement>('input[name="status"]');
                  if (input) input.value = v === "__all" ? "" : v;
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit">Apply</Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = adminUsersIndex().url;
              }}
            >
              Reset
            </Button>

            <div className="ml-auto text-sm text-muted-foreground">
              Total: <span className="font-medium text-foreground">{users.total}</span>
            </div>
          </div>
        </form>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {users.data.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-muted-foreground" colSpan={5}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.data.map((u) => {
                    const avatar = publicImagePath(u.avatar_path);
                    return (
                      <tr key={u.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted shrink-0">
                              {avatar ? (
                                <img src={avatar} alt={u.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{u.name}</div>
                              <div className="text-muted-foreground truncate">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant={u.role === "admin" ? "default" : u.role === "provider" ? "success" : "muted"}>
                            {u.role}
                          </Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
                        </td>

                        <td className="px-4 py-3 text-muted-foreground">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={adminUsersShow(u.id).url}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.links?.length > 1 && (
            <div className="border-t p-3">
              <PaginationLinks links={users.links} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}


