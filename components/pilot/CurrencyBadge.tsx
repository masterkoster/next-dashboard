'use client';

import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface CurrencyStatus {
  current: boolean;
  landings?: number;
  required?: number;
  daysRemaining?: number;
  expiresAt?: string;
  description?: string;
}

interface CurrencyBadgeProps {
  type: 'vfrDay' | 'vfrNight' | 'bfr' | 'medical';
  status: CurrencyStatus;
  size?: 'sm' | 'md';
}

export default function CurrencyBadge({ type, status, size = 'md' }: CurrencyBadgeProps) {
  const getConfig = () => {
    switch (type) {
      case 'vfrDay':
        return {
          label: 'VFR Day',
          icon: <Clock className="h-3 w-3" />,
          color: status.current ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
      case 'vfrNight':
        return {
          label: 'VFR Night',
          icon: <Clock className="h-3 w-3" />,
          color: status.current ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
      case 'bfr':
        return {
          label: 'BFR',
          icon: <Clock className="h-3 w-3" />,
          color: status.current 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : status.daysRemaining && status.daysRemaining <= 14
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        };
      case 'medical':
        return {
          label: 'Medical',
          icon: <Clock className="h-3 w-3" />,
          color: status.current 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : status.daysRemaining && status.daysRemaining <= 7
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        };
      default:
        return { label: type, icon: null, color: 'bg-gray-100' };
    }
  };

  const config = getConfig();

  const getStatusText = () => {
    if (type === 'vfrDay' || type === 'vfrNight') {
      return `${status.landings || 0}/${status.required || 3}`;
    }
    if (status.daysRemaining !== undefined) {
      return `${status.daysRemaining}d`;
    }
    return status.current ? 'Current' : 'Expired';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.color} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      {config.icon}
      <span className="font-medium">{config.label}:</span>
      <span>{getStatusText()}</span>
      {!status.current && status.daysRemaining !== undefined && status.daysRemaining <= 60 && (
        <AlertCircle className="h-3 w-3 ml-1" />
      )}
    </div>
  );
}

// Dashboard widget showing all currency statuses
interface CurrencyWidgetProps {
  currency: {
    vfrDay: any;
    vfrNight: any;
    bfr: any;
    medical: any;
  };
}

export function CurrencyWidget({ currency }: CurrencyWidgetProps) {
  const allCurrent = 
    currency.vfrDay?.current &&
    currency.vfrNight?.current &&
    (currency.bfr?.current !== false) &&
    (currency.medical?.current !== false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Currency Status</h3>
        {allCurrent ? (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Current
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Attention Needed
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {currency.vfrDay && (
          <CurrencyBadge type="vfrDay" status={currency.vfrDay} size="sm" />
        )}
        {currency.vfrNight && (
          <CurrencyBadge type="vfrNight" status={currency.vfrNight} size="sm" />
        )}
        {currency.bfr && (
          <CurrencyBadge type="bfr" status={currency.bfr} size="sm" />
        )}
        {currency.medical && (
          <CurrencyBadge type="medical" status={currency.medical} size="sm" />
        )}
      </div>
    </div>
  );
}
