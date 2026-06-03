import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle } from 'lucide-react';

const History = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/interviews', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInterviews(data);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    if (loading) return (
        <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Interview History</h1>

            <div className="card overflow-hidden">
                {interviews.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-medium text-sm text-slate-600">Type</th>
                                <th className="px-6 py-4 font-medium text-sm text-slate-600">Date</th>
                                <th className="px-6 py-4 font-medium text-sm text-slate-600">Technical</th>
                                <th className="px-6 py-4 font-medium text-sm text-slate-600">Confidence</th>
                                <th className="px-6 py-4 font-medium text-sm text-slate-600">Communication</th>
                                <th className="px-6 py-4 font-medium text-sm text-slate-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {interviews.map((interview) => (
                                <tr key={interview.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{interview.interview_type}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center space-x-1">
                                            <Clock size={14} />
                                            <span>{new Date(interview.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {interview.technical_score}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {interview.confidence_score}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            {interview.communication_score}/100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            to={`/interview/feedback/${interview.id}`}
                                            className="text-primary-600 hover:text-primary-800 font-medium text-sm flex items-center justify-end space-x-1"
                                        >
                                            <span>View</span>
                                            <CheckCircle size={14} />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        <p>You haven't completed any interviews yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
