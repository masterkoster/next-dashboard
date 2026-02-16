'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  title = 'Upgrade to Pro',
  message = 'You\'ve reached the free tier limit. Upgrade to Pro to unlock unlimited features!',
  feature
}: UpgradeModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    // Redirect to billing/upgrade page
    router.push('/billing?upgrade=true');
    onClose();
  };

  const handleContinueFree = () => {
    // User chooses to continue with free tier limits
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-700">
        {/* Icon */}
        <div className="text-4xl text-center mb-4">
          🚀
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {title}
        </h3>

        {/* Feature-specific message */}
        {feature && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-400 text-sm text-center">
              <span className="font-semibold">{feature}</span> is available on Pro
            </p>
          </div>
        )}

        {/* Description */}
        <p className="text-slate-400 text-center mb-6">
          {message}
        </p>

        {/* Pricing */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">$3.99</div>
            <div className="text-xs text-slate-400">per month</div>
          </div>
          <div className="flex-1 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-lg p-3 text-center border border-emerald-500/30">
            <div className="text-2xl font-bold text-emerald-400">$39.99</div>
            <div className="text-xs text-emerald-300">per year</div>
            <div className="text-[10px] text-emerald-300">Save 17%</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            {loading ? 'Redirecting...' : 'Upgrade to Pro'}
          </button>
          
          <button
            onClick={handleContinueFree}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            Continue with Free
          </button>
        </div>

        {/* Features list */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 mb-2 text-center">Pro includes:</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
            <div className="flex items-center gap-1">✓ Unlimited flight plans</div>
            <div className="flex items-center gap-1">✓ Unlimited waypoints</div>
            <div className="flex items-center gap-1">✓ Multiple clubs</div>
            <div className="flex items-center gap-1">✓ Document storage</div>
            <div className="flex items-center gap-1">✓ All US fuel prices</div>
            <div className="flex items-center gap-1">✓ Export toForeFlight</div>
          </div>
        </div>
      </div>
    </div>
  );
}
