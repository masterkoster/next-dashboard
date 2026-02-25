import { FlightScheduler } from "@/components/scheduler/FlightScheduler";

export default function SchedulerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Flight Scheduler</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Schedule personal or flying club flights. The scheduler will route your booking to the correct system.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <FlightScheduler />
        </div>
      </div>
    </div>
  );
}
