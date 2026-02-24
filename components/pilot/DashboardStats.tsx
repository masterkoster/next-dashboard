'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Clock, Sun, Cloud, DollarSign, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  userId?: string;
}

interface DashboardData {
  user?: {
    name?: string;
    email?: string;
    credits?: number;
  };
  totals: {
    totalTime: number;
    soloTime: number;
    nightTime: number;
    instrumentTime: number;
    crossCountryTime: number;
  };
  recentFlights: any[];
  activeFlight: any;
  currency: any;
  clubs: any[];
}

export default function DashboardStats({ userId }: DashboardStatsProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/me/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading dashboard...
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const credits = data.user?.credits ?? 0;

  return (
    <div className="space-y-4">
      {/* Time Totals */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Flight Time Totals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{data.totals.totalTime.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Total Hours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{data.totals.soloTime.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Solo</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{data.totals.nightTime.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Night</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">{data.totals.instrumentTime.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Instrument</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{data.totals.crossCountryTime.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">XC</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xl font-bold">{data.recentFlights.length}</p>
                <p className="text-xs text-muted-foreground">Recent Flights</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-xl font-bold">{data.clubs.length}</p>
                <p className="text-xs text-muted-foreground">Member Clubs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xl font-bold">
                  {data.currency.vfrDay?.current ? 'Current' : 'Due'}
                </p>
                <p className="text-xs text-muted-foreground">VFR Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-xl font-bold">
                  {data.currency.vfrNight?.current ? 'Current' : 'Due'}
                </p>
                <p className="text-xs text-muted-foreground">VFR Night</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Flight Alert */}
      {data.activeFlight && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Aircraft Checked Out</p>
                  <p className="text-sm text-muted-foreground">
                    {data.activeFlight.aircraft} - Hobbs: {data.activeFlight.hobbsStart}
                  </p>
                </div>
              </div>
              <a href="#checkout" className="text-sm text-green-600 hover:underline">
                Check In →
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Credits */}
      {credits > 0 && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium">Account Credit</p>
                <p className="text-sm text-muted-foreground">
                  ${credits} available
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
