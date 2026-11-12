"use client";

import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { CodeStep } from "@/components/auth/code-step";
import { EmailStep } from "@/components/auth/email-step";
import { GoogleButton } from "@/components/auth/google-button";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api/endpoints";
import { LAST_SIGN_IN } from "@/lib/auth/last-sign-in";
import { safeNext } from "@/lib/auth/safe-next";
import { useSession, useSignIn } from "@/lib/auth/use-session";
import { useLocalValue } from "@/lib/local-prefs";
import { EASE_OUT } from "@/lib/motion";

/** How long before a code can be sent again. */
const RESEND_SECONDS = 60;

const stepMotion = {
  initial: { opacity: 0, filter: "blur(4px)", transform: "translateY(6px)" },
  animate: { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
  exit: { opacity: 0, filter: "blur(4px)", transform: "translateY(-4px)", transition: { duration: 0.12 } },
  transition: { duration: 0.22, ease: EASE_OUT },
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <AuthShell>
          <div className="grid h-80 place-items-center">
            <Spinner className="text-fg-subtle" />
          </div>
        </AuthShell>
      }
    >
      <SignIn />
    </Suspense>
  );
}

/** Email, then the emailed code; or Google. `?next=` is where to go afterwards. */
function SignIn() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { hydrated, isAuthenticated } = useSession();
  const signIn = useSignIn();
  const [, setLastSignIn] = useLocalValue(LAST_SIGN_IN);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  // Bumped on a wrong code: remounts the code step, so the boxes come back empty and focused.
  const [attempt, setAttempt] = useState(0);

  // Already signed in (e.g. another tab): go straight on.
  useEffect(() => {
    if (hydrated && isAuthenticated && !redirecting) router.replace(next);
  }, [hydrated, isAuthenticated, next, router, redirecting]);

  const start = useMutation({
    mutationFn: (e: string) => authApi.emailStart(e),
    meta: { errorToast: false },
    onSuccess: () => {
      setStep("code");
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
    },
  });

  const verify = useMutation({
    mutationFn: (code: string) => authApi.emailVerify(email, code),
    meta: { errorToast: false },
    onError: () => setAttempt((a) => a + 1),
    onSuccess: (auth) => {
      setRedirecting(true);
      setLastSignIn("email");
      signIn(auth);
      router.replace(next);
    },
  });

  return (
    <AuthShell
      footer={
        // Google is a way in, not a way around the code: it goes once a code is on its way.
        <AnimatePresence initial={false}>
          {step === "email" && (
            <motion.div key="google" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
              <GoogleButton />
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {step === "email" ? (
          <motion.div key="email" {...stepMotion}>
            <EmailStep
              email={email}
              setEmail={setEmail}
              pending={start.isPending}
              error={start.error?.message}
              onSubmit={() => start.mutate(email.trim())}
              clearError={() => start.reset()}
            />
          </motion.div>
        ) : (
          <motion.div key="code" {...stepMotion}>
            <CodeStep
              key={attempt}
              email={email}
              pending={verify.isPending || redirecting}
              error={verify.error?.message}
              clearError={() => verify.reset()}
              onSubmit={(code) => verify.mutate(code)}
              resendAt={resendAt}
              resendPending={start.isPending}
              resendError={start.error?.message}
              onResend={() => start.mutate(email.trim())}
              onBack={() => {
                verify.reset();
                start.reset();
                setStep("email");
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
