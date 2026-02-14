import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

async function getUserGroups() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return [];

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      memberships: {
        include: {
          group: true,
        },
      },
    },
  });

  return user?.memberships || [];
}

export default async function FlyingClubPage() {
  const memberships = await getUserGroups();
  const groups = memberships.map((m: any) => m.group);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-sky-400">Flying Club</h1>
            <p className="text-slate-400 mt-1">Manage your flying groups, bookings, and flight logs</p>
          </div>
          <Link
            href="/modules/flying-club/groups/new"
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Create Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <div className="text-6xl mb-4">🛩️</div>
            <h2 className="text-2xl font-semibold mb-2">No Flying Groups Yet</h2>
            <p className="text-slate-400 mb-6">
              Create a flying club to share aircraft with friends, track bookings, and log flights together.
            </p>
            <Link
              href="/modules/flying-club/groups/new"
              className="inline-block bg-sky-500 hover:bg-sky-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Group
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any) => (
              <Link
                key={group.id}
                href={`/modules/flying-club/groups/${group.id}`}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-sky-500 transition-all hover:shadow-lg hover:shadow-sky-500/10 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center text-2xl">
                    🛩️
                  </div>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                    Active
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-sky-400 transition-colors">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}
                <div className="flex gap-4 text-sm text-slate-500">
                  {group.dryRate && (
                    <span>Dry: ${Number(group.dryRate).toFixed(0)}/hr</span>
                  )}
                  {group.wetRate && (
                    <span>Wet: ${Number(group.wetRate).toFixed(0)}/hr</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-2">Create a Group</h3>
              <p className="text-slate-400 text-sm">
                Start a flying club, set hourly rates, and invite members to join.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-3xl mb-3">📅</div>
              <h3 className="font-semibold mb-2">Book Aircraft</h3>
              <p className="text-slate-400 text-sm">
                Members can book aircraft for specific dates and times using the calendar.
              </p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="font-semibold mb-2">Log Flights</h3>
              <p className="text-slate-400 text-sm">
                Record tach and hobbs time. Costs are calculated automatically based on rates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
