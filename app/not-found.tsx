import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="surface-panel w-full p-8 text-center sm:p-12">
        <p className="eyebrow justify-center">Not Found</p>
        <h1 className="mt-6 font-display text-[2.4rem] leading-tight text-ink sm:text-5xl">
          This page is outside the record.
        </h1>
        <p className="mt-5 text-base leading-7 text-ink-soft sm:text-lg">
          The route you requested does not exist in this build. Head back to the
          homepage to continue using the upload workflow.
        </p>
        <div className="mt-8 flex justify-center">
          <Link className="cta-primary w-full sm:w-auto" href="/">
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
