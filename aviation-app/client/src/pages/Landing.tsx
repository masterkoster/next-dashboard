import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    Plane,
    BookOpen,
    Shield,
    Users,
    ChevronRight,
    Menu,
    X,
    Wrench,
    Map,
    BarChart3,
} from 'lucide-react';

/* ─── Navbar ────────────────────────────────────────────────────────────── */
function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <Plane className="w-8 h-8 text-blue-400" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            Aviation App
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                            Features
                        </a>
                        <a href="#why" className="text-slate-300 hover:text-white transition-colors">
                            Why Us
                        </a>
                        {user ? (
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden text-slate-300 hover:text-white"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 px-4 py-4 space-y-3">
                    <a href="#features" className="block text-slate-300 hover:text-white">Features</a>
                    <a href="#why" className="block text-slate-300 hover:text-white">Why Us</a>
                    <Link to="/login" className="block px-4 py-2 bg-blue-600 rounded-lg text-center font-medium">
                        Sign In
                    </Link>
                </div>
            )}
        </nav>
    );
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
function Hero() {
    return (
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm mb-6">
                    <Plane className="w-4 h-4" />
                    Your Aviation Command Center
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                    Everything a pilot needs,{' '}
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                        in one place
                    </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                    Digital logbook, flight planning, weather briefings, aircraft marketplace,
                    maintenance tracking, and flying club management — all built for pilots.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/login"
                        className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
                    >
                        Get Started Free
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a
                        href="#features"
                        className="px-6 py-3 border border-slate-600 hover:border-slate-500 rounded-xl font-semibold text-lg text-slate-300 hover:text-white transition-all"
                    >
                        See Features
                    </a>
                </div>
            </div>
        </section>
    );
}

/* ─── Features ─────────────────────────────────────────────────────────── */
const features = [
    {
        icon: BookOpen,
        title: 'Digital Logbook',
        description: 'FAA & EASA compliant digital logbook with automatic currency tracking, endorsements, and PDF export.',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Map,
        title: 'Flight Planning',
        description: 'Plan flights with weather overlays, NOTAMs, TFRs, fuel pricing, and weight & balance calculations.',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: Shield,
        title: 'Aircraft Marketplace',
        description: 'Buy, sell, and find aircraft partnerships. Every listing verified against FAA registration data.',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
    },
    {
        icon: Wrench,
        title: 'Maintenance Tracking',
        description: 'Track annuals, ADs, and recurring maintenance. Connect with A&P mechanics directly.',
        color: 'text-rose-400',
        bg: 'bg-rose-500/10',
    },
    {
        icon: Users,
        title: 'Flying Clubs',
        description: 'Manage aircraft scheduling, shared expenses, member roles, and club communications.',
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
    },
    {
        icon: BarChart3,
        title: 'Hour Analytics',
        description: 'Visualize your flight hours, track training progress, and monitor currency requirements.',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
    },
];

function Features() {
    return (
        <section id="features" className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-14">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built for Pilots, by Pilots</h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto">
                        Every feature designed around real-world aviation needs.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="group p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl transition-all duration-300"
                        >
                            <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-4`}>
                                <f.icon className={`w-6 h-6 ${f.color}`} />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Why Section ──────────────────────────────────────────────────────── */
function WhySection() {
    const points = [
        { label: 'Free to Start', detail: 'No credit card required. Get started with the free tier.' },
        { label: 'FAA & EASA Ready', detail: 'Compliant with both FAA and EASA regulations out of the box.' },
        { label: 'Offline Capable', detail: 'Log flights offline. Data syncs when you\'re back online.' },
        { label: 'Secure & Encrypted', detail: 'End-to-end encryption for messages. Your data is yours.' },
    ];

    return (
        <section id="why" className="py-20 px-4 bg-slate-800/30">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">Why Pilots Choose Us</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                    {points.map((p) => (
                        <div key={p.label} className="flex gap-4 p-5 bg-slate-900/50 rounded-xl border border-slate-700/30">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-1">{p.label}</h3>
                                <p className="text-slate-400 text-sm">{p.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Footer ───────────────────────────────────────────────────────────── */
function Footer() {
    return (
        <footer className="py-10 px-4 border-t border-slate-800">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-slate-300">Aviation App</span>
                </div>
                <p className="text-slate-500 text-sm">
                    © {new Date().getFullYear()} Aviation App. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

/* ─── Landing Page ─────────────────────────────────────────────────────── */
export default function Landing() {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Navbar />
            <main>
                <Hero />
                <Features />
                <WhySection />
            </main>
            <Footer />
        </div>
    );
}
