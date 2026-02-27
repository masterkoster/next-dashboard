import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Plane, LogOut, BookOpen, Loader2 } from 'lucide-react';

export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [loading, user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Top bar */}
            <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <Plane className="w-7 h-7 text-blue-400" />
                        <span className="text-lg font-bold text-white">Aviation App</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="text-slate-300 text-sm">
                            {user.name || user.username}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs font-medium rounded-full uppercase">
                            {user.tier}
                        </span>
                        <button
                            onClick={() => { logout(); navigate('/login'); }}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h1 className="text-3xl font-bold mb-2">Welcome, {user.name || user.username} 👋</h1>
                <p className="text-slate-400 mb-10">Here's your aviation dashboard. More modules coming soon.</p>

                {/* Quick links */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-slate-800/60 border border-slate-700/50 rounded-2xl hover:border-blue-500/30 transition-colors">
                        <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
                        <h2 className="text-lg font-semibold mb-1">Logbook</h2>
                        <p className="text-slate-400 text-sm">View and manage your flight entries.</p>
                    </div>
                    {/* More module cards go here as routes are ported */}
                </div>
            </main>
        </div>
    );
}
