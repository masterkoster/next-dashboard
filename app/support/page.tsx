'use client';

import { useState } from 'react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to an API
    console.log('Support request:', form);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Support</h1>

        {submitted ? (
          <div className="bg-emerald-500/20 border border-emerald-500 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-emerald-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">Message Sent!</h2>
            <p className="text-slate-400 mb-4">We'll get back to you as soon as possible.</p>
            <button onClick={() => setSubmitted(false)} className="text-sky-400 hover:text-sky-300">
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Subject</label>
              <select
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                <option value="">Select a topic...</option>
                <option value="general">General Question</option>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="account">Account Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white resize-none"
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded-lg font-medium transition-colors">
              Send Message
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>You can also email us at support@aviationdash.com</p>
        </div>
      </div>
    </div>
  );
}
