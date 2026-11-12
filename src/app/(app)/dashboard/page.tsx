"use client";

import { AttentionBanner } from "@/components/dashboard/attention-banner";
import { FirstRun } from "@/components/dashboard/first-run";
import { ListsPreview } from "@/components/dashboard/lists-preview";
import { Overview } from "@/components/dashboard/overview";
import { RECENT_PAYMENTS_QUERY, RecentPayments } from "@/components/dashboard/recent-payments";
import { StartPayment } from "@/components/dashboard/start-payment";
import { PageHeader } from "@/components/ui/page-header";
import { useMe, useSentHistory } from "@/lib/api/queries";
import { useSession } from "@/lib/auth/use-session";
import { firstName, greeting } from "@/lib/utils/display";

export default function DashboardPage() {
  const { user: sessionUser } = useSession();
  const { data: me } = useMe();
  const name = firstName(me ?? sessionUser);

  const history = useSentHistory(RECENT_PAYMENTS_QUERY);
  const firstRun = history.isSuccess && history.data.items.length === 0;

  return (
    <>
      <PageHeader title={name ? `${greeting()}, ${name}` : greeting()} description="Send payments to your team in one go." />
      <StartPayment className="mb-8" />
      <AttentionBanner className="mb-6" />

      <div className="flex flex-col gap-8">
        <Overview />
        {firstRun ? (
          <FirstRun />
        ) : (
          <>
            <ListsPreview />
            <RecentPayments />
          </>
        )}
      </div>
    </>
  );
}
