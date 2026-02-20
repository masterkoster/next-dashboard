export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <p className="text-slate-300">
            We build this dashboard for pilots. We aim to collect the minimum data needed to operate the service.
          </p>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Messaging (End-to-End Encryption)</h2>
            <p className="text-slate-300">
              Messages are encrypted on your device before they reach our servers. We store only encrypted message data
              and cannot read message contents.
            </p>
            <p className="text-slate-400 text-sm">
              If you choose to report a message, you can include the content so moderators can review it. Reported
              content is handled separately and retained only as needed for safety and enforcement.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Data We Store</h2>
            <p className="text-slate-300">
              Account data (username/email), your flight plans, and any content you create in modules you use.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Your Rights</h2>
            <p className="text-slate-300">
              You can access, correct, export, or delete your account data. You can delete your account from your
              Profile page.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">Contact</h2>
            <p className="text-slate-300">
              For privacy requests, contact support via the in-app error report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
