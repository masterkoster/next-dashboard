'use client';

import { useEffect, useState } from 'react';

interface ErrorReport {
  id: string;
  userId: string | null;
  email: string | null;
  title: string;
  description: string;
  stepsToReproduce: string | null;
  url: string | null;
  browser: string | null;
  status: string;
  resolution: string | null;
  createdAt: string;
  userEmail: string | null;
  userName: string | null;
}

export default function AdminErrorsPage() {
  const [reports, setReports] = useState<ErrorReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('open');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (filter !== 'all') params.set('status', filter);

      const res = await fetch(`/api/admin/error-reports?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch');
      }
      const data = await res.json();
      setReports(data.reports);
      setStatusCounts(data.statusCounts);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter, page]);

  // Update report status
  const updateStatus = async (reportId: string, status: string, resolution?: string) => {
    try {
      const res = await fetch('/api/admin/error-reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status, resolution }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchReports();
      if (selectedReport?.id === reportId) {
        setSelectedReport({ ...selectedReport, status, resolution: resolution || null });
      }
    } catch (err) {
      alert('Failed to update report');
    }
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-red-400 font-semibold mb-2">Access Denied</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  const filters = ['open', 'in_progress', 'resolved', 'closed'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Error Reports</h1>

      {/* Status Tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f === 'open' && '🔴 '}
            {f === 'in_progress' && '🟡 '}
            {f === 'resolved' && '🟢 '}
            {f === 'closed' && '⚫ '}
            {f.replace('_', ' ').toUpperCase()}
            {statusCounts[f] !== undefined && ` (${statusCounts[f]})`}
          </button>
        ))}
        <button
          onClick={() => { setFilter('all'); setPage(1); }}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          ALL
        </button>
      </div>

      {/* Reports List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No error reports found</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-slate-800/30 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        report.status === 'open' ? 'bg-red-500' :
                        report.status === 'in_progress' ? 'bg-yellow-500' :
                        report.status === 'resolved' ? 'bg-green-500' : 'bg-slate-500'
                      }`} />
                      <span className="text-white font-medium">{report.title}</span>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{report.description}</p>
                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                      {report.userEmail && <span>User: {report.userEmail}</span>}
                      {report.email && !report.userEmail && <span>Email: {report.email}</span>}
                      <span>{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    report.status === 'open' ? 'bg-red-500/20 text-red-400' :
                    report.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-slate-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1 text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white">Error Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Status</label>
                  <div className="flex gap-2 mt-1">
                    {['open', 'in_progress', 'resolved', 'closed'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selectedReport.id, s)}
                        className={`px-3 py-1 rounded text-sm ${
                          selectedReport.status === s
                            ? s === 'open' ? 'bg-red-500 text-white' :
                              s === 'in_progress' ? 'bg-yellow-500 text-white' :
                              s === 'resolved' ? 'bg-green-500 text-white' :
                              'bg-slate-500 text-white'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Title</label>
                  <div className="text-white">{selectedReport.title}</div>
                </div>

                <div>
                  <label className="text-sm text-slate-400">Description</label>
                  <div className="text-white whitespace-pre-wrap bg-slate-800 p-3 rounded mt-1">
                    {selectedReport.description}
                  </div>
                </div>

                {selectedReport.stepsToReproduce && (
                  <div>
                    <label className="text-sm text-slate-400">Steps to Reproduce</label>
                    <div className="text-white whitespace-pre-wrap bg-slate-800 p-3 rounded mt-1">
                      {selectedReport.stepsToReproduce}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Reported by</label>
                    <div className="text-white">
                      {selectedReport.userEmail || selectedReport.email || 'Anonymous'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Date</label>
                    <div className="text-white">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {selectedReport.url && (
                  <div>
                    <label className="text-sm text-slate-400">Page URL</label>
                    <a
                      href={selectedReport.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline break-all"
                    >
                      {selectedReport.url}
                    </a>
                  </div>
                )}

                {selectedReport.browser && (
                  <div>
                    <label className="text-sm text-slate-400">Browser</label>
                    <div className="text-white">{selectedReport.browser}</div>
                  </div>
                )}

                {selectedReport.status === 'resolved' && selectedReport.resolution && (
                  <div>
                    <label className="text-sm text-slate-400">Resolution</label>
                    <div className="text-white whitespace-pre-wrap bg-slate-800 p-3 rounded mt-1">
                      {selectedReport.resolution}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-700">
                  <label className="text-sm text-slate-400">Add Resolution Note</label>
                  <textarea
                    id="resolutionText"
                    placeholder="Resolution notes (will be saved when you set status to resolved)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white mt-1"
                    rows={3}
                  />
                  <button
                    onClick={() => {
                      const resolution = (document.getElementById('resolutionText') as HTMLTextAreaElement)?.value;
                      if (resolution) {
                        updateStatus(selectedReport.id, 'resolved', resolution);
                      }
                    }}
                    className="mt-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
