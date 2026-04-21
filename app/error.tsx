"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto flex max-w-3xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="surface-panel w-full p-8 text-center sm:p-12">
        <p className="eyebrow justify-center">Something Broke</p>
        <h1 className="mt-6 font-display text-[2.4rem] leading-tight text-ink sm:text-5xl">
          The workspace hit an unexpected interruption.
        </h1>
        <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">
          Refresh the route or return to the homepage. The layout and content are
          still intact; this error boundary is here to keep the experience
          recoverable.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="cta-primary w-full sm:w-auto" onClick={reset} type="button">
            Try again
          </button>
          <Link className="cta-secondary w-full sm:w-auto" href="/">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
