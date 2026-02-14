'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dryRate: '',
    wetRate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dryRate: formData.dryRate ? parseFloat(formData.dryRate) : null,
          wetRate: formData.wetRate ? parseFloat(formData.wetRate) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create group');
      }

      const group = await response.json();
      router.push(`/modules/flying-club/groups/${group.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white mb-6 flex items-center gap-2"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-sky-400 mb-2">Create Flying Group</h1>
        <p className="text-slate-400 mb-8">
          Start a new flying club to share aircraft with friends and track usage.
        </p>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                placeholder="e.g., Bay Area Flying Club"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 h-24 resize-none"
                placeholder="What's your club about?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dry Rate ($/hr)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dryRate}
                  onChange={(e) => setFormData({ ...formData, dryRate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  placeholder="e.g., 150.00"
                />
                <p className="text-xs text-slate-500 mt-1">Aircraft only (no fuel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wet Rate ($/hr)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.wetRate}
                  onChange={(e) => setFormData({ ...formData, wetRate: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
                  placeholder="e.g., 200.00"
                />
                <p className="text-xs text-slate-500 mt-1">Aircraft + fuel</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
