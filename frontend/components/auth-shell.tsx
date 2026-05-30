import Link from "next/link";

import { cn } from "@/lib/utils";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  altLabel: string;
  altHref: string;
  altAction: string;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  altLabel,
  altHref,
  altAction
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.2),transparent_30%),linear-gradient(180deg,#0b1120_0%,#122a63_55%,#f7fbff_55%,#f7fbff_100%)]" />
      <div className="absolute left-[-8rem] top-14 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute right-[-6rem] top-32 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-8 lg:py-10">
        <section className="glass-dark flex flex-col justify-between rounded-[36px] p-6 sm:p-8 lg:min-h-[760px]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div>
                <p className="text-3xl font-semibold tracking-tight">DormFix</p>
                <p className="text-sm text-blue-100/75">Hostel Complaint Management</p>
              </div>
            </Link>

            <div className="mt-16 max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200/75">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-blue-100/80">{description}</p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["Fast filing", "File room complaints in under a minute."],
                ["Live tracking", "See every status handoff with evidence."],
                ["Auth based", "Student, warden, and department access stay separate."]
              ].map(([heading, copy]) => (
                <div key={heading} className="glass-chip rounded-[24px] p-4">
                  <p className="font-semibold text-white">{heading}</p>
                  <p className="mt-2 text-sm leading-6 text-blue-100/75">{copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-dark mt-10 rounded-[30px] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-fuchsia-400 via-violet-400 to-indigo-500 text-xl font-semibold shadow-lg">
                S
              </div>
              <div className="flex-1">
                <p className="text-xl font-semibold text-white">Sneha Reddy</p>
                <p className="text-sm text-blue-100/80">Student preview • Sapphire Hostel</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="glass-chip rounded-full px-3 py-1 text-xs text-blue-100">4 active complaints</span>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-400/15 px-3 py-1 text-xs text-emerald-100">healthy SLA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 flex items-center lg:mt-0">
          <div className={cn("glass-panel w-full rounded-[36px] p-6 text-slate-950 sm:p-8")}>
            {children}
            <p className="mt-8 text-center text-sm text-slate-500">
              {altLabel}{" "}
              <Link href={altHref} className="font-semibold text-blue-600 hover:text-blue-700">
                {altAction}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
