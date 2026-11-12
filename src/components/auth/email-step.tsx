"use client";

import { motion } from "motion/react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { validateEmail } from "@/lib/utils/format";
import { EASE_OUT } from "@/lib/motion";

import { AuthHeading } from "./auth-heading";

/** Step one: the email to send a code to. New emails get an account, so there's no separate sign-up. */
export function EmailStep({
  email,
  setEmail,
  pending,
  error,
  onSubmit,
  clearError,
}: {
  email: string;
  setEmail: (v: string) => void;
  pending: boolean;
  error?: string;
  onSubmit: () => void;
  clearError: () => void;
}) {
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || validateEmail(email)) {
      setLocalError("Enter a valid email address");
      return;
    }
    onSubmit();
  };

  const shownError = localError ?? error;
  // Continue appears once the email reaches its domain's dot ("you@company."); Enter works before that.
  const ready = /@[^@\s]+\./.test(email) || pending;

  return (
    <div>
      <AuthHeading title="Welcome to Wage3">Log in or sign up to get started.</AuthHeading>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-4">
        {/* No visible label: the placeholder and aria-label name it. */}
        <Field htmlFor="email" error={shownError}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            aria-label="Email"
            placeholder="Email address"
            className="h-12 rounded-full border-transparent bg-(--color-400) px-5 font-medium hover:border-transparent"
            value={email}
            invalid={!!shownError}
            onChange={(e) => {
              setEmail(e.target.value);
              setLocalError(null);
              if (error) clearError();
            }}
          />
        </Field>
        {/* One slot for the note and the button: the note lifts away as Continue springs up into its place. */}
        <div className="relative h-12">
          <motion.p
            initial={false}
            animate={ready ? { opacity: 0, transform: "translateY(-6px)" } : { opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.16, ease: EASE_OUT }}
            aria-hidden={ready}
            className="pointer-events-none absolute inset-0 grid place-items-center text-center text-13 text-fg-subtle"
          >
            We&apos;ll sign you up if you don&apos;t have an account yet.
          </motion.p>
          <motion.div
            initial={false}
            animate={ready ? { opacity: 1, transform: "translateY(0px)" } : { opacity: 0, transform: "translateY(16px)" }}
            transition={ready ? { type: "spring", duration: 0.5, bounce: 0.4 } : { duration: 0.14 }}
            aria-hidden={!ready}
            className={cn("absolute inset-0", !ready && "pointer-events-none")}
          >
            <Button type="submit" variant="inverse" size="lg" className="w-full" loading={pending} tabIndex={ready ? 0 : -1}>
              Continue
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
