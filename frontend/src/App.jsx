import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import CustomInterviewRoom from './pages/CustomInterviewRoom';
import ResumeUpload from './pages/ResumeUpload';
import VideoReplay from './pages/VideoReplay';
import InterviewFeedback from './pages/InterviewFeedback';
import History from './pages/History';
import CodingTest from './pages/CodingTest';

// Simple auth check (will be replaced by context/state later or just token check)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/resume-upload" element={
              <ProtectedRoute>
                <ResumeUpload />
              </ProtectedRoute>
            } />
            <Route path="/interview/room" element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            } />
            <Route path="/interview/custom" element={
              <ProtectedRoute>
                <CustomInterviewRoom />
              </ProtectedRoute>
            } />
            <Route path="/interview/feedback/:id" element={
              <ProtectedRoute>
                <InterviewFeedback />
              </ProtectedRoute>
            } />
            <Route path="/video-replay/:id" element={
              <ProtectedRoute>
                <VideoReplay />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/coding-test" element={
              <ProtectedRoute>
                <CodingTest />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
