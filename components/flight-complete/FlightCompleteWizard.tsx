'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertTriangle, 
  Fuel, 
  Wrench, 
  ChevronRight, 
  ChevronLeft,
  Plane,
  Clock,
  FileText,
  Send,
  X
} from 'lucide-react';

interface FlightCompleteWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flight: {
    id: string;
    aircraftId: string;
    aircraftName: string;
    userId: string;
    userName: string;
    hobbsStart?: number;
    checkoutTime?: string;
  };
  onComplete: (data: FlightCompletionData) => void;
}

export interface FlightCompletionData {
  flightId: string;
  aircraftId: string;
  userId: string;
  wentWell: boolean;
  hobbsStart: number;
  hobbsEnd: number;
  tachTime?: number;
  notes: string;
  // Fuel
  fuelGallons?: number;
  fuelPricePerGallon?: number;
  fuelNotes?: string;
  // Maintenance
  hasIssues: boolean;
  issueType?: 'GENERIC' | 'PLANE_SPECIFIC';
  isPlaneSpecific?: boolean;
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  issueDescription?: string;
}

const MAINTENANCE_CATEGORIES = [
  { value: 'OIL', label: 'Oil', icon: '🛢️', severity: 'MEDIUM' as const },
  { value: 'ENGINE', label: 'Engine', icon: '⚙️', severity: 'HIGH' as const },
  { value: 'AVIONICS', label: 'Avionics', icon: '📡', severity: 'MEDIUM' as const },
  { value: 'AIRFRAME', label: 'Airframe', icon: '✈️', severity: 'MEDIUM' as const },
  { value: 'PROP', label: 'Prop', icon: '🔄', severity: 'HIGH' as const },
  { value: 'ELECTRICAL', label: 'Electrical', icon: '⚡', severity: 'HIGH' as const },
  { value: 'INTERIOR', label: 'Interior', icon: '💺', severity: 'LOW' as const },
];

