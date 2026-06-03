import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const ResumeUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError('');
        } else {
            setFile(null);
            setError('Please upload a valid PDF file.');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.type === 'application/pdf') {
            setFile(droppedFile);
            setError('');
        } else {
            setError('Please drop a valid PDF file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a resume file first.');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            setExtractedSkills(res.data.skills || []);

        } catch (err) {
            setError(err.response?.data?.message || 'Error parsing resume');
        } finally {
            setUploading(false);
        }
    };

    const handleContinue = () => {
        // Pass skills to the custom interview room via local storage
        // If a specific skill is selected, focus the interview strictly on that
        const skillsToPass = selectedSkill ? [selectedSkill] : extractedSkills;
        localStorage.setItem('candidateSkills', JSON.stringify(skillsToPass));
        navigate('/interview/custom');
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-50 fade-in">
            <div className="max-w-xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Tailor Your Interview</h1>
                    <p className="text-slate-600">
                        Upload your resume so our AI can analyze your skills and generate highly personalized technical questions.
                    </p>
                </div>

                {!extractedSkills.length ? (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${file ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
                        >
                            <input
                                type="file"
                                id="resumeInput"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="flex flex-col items-center slide-up">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary-600 mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{file.name}</h3>
                                    <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-sm font-medium text-slate-500 hover:text-red-500 transition-colors"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <label htmlFor="resumeInput" className="cursor-pointer flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mb-4 group-hover:text-primary-600 transition-colors">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-2">Click to Upload or Drag & Drop</h3>
                                    <p className="text-sm text-slate-500">Only PDF files are supported</p>
                                </label>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm font-medium">
                                <AlertCircle size={18} className="mr-2" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="mt-6 w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span>Extracting Skills...</span>
                                </>
                            ) : (
                                <>
                                    <FileText size={24} />
                                    <span>Analyze Resume</span>
                                </>
                            )}
                        </button>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate('/interview/room')}
                                className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors"
                            >
                                Skip & Use Default Questions &rarr;
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-emerald-200 slide-up">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={32} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Resume Analyzed!</h2>
                        <p className="text-center text-slate-600 mb-8">
                            Select a specific skill you'd like to be tested on, or continue to be tested on all of them.
                        </p>

                        <div className="flex flex-wrap gap-3 mb-8 justify-center">
                            {extractedSkills.map((skill, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedSkill(skill === selectedSkill ? null : skill)}
                                    className={`px-4 py-2 border rounded-lg text-sm font-bold tracking-wide transition-all slide-up ${selectedSkill === skill
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                            : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                                        }`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleContinue}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-1 text-lg"
                        >
                            <span>Start Custom Interview</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeUpload;
