"use client";

import { CodeInput } from "@/components/ui/code-input";
import { Spinner } from "@/components/ui/spinner";
import { useCountdown } from "@/hooks/use-countdown";

import { AuthHeading } from "./auth-heading";

const CODE_LENGTH = 6;

/**
 * Step two: the code emailed to them. There's no Verify button; the last digit submits. A wrong
 * code remounts this step (the parent changes its key), so the boxes come back empty.
 */
export function CodeStep({
  email,
  pending,
  error,
  clearError,
  onSubmit,
  resendAt,
  resendPending,
  resendError,
  onResend,
  onBack,
}: {
  email: string;
  pending: boolean;
  error?: string;
  clearError: () => void;
  onSubmit: (code: string) => void;
  /** When Resend unlocks (a timestamp). */
  resendAt: number;
  resendPending: boolean;
  resendError?: string;
  onResend: () => void;
  onBack: () => void;
}) {
  const secondsLeft = useCountdown(resendAt);

  return (
    <div>
      <AuthHeading title="Check your email">
        Enter the code we sent to <span className="font-medium text-fg break-all">{email}</span>
      </AuthHeading>

      <div className="mt-8">
        <CodeInput
          length={CODE_LENGTH}
          label={`${CODE_LENGTH}-digit code`}
          disabled={pending}
          invalid={!!error}
          onEdit={() => error && clearError()}
          onComplete={onSubmit}
        />
        <div className="mt-3 min-h-5 text-center text-13">
          {pending ? (
            <span className="inline-flex items-center gap-2 text-fg-muted">
              <Spinner className="size-3.5" /> Verifying…
            </span>
          ) : error ? (
            <span role="alert" className="text-danger-fg">
              {error}
            </span>
          ) : process.env.NODE_ENV === "development" ? (
            <span className="text-fg-subtle">Dev: the code is printed in the backend logs</span>
          ) : null}
        </div>
      </div>

      {/* Resend and going back share one quiet line. */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-13 text-fg-muted">
        {resendError && (
          <p role="alert" className="mb-1 basis-full text-center text-danger-fg">
            {resendError}
          </p>
        )}
        {secondsLeft > 0 ? (
          <span className="tabular text-fg-subtle">Resend code in {secondsLeft}s</span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={resendPending}
            className="font-medium text-fg underline-offset-4 hover:underline disabled:opacity-50"
          >
            {resendPending ? "Sending…" : "Resend code"}
          </button>
        )}
        <span aria-hidden className="text-fg-subtle">
          ·
        </span>
        <button type="button" onClick={onBack} className="font-medium text-fg underline-offset-4 hover:underline">
          Use a different email
        </button>
      </div>
    </div>
  );
}
