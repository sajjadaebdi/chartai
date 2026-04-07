import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: April 2026</p>

        <section className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
          <p>
            This platform provides AI-generated market analysis for educational and informational use only.
            Nothing on this platform constitutes financial, investment, legal, tax, or other professional
            advice.
          </p>
          <p>
            You acknowledge and agree that all outputs are probabilistic model estimates and may be incomplete,
            delayed, or inaccurate. No representation or warranty is made regarding correctness, reliability,
            profitability, or fitness for a particular purpose.
          </p>
          <p>
            You are solely responsible for your decisions, actions, and outcomes, including any trades or
            financial losses. You agree not to rely on this platform as the sole basis for any investment
            activity.
          </p>
          <p>
            To the maximum extent permitted by applicable law, the platform owners, operators, and affiliates
            disclaim all liability for direct, indirect, incidental, consequential, special, exemplary, or
            punitive damages arising from use of the platform.
          </p>
          <p>
            By using this platform, you confirm that you are at least 18 years old and legally permitted to use
            these services in your jurisdiction.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
            Back to Analyzer
          </Link>
          <Link href="/privacy" className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
