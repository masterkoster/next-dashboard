export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <p className="text-slate-300">
            This is an early product. Features may change. Use at your own discretion and always verify flight planning
            outputs.
          </p>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Acceptable Use</h2>
            <p className="text-slate-300">
              Do not use messaging to harass others, share illegal content, or attempt to bypass safety systems.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Accounts</h2>
            <p className="text-slate-300">
              You are responsible for activity on your account and keeping your credentials secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