export function FlightCompleteWizard({ open, onOpenChange, flight, onComplete }: FlightCompleteWizardProps) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 5;
  
  const [data, setData] = useState<FlightCompletionData>({
    flightId: flight.id,
    aircraftId: flight.aircraftId,
    userId: flight.userId,
    wentWell: true,
    hasIssues: false,
    hobbsStart: flight.hobbsStart || 0,
    hobbsEnd: flight.hobbsStart || 0,
    notes: '',
  });

  const showSummaryStep = !data.hasIssues && step === 5;

  const handleNext = () => {
    // If going from step 4 (issues) and no issues, skip to summary (step 5)
    if (step === 4 && !data.hasIssues) {
      setStep(5); // Go to summary
    } else if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onComplete(data);
      onOpenChange(false);
      setStep(1);
      setData({
        flightId: flight.id,
        aircraftId: flight.aircraftId,
        userId: flight.userId,
        wentWell: true,
        hasIssues: false,
        hobbsStart: flight.hobbsStart || 0,
        hobbsEnd: flight.hobbsStart || 0,
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting flight:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Review
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">How did the flight go?</h3>
              <p className="text-muted-foreground">Let us know about your experience</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setData({ ...data, wentWell: true })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  data.wentWell 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-border hover:border-green-500/50'
                }`}
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <div className="font-semibold">Everything went well</div>
                <p className="text-sm text-muted-foreground mt-1">Normal flight, no issues</p>
              </button>
              <button
                onClick={() => setData({ ...data, wentWell: false })}
                className={`p-6 rounded-xl border-2 transition-all ${
                  !data.wentWell 
                    ? 'border-amber-500 bg-amber-500/10' 
                    : 'border-border hover:border-amber-500/50'
                }`}
              >
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <div className="font-semibold">Had some issues</div>
                <p className="text-sm text-muted-foreground mt-1">Report any problems</p>
              </button>
            </div>
          </div>
        );

      case 2: // Details
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Flight Details</h3>
              <p className="text-muted-foreground">Verify and update flight information</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{flight.aircraftName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hobbs Start</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={data.hobbsStart}
                    onChange={(e) => setData({ ...data, hobbsStart: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Hobbs End</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={data.hobbsEnd}
                    onChange={(e) => setData({ ...data, hobbsEnd: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Tach Time (optional)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={data.tachTime || ''}
                  onChange={(e) => setData({ ...data, tachTime: parseFloat(e.target.value) || undefined })}
                  placeholder="Tach time"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="Any notes about the flight..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3: // Fuel
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Fuel Added</h3>
              <p className="text-muted-foreground">Submit fuel expenses for reimbursement (requires admin approval)</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Gallons Added</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={data.fuelGallons || ''}
                  onChange={(e) => setData({ ...data, fuelGallons: parseFloat(e.target.value) || undefined })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label>Price per Gallon ($)</Label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={data.fuelPricePerGallon || ''}
                  onChange={(e) => setData({ ...data, fuelPricePerGallon: parseFloat(e.target.value) || undefined })}
                  placeholder="0.00"
                />
              </div>
              {data.fuelGallons && data.fuelPricePerGallon && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Estimated Total</div>
                  <div className="text-2xl font-bold">${(data.fuelGallons * data.fuelPricePerGallon).toFixed(2)}</div>
                </div>
              )}
              <div>
                <Label>Notes (optional)</Label>
                <Input 
                  value={data.fuelNotes || ''}
                  onChange={(e) => setData({ ...data, fuelNotes: e.target.value })}
                  placeholder="Fuel type, location, etc."
                />
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Fuel expenses will be submitted for admin approval
              </p>
            </div>
          </div>
        );

      case 4: // Issues
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Any Aircraft Issues?</h3>
              <p className="text-muted-foreground">Did you notice any problems with the aircraft?</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setData({ ...data, hasIssues: false });
                  handleNext();
                }}
                className="p-6 rounded-xl border-2 border-border hover:border-green-500/50 transition-all"
              >
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <div className="font-semibold">No issues</div>
                <p className="text-sm text-muted-foreground mt-1">Aircraft is good to go</p>
              </button>
              <button
                onClick={() => setData({ ...data, hasIssues: true })}
                className="p-6 rounded-xl border-2 border-border hover:border-amber-500/50 transition-all"
              >
                <Wrench className="h-12 w-12 mx-auto mb-3 text-amber-500" />
                <div className="font-semibold">Yes, report issue</div>
                <p className="text-sm text-muted-foreground mt-1">Document any problems</p>
              </button>
            </div>
          </div>
        );

      case 5: // Issue Type
        if (!data.hasIssues) {
          // Skip to submit
          return null;
        }
        return (
          <div className="space-y-3">
            <div className="text-center pb-1">
              <h3 className="text-lg font-semibold">What type of issue?</h3>
              <p className="text-sm text-muted-foreground">Select category</p>
            </div>
            <ScrollArea className="h-[200px] pr-2">
              <div className="grid grid-cols-2 gap-2">
                {MAINTENANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setData({ 
                      ...data, 
                      issueType: 'GENERIC', 
                      category: cat.value,
                      severity: cat.severity,
                      isPlaneSpecific: false
                    })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      data.category === cat.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="font-medium text-sm">{cat.label}</div>
                    <Badge variant={cat.severity === 'HIGH' ? 'destructive' : cat.severity === 'MEDIUM' ? 'default' : 'secondary'} className="mt-1 text-[10px]">
                      {cat.severity}
                    </Badge>
                  </button>
                ))}
                <button
                  onClick={() => setData({ 
                    ...data, 
                    issueType: 'PLANE_SPECIFIC', 
                    category: 'OTHER',
                    severity: 'MEDIUM',
                    isPlaneSpecific: true
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    data.category === 'OTHER'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-lg mb-1">📝</div>
                  <div className="font-medium text-sm">Other</div>
                  <Badge variant="outline" className="mt-1 text-[10px]">Specific</Badge>
                </button>
              </div>
              {data.category && (
                <div className="mt-3">
                  <Label className="text-xs">Description</Label>
                  <Textarea 
                    value={data.issueDescription || ''}
                    onChange={(e) => setData({ ...data, issueDescription: e.target.value })}
                    placeholder="Describe the issue..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              )}
            </ScrollArea>
          </div>
        );

      case 5: // Issue Type or Summary
        if (!data.hasIssues) {
          // Show summary and submit
          return (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="text-lg font-semibold">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">Verify and submit</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Flight</span>
                  <Badge variant={data.wentWell ? 'default' : 'destructive'}>
                    {data.wentWell ? 'Good' : 'Issues'}
                  </Badge>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Hobbs</span>
                  <span>{data.hobbsStart} - {data.hobbsEnd} ({(data.hobbsEnd - data.hobbsStart).toFixed(1)}h)</span>
                </div>
                {data.fuelGallons && (
                  <div className="flex justify-between p-2 rounded bg-muted">
                    <span className="text-muted-foreground">Fuel</span>
                    <span>{data.fuelGallons} gal</span>
                  </div>
                )}
                <div className="flex justify-between p-2 rounded bg-muted">
                  <span className="text-muted-foreground">Issues</span>
                  <Badge variant="secondary">None</Badge>
                </div>
              </div>
            </div>
          );
        }

        // Has issues - show issue type selection
        return (
          <div className="space-y-3">
            <div className="text-center pb-1">
              <h3 className="text-lg font-semibold">What type of issue?</h3>
              <p className="text-sm text-muted-foreground">Select category</p>
            </div>
            <ScrollArea className="h-[180px] pr-2">
              <div className="grid grid-cols-2 gap-2">
                {MAINTENANCE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setData({ 
                      ...data, 
                      issueType: 'GENERIC', 
                      category: cat.value,
                      severity: cat.severity,
                      isPlaneSpecific: false
                    })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      data.category === cat.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{cat.icon}</div>
                    <div className="font-medium text-sm">{cat.label}</div>
                    <Badge variant={cat.severity === 'HIGH' ? 'destructive' : cat.severity === 'MEDIUM' ? 'default' : 'secondary'} className="mt-1 text-[10px]">
                      {cat.severity}
                    </Badge>
                  </button>
                ))}
                <button
                  onClick={() => setData({ 
                    ...data, 
                    issueType: 'PLANE_SPECIFIC', 
                    category: 'OTHER',
                    severity: 'MEDIUM',
                    isPlaneSpecific: true
                  })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    data.category === 'OTHER'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-lg mb-1">📝</div>
                  <div className="font-medium text-sm">Other</div>
                  <Badge variant="outline" className="mt-1 text-[10px]">Specific</Badge>
                </button>
              </div>
              {data.category && (
                <div className="mt-3">
                  <Label className="text-xs">Description</Label>
                  <Textarea 
                    value={data.issueDescription || ''}
                    onChange={(e) => setData({ ...data, issueDescription: e.target.value })}
                    placeholder="Describe the issue..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              )}
            </ScrollArea>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="text-lg">Complete Flight</DialogTitle>
          <DialogDescription className="text-xs">
            Step {showSummaryStep ? '5 (Summary)' : step} of {totalSteps}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress */}
        <div className="flex gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-1 flex-1 rounded ${
                s <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-2 border-t shrink-0">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          
          {step < 5 ? (
            <Button size="sm" onClick={handleNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={handleSubmit} 
              disabled={submitting || (data.hasIssues && !data.category)}
            >
              {submitting ? '...' : 'Submit'} <Send className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
