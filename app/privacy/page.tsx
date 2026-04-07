import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 md:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Legal</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: April 2026</p>

        <section className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
          <p>
            We process user-provided chart images, optional symbols, and generated analysis outputs to deliver the
            platform service. This service is for educational use only and does not provide financial advice.
          </p>
          <p>
            AI-generated outputs are model-based and may be inaccurate. You are solely responsible for any decisions
            you make from information shown on this platform.
          </p>
          <p>
            Local analysis history may be stored in your browser storage for product functionality. You can clear
            this data within the app at any time.
          </p>
          <p>
            We may use third-party providers (for example, model APIs and market data services) to process requests.
            By using this platform, you consent to such processing as needed to provide the service.
          </p>
          <p>
            To the fullest extent permitted by law, we disclaim liability for losses or damages resulting from your
            use of this platform or reliance on AI-generated content.
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/" className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50">
            Back to Analyzer
          </Link>
          <Link href="/terms" className="rounded-xl bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </main>
  );
}
