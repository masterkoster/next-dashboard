'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function JoinGroupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const groupId = searchParams.get('groupId');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    if (!token || !groupId) {
      setStatus('error');
      setMessage('Invalid invite link');
      return;
    }

    // Accept the invite (will work for VIEWER without login)
    fetch(`/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          if (data.role === 'VIEWER') {
            setMessage('You can now view this group as a viewer!');
          } else {
            setMessage('You have successfully joined the group!');
          }
        } else if (data.error === 'Please log in to join as a member') {
          // Need to login for MEMBER/ADMIN roles
          setNeedsLogin(true);
          setStatus('error');
          setMessage('This invite requires you to log in to become a member');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to join group');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Failed to join group');
      });
  }, [token, groupId]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p>Joining group...</p>
        </div>
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-2">Login Required</h1>
          <p className="text-slate-400 mb-6">{message}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push(`/login?redirect=/modules/flying-club/groups/${groupId}/join?token=${token}`)}
              className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-medium"
            >
              Log In
            </button>
            <button
              onClick={() => router.push(`/signup?redirect=/modules/flying-club/groups/${groupId}/join?token=${token}`)}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">{status === 'success' ? '✅' : '❌'}</div>
        <h1 className="text-2xl font-bold mb-2">
          {status === 'success' ? 'Welcome!' : 'Oops!'}
        </h1>
        <p className="text-slate-400 mb-6">{message}</p>
        {status === 'success' ? (
          <button
            onClick={() => router.push(`/modules/flying-club/groups/${groupId}`)}
            className="bg-sky-500 hover:bg-sky-600 px-6 py-3 rounded-lg font-medium"
          >
            Go to Group
          </button>
        ) : (
          <button
            onClick={() => router.push('/modules/flying-club')}
            className="bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-medium"
          >
            Back to Flying Club
          </button>
        )}
      </div>
    </div>
  );
}
