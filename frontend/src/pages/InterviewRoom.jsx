import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Video, Mic, CheckCircle, Code2, Layers, Cpu, Brain, Activity, Volume2, Code } from 'lucide-react';
import * as faceapi from 'face-api.js';
import Editor from '@monaco-editor/react';

const InterviewRoom = () => {
    const [selectedType, setSelectedType] = useState(null);
    const [interviewId, setInterviewId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [transcript, setTranscript] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [setupLoading, setSetupLoading] = useState(false);
    const [runningScores, setRunningScores] = useState({ technical: 0, confidence: 0, communication: 0, answeredCount: 0 });
    const [faceStatus, setFaceStatus] = useState("Initializing facial tracking...");
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showCodeEditor, setShowCodeEditor] = useState(false);
    const [code, setCode] = useState('// Write your code here...\n');
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const recognitionRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const timelineEventsRef = useRef([]);
    const startTimeRef = useRef(null);
    const interviewIdRef = useRef(null);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Fetch cameras
    useEffect(() => {
        const getCameras = async () => {
            try {
                // Request perms silently first to ensure labels are visible
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                tempStream.getTracks().forEach(track => track.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();

                // Filter out virtual cameras, OBS, etc. and keep only physical cameras
                const videoDevices = devices.filter(device => {
                    if (device.kind !== 'videoinput') return false;
                    const label = device.label.toLowerCase();
                    return !label.includes('virtual') && !label.includes('obs') && !label.includes('snap');
                });

                setCameras(videoDevices);
                if (videoDevices.length > 0) {
                    setSelectedCamera(videoDevices[0].deviceId);
                }
            } catch (err) {
                console.error("Camera permissions denied or error fetching cameras", err);
            }
        };
        getCameras();
    }, []);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    const t = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += t + ' ';
                    } else {
                        interimTranscript += t;
                    }
                }
                setTranscript(finalTranscript + interimTranscript);
            };
        } else {
            console.warn("Speech Recognition API not supported in this browser.");
        }
    }, []);

    // Timer logic
    useEffect(() => {
        let timer;
        if (isRecording && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && isRecording) {
            handleNextQuestion();
        }
        return () => clearInterval(timer);
    }, [isRecording, timeLeft]);

    // Load true face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                await faceapi.nets.faceExpressionNet.loadFromUri('/models');
                setModelsLoaded(true);
            } catch (err) {
                console.error('Error loading face-api models:', err);
                // fallback
                setModelsLoaded(true);
            }
        };
        loadModels();
    }, []);

    // Auto-start if skills are present from ResumeUpload
    useEffect(() => {
        const skills = localStorage.getItem('candidateSkills');
        if (skills && !selectedType && !setupLoading) {
            // Give camera a tiny bit of time to initialize constraints before firing
            setTimeout(() => {
                startInterviewSession('Custom (Resume Based)');
            }, 500);
        }
    }, []);

    const getCameraStream = async () => {
        try {
            const constraints = {
                audio: true,
                video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            return true;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            alert('We need access to your camera and microphone to start the interview.');
            return false;
        }
    };

    const stopVideo = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const startInterviewSession = async (type) => {
        setSetupLoading(true);
        const hasCamera = await getCameraStream();

        if (hasCamera) {
            try {
                const { data } = await axios.post('http://localhost:5000/api/interviews',
                    { interview_type: type },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setInterviewId(data.id);
                interviewIdRef.current = data.id;

                // Use dynamic questions returned from backend, or fallback
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                } else {
                    const FALLBACK_POOLS = {
                        'Frontend Developer': [
                            'Explain the Virtual DOM in React and why it is useful.',
                            'What is the difference between let, const, and var in JavaScript?',
                            'How do you manage state in a complex React application?',
                            'Describe the CSS box model.',
                            'What are some ways to optimize the performance of a web application?',
                            'Explain the concept of closures in JavaScript.',
                            'What is event delegation in the DOM?',
                            'How do promises work in JavaScript?',
                            'Explain the difference between flexbox and CSS grid.',
                            'What are React Hooks and how do they differ from class lifecycle methods?'
                        ],
                        'Backend Developer': [
                            'Explain RESTful API principles.',
                            'What is the difference between SQL and NoSQL databases?',
                            'How do you handle authentication securely in a Node.js application?',
                            'Explain the concept of event-driven programming.',
                            'How would you deploy and scale a backend service?',
                            'What is database normalization and why is it important?',
                            'Explain what Docker is and how it helps backend development.',
                            'How do you handle error logging and monitoring in production?',
                            'What is the purpose of a reverse proxy like Nginx?',
                            'Describe how caching (like Redis) improves backend performance.'
                        ],
                        'Data Structures': [
                            'Explain the difference between an Array and a Linked List.',
                            'What is the time complexity of a Binary Search tree?',
                            'How does a Hash Map work under the hood?',
                            'Explain the concept of dynamic programming.',
                            'Describe how you would implement a LRU cache.',
                            'What is a graph, and how do you traverse it?',
                            'Explain the difference between a Stack and a Queue.',
                            'What is a sorting algorithm you find most efficient and why?',
                            'Describe the concept of recursion.',
                            'How do you detect a cycle in a linked list?'
                        ]
                    };
                    const candidateSkillsStr = localStorage.getItem('candidateSkills');
                    let customQuestions = [];
                    if (candidateSkillsStr) {
                        try {
                            const candidateSkills = JSON.parse(candidateSkillsStr);
                            if (candidateSkills && candidateSkills.length > 0) {
                                customQuestions.push(`Based on your resume, could you walk us through a complex problem you solved using ${candidateSkills[0]}?`);
                                if (candidateSkills.length > 1) {
                                    customQuestions.push(`How do you manage performance and best practices when working with ${candidateSkills[1]}?`);
                                }
                            }
                        } catch (e) {
                            console.error("Failed to parse candidate skills", e);
                        }
                    }

                    const pool = FALLBACK_POOLS[type] || FALLBACK_POOLS['Frontend Developer'];
                    const shuffled = [...pool].sort(() => 0.5 - Math.random());

                    const finalQuestions = [...customQuestions, ...shuffled].slice(0, 10);
                    setQuestions(finalQuestions);
                }

                setSelectedType(type); // This reveals the Room UI
            } catch (err) {
                console.error('Failed to start interview', err);
                alert('Failed to connect to the server.');
            }
        }
        setSetupLoading(false);
    };

    // Connect video element once it is mounted using setInterval to guarantee attachment
    useEffect(() => {
        let interval;
        if (selectedType) {
            interval = setInterval(() => {
                if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
                    videoRef.current.srcObject = streamRef.current;
                }
            }, 500);

            // Initialize MediaRecorder for full session capture
            if (streamRef.current && !mediaRecorder) {
                try {
                    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
                    recorder.ondataavailable = (e) => {
                        if (e.data.size > 0) {
                            recordedChunksRef.current.push(e.data);
                        }
                    };
                    recorder.onstop = () => {
                        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                        const videoUrl = URL.createObjectURL(blob);

                        // Pass to replay/feedback pages via localStorage
                        localStorage.setItem('recentInterviewVideo', videoUrl);
                        localStorage.setItem('recentTimeline', JSON.stringify(timelineEventsRef.current));

                        navigate(`/interview/feedback/${interviewIdRef.current}`);
                    };
                    recorder.start(1000);
                    setMediaRecorder(recorder);
                    startTimeRef.current = Date.now();
                } catch (err) {
                    console.warn("MediaRecorder error - may not capture video", err);
                }
            }
        }
        return () => clearInterval(interval);
    }, [selectedType]);

    const handleVideoPlay = () => {
        setInterval(async () => {
            if (videoRef.current && modelsLoaded) {
                const detections = await faceapi.detectSingleFace(
                    videoRef.current,
                    new faceapi.TinyFaceDetectorOptions()
                ).withFaceExpressions();

                if (detections) {
                    const maxExp = Object.keys(detections.expressions).reduce((a, b) =>
                        detections.expressions[a] > detections.expressions[b] ? a : b
                    );
                    setFaceStatus(`Expression Detected: ${maxExp}`);

                    // Track expressions on timeline
                    if (startTimeRef.current) {
                        const timeOffset = Math.floor((Date.now() - startTimeRef.current) / 1000);
                        if (['sad', 'angry', 'fear', 'disgust'].includes(maxExp)) {
                            timelineEventsRef.current.push({ time: timeOffset, type: 'negative', expression: maxExp });
                        } else if (['happy', 'surprised', 'neutral'].includes(maxExp)) {
                            timelineEventsRef.current.push({ time: timeOffset, type: 'positive', expression: maxExp });
                        }
                    }
                } else {
                    setFaceStatus("Face not detected. Please ensure your camera is not covered by a privacy shutter.");

                    if (startTimeRef.current) {
                        const timeOffset = Math.floor((Date.now() - startTimeRef.current) / 1000);
                        timelineEventsRef.current.push({ time: timeOffset, type: 'negative', expression: 'no_face' });
                    }
                }
            }
        }, 1200);
    };

    // AI Speech Synthesis
    const speakQuestion = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech
            setIsSpeaking(true);
            const utterance = new SpeechSynthesisUtterance(text);

            // Try to find a good English voice
            const voices = window.speechSynthesis.getVoices();
            const englishVoice = voices.find(v => (v.lang.includes('en') && v.name.includes('Google')) || (v.lang.includes('en') && v.name.includes('Female'))) || voices.find(v => v.lang.includes('en'));
            if (englishVoice) utterance.voice = englishVoice;

            utterance.rate = 0.95;
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    // Trigger speech when question changes
    useEffect(() => {
        if (questions.length > 0 && selectedType && !setupLoading) {
            // Small delay so UI loads first
            const timeout = setTimeout(() => {
                speakQuestion(questions[currentQuestionIdx]);
            }, 800);
            return () => {
                clearTimeout(timeout);
                window.speechSynthesis.cancel();
            };
        }
    }, [currentQuestionIdx, questions, selectedType, setupLoading]);

    const toggleRecording = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop AI if user interrupts
            setIsSpeaking(false);
        }
        if (!isRecording) {
            setIsRecording(true);
            setTranscript('');
            try {
                recognitionRef.current?.start();
            } catch (e) { console.error(e) }
        } else {
            setIsRecording(false);
            try {
                recognitionRef.current?.stop();
            } catch (e) { console.error(e) }
        }
    };

    const handleNextQuestion = async () => {
        if (isRecording) {
            toggleRecording();
        }

        const trimmedTranscript = transcript.trim();
        const words = trimmedTranscript.length > 0 ? trimmedTranscript.split(' ').length : 0;

        // Calculate mock scores based on valid answer presence
        let qTech = 0, qConf = 0, qComm = 0;

        if (words > 0) {
            qTech = Math.min(100, Math.max(40, words * 2 + Math.floor(Math.random() * 20)));
            qConf = Math.min(100, Math.max(50, 70 + Math.floor(Math.random() * 30)));
            qComm = Math.min(100, Math.max(45, words * 1.5 + 40));

            setRunningScores(prev => ({
                technical: prev.technical + qTech,
                confidence: prev.confidence + qConf,
                communication: prev.communication + qComm,
                answeredCount: prev.answeredCount + 1
            }));
        } else {
            // 0 if completely blank
            setRunningScores(prev => ({
                ...prev,
                answeredCount: prev.answeredCount + 1 // still counts as a question
            }));
        }

        // Save answer
        await axios.post('http://localhost:5000/api/interviews/answers', {
            interview_id: interviewId,
            question: questions[currentQuestionIdx],
            answer_text: trimmedTranscript || 'No answer recorded',
            feedback: words > 0 ? `You spoke ${words} words. Mock AI evaluation generated.` : 'No answer provided. Score is 0.'
        }, { headers: { Authorization: `Bearer ${token}` } });

        // Progress logic
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setTimeLeft(60);
            setTranscript('');
        } else {
            stopVideo();

            // Calculate final averages
            const totalQuestions = questions.length;
            // Have to include current question in final average calculation manually
            const finalTech = Math.round((runningScores.technical + qTech) / totalQuestions);
            const finalConf = Math.round((runningScores.confidence + qConf) / totalQuestions);
            const finalComm = Math.round((runningScores.communication + qComm) / totalQuestions);

            await axios.put(`http://localhost:5000/api/interviews/${interviewId}/scores`, {
                technical_score: finalTech,
                confidence_score: finalConf,
                communication_score: finalComm
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop(); // onstop handler will trigger navigation
            } else {
                navigate(`/interview/feedback/${interviewIdRef.current || interviewId}`);
            }
        }
    };

    // UI for Interview Type Selection
    if (!selectedType) {
        const skillsRaw = localStorage.getItem('candidateSkills');

        // If we have skills, we are auto-starting, show a loading spinner instead of the role selection screen
        if (skillsRaw) {
            return (
                <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 bg-slate-50">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Entering Custom Interview Room...</p>
                </div>
            );
        }

        const roles = [
            { name: 'Frontend Developer', icon: Code2, color: 'text-blue-500', bg: 'bg-blue-50' },
            { name: 'Backend Developer', icon: Layers, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { name: 'Data Structures', icon: Cpu, color: 'text-indigo-500', bg: 'bg-indigo-50' }
        ];

        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 relative overflow-hidden bg-slate-50 fade-in">
                <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary-200/50 blur-3xl animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-200/50 blur-3xl animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-center mb-16 max-w-2xl slide-up">
                    <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-6 border border-slate-100">
                        <Brain size={32} className="text-primary-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Track</span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8">
                        Select a specialized role to begin your AI-powered technical interview. Dynamic questions and real-time transcription active.
                    </p>
                    {cameras.length > 1 && (
                        <div className="bg-white/50 backdrop-blur-sm border border-slate-200 p-4 rounded-2xl shadow-sm text-left inline-block w-full max-w-sm">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Camera Input</label>
                            <select
                                value={selectedCamera}
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all font-medium text-sm outline-none"
                            >
                                {cameras.map((c, i) => (
                                    <option key={c.deviceId} value={c.deviceId}>
                                        {c.label || `Camera ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
                    {roles.map((role, idx) => (
                        <button
                            key={role.name}
                            onClick={() => startInterviewSession(role.name)}
                            disabled={setupLoading}
                            className="card p-8 md:p-10 text-left hover:-translate-y-2 group flex flex-col items-center text-center slide-up disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                            <div className={`${role.bg} ${role.color} p-5 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                <role.icon size={36} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{role.name}</h3>
                            <p className="text-slate-500 text-sm font-medium">10 Technical Questions</p>
                        </button>
                    ))}
                </div>

                {setupLoading && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex flex-col justify-center items-center text-white">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                        <h2 className="text-xl font-bold">Connecting...</h2>
                        <p className="text-white/70">Please allow browser permissions</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-950 text-slate-50 overflow-hidden fade-in relative">
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    onPlay={handleVideoPlay}
                    className="w-full h-full object-cover opacity-90 scale-[1.02] transform -scale-x-100"
                />

                <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                    <div className="glass-dark rounded-2xl px-6 py-3 text-3xl font-mono font-bold tracking-wider shadow-2xl border-white/20">
                        {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
                    </div>

                    <div className="flex flex-col items-end space-y-3">
                        {modelsLoaded ? (
                            <div className="flex flex-col items-end space-y-2">
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-lg backdrop-blur-md">
                                    <CheckCircle size={16} className="mr-2" /> AI Active
                                </span>
                                {isSpeaking && (
                                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-lg backdrop-blur-md animate-pulse">
                                        <Volume2 size={16} className="mr-2" /> AI Speaking
                                    </span>
                                )}
                                <span className="bg-slate-900/60 text-white/80 border border-slate-700/50 px-3 py-1.5 rounded-lg text-[10px] font-medium backdrop-blur-md w-max max-w-[250px] text-right leading-tight">
                                    {faceStatus}
                                </span>
                            </div>
                        ) : (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-lg backdrop-blur-md">
                                <span className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mr-2" /> Init Models
                            </span>
                        )}

                        {isRecording && (
                            <span className="bg-rose-500/10 text-rose-500 border border-rose-500/30 px-4 py-2 rounded-xl text-xs font-bold flex items-center shadow-lg backdrop-blur-md animate-pulse">
                                <div className="w-3 h-3 rounded-full bg-rose-500 mr-2 shadow-[0_0_10px_rgba(244,63,94,0.8)]" /> RECORDING
                            </span>
                        )}
                    </div>
                </div>

                {isRecording && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent w-full h-full pointer-events-none animate-[scan_3s_linear_infinite]" style={{ backgroundSize: '100% 20%' }}></div>
                )}

                {/* Live Code Editor Overlay */}
                {showCodeEditor && (
                    <div className="absolute inset-0 z-30 flex flex-col bg-[#1e1e1e] border-r border-slate-700 animate-slide-in-left">
                        <div className="h-12 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-4">
                            <div className="flex items-center text-slate-300 font-mono text-sm">
                                <Code size={16} className="mr-2" /> Live Workspace
                            </div>
                            <button
                                onClick={() => setShowCodeEditor(false)}
                                className="text-slate-400 hover:text-white transition-colors text-sm font-medium bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-md"
                            >
                                Hide Editor
                            </button>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="javascript"
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value)}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    padding: { top: 16 }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full lg:w-[450px] flex flex-col bg-slate-900 border-l border-slate-800 shadow-2xl z-10">
                <div className="p-8 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Question {currentQuestionIdx + 1} / {questions.length}</span>
                        <span className="text-xs text-primary-400 font-bold bg-primary-900/30 px-3 py-1 rounded-full border border-primary-500/20">{selectedType}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                        {questions[currentQuestionIdx]}
                    </h2>
                </div>

                <div className="flex-1 p-8 relative overflow-hidden flex flex-col bg-slate-950/50">
                    <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                            <Mic size={16} className="mr-2" /> Live Transcript
                        </span>
                        {isRecording && <Activity size={16} className="text-primary-500 animate-pulse" />}
                    </div>
                    <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 font-mono text-sm text-slate-300 overflow-y-auto leading-relaxed shadow-inner glass-dark">
                        {transcript ? transcript : (
                            <span className="text-slate-500 italic flex items-center justify-center h-full text-center">No audio recorded yet. Hit 'Start Answering' to record your response.</span>
                        )}
                    </div>
                </div>

                <div className="p-8 bg-slate-900 border-t border-slate-800 space-y-4">
                    <button
                        onClick={toggleRecording}
                        className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-xl flex items-center justify-center space-x-3 ${isRecording
                            ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-900/20 hover:shadow-rose-900/40'
                            : 'bg-primary-600 text-white hover:bg-primary-500 shadow-primary-900/20 hover:shadow-primary-900/40'
                            }`}
                    >
                        {isRecording ? (
                            <>
                                <div className="w-4 h-4 bg-white rounded-sm" /> <span className="text-base tracking-wide">Stop Recording</span>
                            </>
                        ) : (
                            <>
                                <Video size={20} /> <span className="text-base tracking-wide">Start Answering</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => setShowCodeEditor(!showCodeEditor)}
                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${showCodeEditor ? 'bg-indigo-600 border border-indigo-500 text-white shadow-lg' : 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-slate-700 border hover:text-indigo-300'}`}
                    >
                        <Code size={18} />
                        <span className="text-base">{showCodeEditor ? 'Close Code Editor' : 'Open Code Editor'}</span>
                    </button>

                    <button
                        onClick={handleNextQuestion}
                        disabled={isRecording}
                        className="w-full py-4 rounded-xl font-bold text-sm transition-all bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed group"
                    >
                        <span className="text-base tracking-wide flex items-center justify-center">
                            {currentQuestionIdx === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                        </span>
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes scan {
          0% { background-position: 0 -100vh; }
          100% { background-position: 0 100vh; }
        }
      `}} />
        </div>
    );
};

export default InterviewRoom;
