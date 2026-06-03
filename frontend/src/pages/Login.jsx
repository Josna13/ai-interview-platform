import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Code2, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password
            });

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-primary-300/30 blur-3xl"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-indigo-300/30 blur-3xl"></div>

            <div className="max-w-md w-full space-y-8 z-10 card p-8 fade-in">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-4 shadow-sm">
                        <Code2 size={28} />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Sign in to your account and continue practicing
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex justify-center py-2.5"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            'Sign in'
                        )}
                    </button>

                    <p className="text-center text-sm text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary-600 hover:text-primary-500 font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
