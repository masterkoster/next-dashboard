'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Play, CreditCard, Send } from 'lucide-react';

interface BillingRunButtonProps {
  groupId: string;
  clubName?: string;
}

export default function BillingRunButton({ groupId, clubName }: BillingRunButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleRunBilling = async () => {
    if (!confirm(`Run billing cycle for ${clubName || 'this club'}?`)) return;
    
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/clubs/${groupId}/billing/run`, {
        method: 'POST',
      });

      const data = await res.json();
      
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Billing failed');
      }
    } catch (err) {
      console.error('Billing failed:', err);
      alert('Billing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Billing Management
        </CardTitle>
        <CardDescription>
          Run monthly billing to charge members for flight time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleRunBilling} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>Processing...</>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Monthly Billing
            </>
          )}
        </Button>

        {result && (
          <div className="p-4 rounded-lg bg-muted">
            <h4 className="font-medium mb-2">Billing Complete</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Members Billed:</span>
                <span className="ml-2 font-medium">{result.summary.totalMembers}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Successful:</span>
                <span className="ml-2 font-medium text-green-600">{result.summary.successful}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Failed:</span>
                <span className="ml-2 font-medium text-red-600">{result.summary.failed}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-2 font-medium">${result.summary.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {result.results?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="text-sm font-medium mb-2">Results:</h5>
                <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                  {result.results.map((r: any, i: number) => (
                    <div key={i} className="flex justify-between">
                      <span>{r.name} ({r.email})</span>
                      <span className={r.success ? 'text-green-600' : 'text-red-600'}>
                        {r.success ? `$${r.amount.toFixed(2)}` : r.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
