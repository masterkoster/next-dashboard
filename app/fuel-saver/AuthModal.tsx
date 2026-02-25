'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'save' | 'load' | 'export';
  onConfirm?: () => void;
}

export default function AuthModal({ isOpen, onClose, action, onConfirm }: AuthModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mode, setMode] = useState<'select' | 'confirm'>('select');

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode('select');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAccount = () => {
    onClose();
    router.push('/signup');
  };

  const handleContinue = () => {
    if (onConfirm) {
      onConfirm();
    }
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
          {action === 'save' ? '💾' : action === 'load' ? '📂' : '📤'}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white text-center mb-2">
          {action === 'save' ? 'Save requires an account' : 
           action === 'load' ? 'Load requires an account' : 
           'Export requires an account'}
        </h3>

        {/* Description */}
        <p className="text-slate-400 text-center mb-6">
          Create one to save your plans and access from any device. 
          Or continue without an account (saved locally only).
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreateAccount}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            Create Free Account
          </button>
          
          <button
            onClick={handleContinue}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition"
          >
            Continue Without Account
          </button>
          
          <button
            onClick={onClose}
            className="w-full text-slate-500 hover:text-white text-sm py-2 transition"
          >
            Cancel
          </button>
        </div>

        {/* Already have account */}
        {status !== 'authenticated' && (
          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <button 
              onClick={() => { onClose(); signIn(); }}
              className="text-sky-400 hover:underline"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
