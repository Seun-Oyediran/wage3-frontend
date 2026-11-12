"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { LogoField } from "@/components/ui/logo-field";
import { PageHeader } from "@/components/ui/page-header";
import { useSession } from "@/lib/auth/use-session";
import { useCompany, useLocalValue } from "@/lib/local-prefs";

export default function SettingsPage() {
  const [company, update] = useCompany();
  const [, setOnboarded] = useLocalValue("wage3.onboarded");
  const { user } = useSession();

  return (
    <>
      <PageHeader title="Settings" description="Your organisation and account." />

      <div className="flex max-w-2xl flex-col gap-6">
        <SettingsCard title="Company details" description="Shown on the payment records you export. Saved on this device for now.">
          <div className="mt-6 flex flex-col gap-6">
            <LogoField value={company.logo} onChange={(logo) => update({ logo })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company" htmlFor="company-name">
                <Input
                  id="company-name"
                  value={company.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Acme DAO"
                  autoComplete="organization"
                />
              </Field>
              <Field label="Email" htmlFor="company-email">
                <Input
                  id="company-email"
                  type="email"
                  value={company.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="payroll@acme.xyz"
                  autoComplete="email"
                />
              </Field>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          title="Payment walkthrough"
          description="The short guide shown before your first payment: a dedicated wallet, funds, and how paying works."
          action={
            // It shows once; this brings it back.
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOnboarded(null);
                toast.success("It'll show next time you start a payment");
              }}
            >
              Show it again
            </Button>
          }
        />

        <SettingsCard title="Account">
          <dl className="mt-4 flex flex-col gap-2.5 text-13">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-fg-subtle">Logged in as</dt>
              <dd className="font-medium">{user?.email ?? "—"}</dd>
            </div>
          </dl>
        </SettingsCard>
      </div>
    </>
  );
}

/** One settings card: a title and line, then its fields, or a single action beside them. */
function SettingsCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0 self-start sm:self-auto">{action}</div>}
      </div>
      {children}
    </Card>
  );
}
