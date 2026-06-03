import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, History, LogOut, Code2 } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                            <Code2 size={20} />
                        </div>
                        <span className="font-bold text-xl text-slate-900">AI Interview</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        {token ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Home size={18} />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/history"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/history') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <History size={18} />
                                    <span>History</span>
                                </Link>
                                <Link
                                    to="/coding-test"
                                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/coding-test') ? 'text-primary-600 bg-primary-50' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Code2 size={18} />
                                    <span>Coding Test</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 text-slate-600 hover:text-red-500 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-slate-600 hover:text-primary-600 font-medium text-sm transition-colors">
                                    Log in
                                </Link>
                                <Link to="/signup" className="btn-primary text-sm py-1.5 px-4">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
