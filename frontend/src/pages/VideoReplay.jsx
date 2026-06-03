import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, ArrowLeft, Video, AlertCircle, CheckCircle } from 'lucide-react';

const VideoReplay = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [videoUrl, setVideoUrl] = useState(null);
    const [timelineEvents, setTimelineEvents] = useState([]);

    useEffect(() => {
        const storedVideo = localStorage.getItem('recentInterviewVideo');
        const storedTimeline = localStorage.getItem('recentTimeline');

        if (storedVideo) {
            setVideoUrl(storedVideo);
        }
        if (storedTimeline) {
            try {
                setTimelineEvents(JSON.parse(storedTimeline));
            } catch (e) {
                console.error("Error parsing timeline:", e);
            }
        }

        // Cleanup URL on unmount to prevent memory leaks?
        // Actually, let's keep it until new session
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const seekTo = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    if (!videoUrl) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50">
                <div className="text-center slide-up">
                    <Video size={64} className="text-slate-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Recording Found</h2>
                    <p className="text-slate-500 mb-8">It seems there isn't a recent interview recording available.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn-primary"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Get current overlay to display
    const currentEvent = timelineEvents.find(e =>
        currentTime >= e.time && currentTime < e.time + 1.5 // Show for 1.5s
    );

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50 p-6 md:p-12 fade-in">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/interview/feedback/${id}`)}
                        className="flex items-center text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Back to Results
                    </button>
                    <h1 className="text-2xl font-bold">Interview Playback Review</h1>
                    <div className="w-24"></div> {/* Spacer */}
                </div>

                <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 aspect-video group slide-up flex items-center justify-center">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full h-full object-contain"
                        controls={false}
                    />

                    {/* Feedback Overlay */}
                    {currentEvent && (
                        <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full flex items-center space-x-3 text-sm font-bold shadow-2xl backdrop-blur-md animate-fade-in ${currentEvent.type === 'positive'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}>
                            {currentEvent.type === 'positive' ? (
                                <><CheckCircle size={18} /> <span>Confident / Good Eye Contact</span></>
                            ) : (
                                <><AlertCircle size={18} /> <span>Looking Away / Stress Detected</span></>
                            )}
                        </div>
                    )}

                    {/* Custom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-20 transition-opacity duration-300">

                        {/* Timeline Track with Markers */}
                        <div className="relative h-2 bg-slate-800 rounded-full mb-6 cursor-pointer" onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            seekTo(pos * duration);
                        }}>
                            <div
                                className="absolute top-0 left-0 h-full bg-primary-500 rounded-full pointer-events-none"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />

                            {/* Markers */}
                            {duration > 0 && timelineEvents.map((event, idx) => (
                                <div
                                    key={idx}
                                    title={event.type === 'positive' ? 'Positive Expression' : 'Negative Expression'}
                                    className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-3 rounded-sm opacity-60 hover:opacity-100 hover:scale-150 transition-all ${event.type === 'positive' ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`}
                                    style={{ left: `${(event.time / duration) * 100}%` }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        seekTo(event.time);
                                    }}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={togglePlay}
                                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                                >
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                </button>
                                <button
                                    onClick={() => seekTo(0)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <RotateCcw size={20} />
                                </button>
                                <div className="text-sm font-mono text-slate-300">
                                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} /
                                    {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                                </div>
                            </div>

                            <div className="flex items-center space-x-6 text-xs font-bold text-slate-400">
                                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" /> Confident</div>
                                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-2" /> Poor Eye Contact</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoReplay;
