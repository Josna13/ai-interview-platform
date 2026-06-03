import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, ArrowLeft, Brain, MessageSquare, Eye, Video } from 'lucide-react';

const InterviewFeedback = () => {
    const { id } = useParams();
    const [interview, setInterview] = useState(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/interviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterview(data);
            } catch (error) {
                console.error('Error fetching interview details', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [id, token]);

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    if (!interview) return <div className="text-center py-12">Interview not found.</div>;

    const totalScore = Math.round((interview.technical_score + interview.confidence_score + interview.communication_score) / 3);

    const ScoreCircle = ({ score, label, colorClass, icon: Icon }) => (
        <div className="card p-6 flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${colorClass.bg} ${colorClass.text}`}>
                <Icon size={32} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-1">{score}</h3>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 fade-in">
            <Link to="/dashboard" className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mb-6 transition-colors">
                <ArrowLeft size={18} />
                <span>Back to Dashboard</span>
            </Link>

            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20 mb-4 inline-block">
                        {interview.interview_type}
                    </span>
                    <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
                    <p className="text-primary-100 opacity-90">
                        Completed on {new Date(interview.date).toLocaleDateString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl flex items-center space-x-4 shadow-xl">
                    <div className="bg-amber-100 p-3 rounded-full text-amber-500">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Overall Score</div>
                        <div className="text-4xl font-black text-slate-900">{totalScore} <span className="text-xl text-slate-400 font-medium">/ 100</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <ScoreCircle
                    score={interview.technical_score}
                    label="Technical"
                    icon={Brain}
                    colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                />
                <ScoreCircle
                    score={interview.communication_score}
                    label="Communication"
                    icon={MessageSquare}
                    colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }}
                />
                <ScoreCircle
                    score={interview.confidence_score}
                    label="Confidence"
                    icon={Eye}
                    colorClass={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
                />
            </div>

            <div className="flex justify-center mb-10">
                <Link to={`/video-replay/${id}`} className="inline-flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all">
                    <Video size={24} />
                    <span className="text-lg">Watch AI Video Feedback</span>
                </Link>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mr-3 text-sm">Q&A</span>
                Detailed Feedback
            </h2>

            <div className="space-y-6">
                {interview.answers?.map((ans, idx) => (
                    <div key={ans.id} className="card overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 p-5">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Question {idx + 1}</span>
                            <h3 className="font-semibold text-slate-900 text-lg leading-relaxed">{ans.question}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-sm font-semibold text-slate-900 flex items-center mb-2">
                                    Your Answer
                                </span>
                                <p className="text-slate-600 bg-slate-50 p-4 rounded-lg italic border border-slate-100">
                                    "{ans.answer_text}"
                                </p>
                            </div>
                            <div>
                                <span className="text-sm font-semibold text-primary-700 flex items-center mb-2">
                                    AI Feedback ✨
                                </span>
                                <p className="text-primary-900 bg-primary-50 p-4 rounded-lg border border-primary-100">
                                    {ans.feedback}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {(!interview.answers || interview.answers.length === 0) && (
                    <div className="text-center text-slate-500 py-8 card bg-slate-50 border-dashed">
                        No detailed answers recorded for this session.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewFeedback;
