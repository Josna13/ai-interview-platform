import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, TrendingUp, Clock, AlertCircle, Sparkles, Code2, ArrowRight, FileText } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        avg_technical: 0,
        avg_confidence: 0,
        avg_communication: 0,
        total_interviews: 0
    });
    const [recentInterviews, setRecentInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, historyRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/interviews/analytics/stats', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:5000/api/interviews', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setStats(statsRes.data);
                setRecentInterviews(historyRes.data.slice(0, 3));
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const ScoreCard = ({ title, score, type, icon: Icon, delay }) => {
        const styles = {
            primary: 'text-primary-600 bg-primary-50/50 hover:border-primary-200',
            indigo: 'text-indigo-600 bg-indigo-50/50 hover:border-indigo-200',
            emerald: 'text-emerald-600 bg-emerald-50/50 hover:border-emerald-200',
        };

        return (
            <div className={`card p-6 flex flex-col group slide-up ${styles[type]} border-transparent`} style={{ animationDelay: delay }}>
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Icon size={24} />
                    </div>
                    <TrendingUp size={20} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-sm font-semibold text-slate-600 mb-1">{title}</h3>
                <div className="flex items-baseline space-x-2 mt-auto">
                    <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {Math.round(score || 0)}
                    </span>
                    {type !== 'count' && <span className="text-sm font-medium text-slate-400">/ 100</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 fade-in">
            {/* Hero Banner */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 mb-12 text-white relative overflow-hidden shadow-2xl glass-dark border-0">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary-500/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-indigo-500/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center space-x-2 mb-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
                            <Sparkles className="text-amber-400" size={16} />
                            <span className="text-indigo-100 font-medium tracking-wide uppercase text-xs">Ready to level up?</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">{user.name}</span>
                        </h1>
                        <p className="text-indigo-100/80 text-lg">
                            Track your interview performance, identify your weakest spots, and land that dream job with AI-driven practice.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                        <Link
                            to="/interview/room"
                            onClick={() => localStorage.removeItem('candidateSkills')}
                            className="group bg-white text-primary-900 px-8 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all hover:-translate-y-1 flex items-center space-x-3 w-full sm:w-auto justify-center"
                        >
                            <span className="bg-primary-100 p-2 rounded-lg text-primary-600 group-hover:scale-110 transition-transform">
                                <Play size={20} fill="currentColor" />
                            </span>
                            <span className="text-lg">Start Practice</span>
                        </Link>

                        <Link to="/resume-upload" className="group bg-indigo-500/20 hover:bg-indigo-500/30 text-white border border-indigo-400/30 hover:border-indigo-400/60 px-8 py-4 rounded-2xl font-bold backdrop-blur-md transition-all hover:-translate-y-1 flex items-center space-x-3 w-full sm:w-auto justify-center">
                            <span className="bg-indigo-400/20 p-2 rounded-lg text-indigo-300 group-hover:scale-110 transition-transform">
                                <FileText size={20} />
                            </span>
                            <span className="text-lg">Resume Based</span>
                        </Link>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <ScoreCard
                            title="Total Interviews"
                            score={stats.total_interviews}
                            type="primary"
                            icon={Code2}
                            delay="0s"
                        />
                        <ScoreCard
                            title="Technical Score"
                            score={stats.avg_technical}
                            type="indigo"
                            icon={Play}
                            delay="0.1s"
                        />
                        <ScoreCard
                            title="Confidence Score"
                            score={stats.avg_confidence}
                            type="emerald"
                            icon={Sparkles}
                            delay="0.2s"
                        />
                        <ScoreCard
                            title="Communication Avg"
                            score={stats.avg_communication}
                            type="primary"
                            icon={TrendingUp}
                            delay="0.3s"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 slide-up" style={{ animationDelay: '0.4s' }}>
                            <div className="card h-full">
                                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                    <h2 className="text-xl font-bold text-slate-900">Recent Sessions</h2>
                                    <Link to="/history" className="text-sm flex items-center text-primary-600 hover:text-primary-700 font-semibold group">
                                        <span>View history</span>
                                        <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                                <div className="p-0">
                                    {recentInterviews.length > 0 ? (
                                        <ul className="divide-y divide-slate-100">
                                            {recentInterviews.map((interview) => (
                                                <li key={interview.id} className="p-6 md:p-8 hover:bg-slate-50/80 transition-colors group">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="bg-primary-50 p-4 rounded-2xl text-primary-600">
                                                                <Clock size={24} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-slate-900 text-lg">{interview.interview_type}</h4>
                                                                <p className="text-sm font-medium text-slate-500">
                                                                    {new Date(interview.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center">
                                                            <div className="text-2xl font-black text-slate-900">
                                                                {Math.round((interview.technical_score + interview.confidence_score + interview.communication_score) / 3)}<span className="text-sm font-medium text-slate-400">/100</span>
                                                            </div>
                                                            <Link
                                                                to={`/interview/feedback/${interview.id}`}
                                                                className="text-sm text-primary-600 hover:text-primary-700 font-semibold mt-1"
                                                            >
                                                                View Detailed Report &rarr;
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                            <div className="bg-slate-100 p-4 rounded-full mb-4">
                                                <AlertCircle size={32} className="text-slate-400" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">No sessions yet</h3>
                                            <p className="mb-6">Your interview history will appear here.</p>
                                            <Link to="/interview/room" className="btn-primary">
                                                Start your first practice
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 slide-up" style={{ animationDelay: '0.5s' }}>
                            <div className="card p-8 border-t-4 border-t-indigo-500 bg-gradient-to-b from-indigo-50/50 to-white">
                                <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Pro Tip</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Maintain eye contact with the camera to improve your confidence score. The AI tracks your facial expressions in real-time.
                                </p>
                            </div>
                            <div className="card p-8 border-t-4 border-t-emerald-500 bg-gradient-to-b from-emerald-50/50 to-white">
                                <div className="bg-emerald-100 w-10 h-10 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Speak Clearly</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Our system evaluates your answers based on voice recognition. Minimize background noise and speak concisely.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
