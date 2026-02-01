import { Transition } from "@headlessui/react";
import { Form, Head, Link, usePage } from "@inertiajs/react";

import ProfileController from "@/actions/App/Http/Controllers/Settings/ProfileController";
import DeleteUser from "@/components/delete-user";
import HeadingSmall from "@/components/heading-small";
import InputError from "@/components/input-error";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { edit } from "@/routes/profile";
import { send } from "@/routes/verification";
import { type BreadcrumbItem, type SharedData } from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Profile settings",
    href: edit().url,
  },
];

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
};

type ProfileRow = {
  bio?: string | null;
  address?: string | null;
  company_name?: string | null;
} | null;

type ProfileErrors = {
  avatar?: string;
  bio?: string;
  address?: string;
  company_name?: string;
  name?: string;
  email?: string;
};

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const page = usePage<
    SharedData & {
      profile?: ProfileRow;
      avatar_path?: string | null;
    }
  >();

  const { auth, profile: profileRow, avatar_path } = page.props;

  const avatarFromShared = auth.user.avatar_path ?? null;
  const avatarUrl = publicImagePath(avatar_path ?? avatarFromShared);

  const isProvider = auth.user.role === "provider";

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Profile settings" />

      <h1 className="sr-only">Profile Settings</h1>

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Profile information"
            description="Update your name, email, avatar, and profile details"
          />

          <Form
            {...ProfileController.update.form()}
            options={{ preserveScroll: true }}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {({ processing, recentlySuccessful, errors }) => {
              const fieldErrors = errors as ProfileErrors;

              return (
              <>
                {/* Avatar */}
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={avatarUrl} alt={auth.user.name} />
                        <AvatarFallback>{initials(auth.user.name)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="grid gap-2">
                          <Label htmlFor="avatar">Profile picture</Label>
                          <Input
                            id="avatar"
                            name="avatar"
                            type="file"
                            accept="image/png,image/jpg,image/jpeg,image/webp"
                          />
                          <InputError className="mt-1" message={fieldErrors.avatar} />
                          <p className="text-xs text-muted-foreground">
                            PNG/JPG/WEBP up to 4MB.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Name / Email */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>

                  <Input
                    id="name"
                    className="mt-1 block w-full"
                    defaultValue={auth.user.name}
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Full name"
                  />

                  <InputError className="mt-2" message={fieldErrors.name} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>

                  <Input
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    defaultValue={auth.user.email}
                    name="email"
                    required
                    autoComplete="username"
                    placeholder="Email address"
                  />

                  <InputError className="mt-2" message={fieldErrors.email} />
                </div>

                {mustVerifyEmail && auth.user.email_verified_at === null && (
                  <div>
                    <p className="-mt-4 text-sm text-muted-foreground">
                      Your email address is unverified.{" "}
                      <Link
                        href={send().url}
                        method="post"
                        as="button"
                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                      >
                        Click here to resend the verification email.
                      </Link>
                    </p>

                    {status === "verification-link-sent" && (
                      <div className="mt-2 text-sm font-medium text-green-600">
                        A new verification link has been sent to your email address.
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Profile fields */}
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={profileRow?.bio ?? ""}
                    placeholder="Write a short bio about yourself..."
                    className="min-h-30"
                  />
                  <InputError className="mt-2" message={fieldErrors.bio} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={profileRow?.address ?? ""}
                    placeholder="Your address"
                  />
                  <InputError className="mt-2" message={fieldErrors.address} />
                </div>

                {isProvider ? (
                  <div className="grid gap-2">
                    <Label htmlFor="company_name">Company name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      defaultValue={profileRow?.company_name ?? ""}
                      placeholder="Your company name"
                    />
                    <InputError className="mt-2" message={fieldErrors.company_name} />
                  </div>
                ) : null}

                <div className="flex items-center gap-4">
                  <Button disabled={processing} data-test="update-profile-button">
                    Save
                  </Button>

                  <Transition
                    show={recentlySuccessful}
                    enter="transition ease-in-out"
                    enterFrom="opacity-0"
                    leave="transition ease-in-out"
                    leaveTo="opacity-0"
                  >
                    <p className="text-sm text-neutral-600">Saved</p>
                  </Transition>
                </div>
              </>
              );
            }}
          </Form>
        </div>

        <DeleteUser />
      </SettingsLayout>
    </AppLayout>
  );
}
