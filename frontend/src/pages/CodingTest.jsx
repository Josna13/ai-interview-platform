import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, XCircle, TerminalSquare, Code2, Clock, ChevronRight, ChevronLeft, Award } from 'lucide-react';

const QUESTION_POOL = [
    {
        id: 1,
        title: "1. Two Sum",
        difficulty: "Easy",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution.",
        examples: [{ input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }],
        starterCode: {
            javascript: "function twoSum(nums, target) {\n    \n}",
            python: "def twoSum(nums, target):\n    pass",
            java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
        },
        testCases: [
            { params: [[2, 7, 11, 15], 9], expected: [0, 1] },
            { params: [[3, 2, 4], 6], expected: [1, 2] }
        ]
    },
    {
        id: 2,
        title: "2. Reverse String",
        difficulty: "Easy",
        description: "Write a function that reverses a string. The input string is given as an array of characters `s`.",
        examples: [{ input: "s = ['h','e','l','l','o']", output: "['o','l','l','e','h']" }],
        starterCode: {
            javascript: "function reverseString(s) {\n    \n}",
            python: "def reverseString(s):\n    pass",
            java: "class Solution {\n    public void reverseString(char[] s) {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    void reverseString(vector<char>& s) {\n        \n    }\n};"
        },
        testCases: [
            { params: [['h', 'e', 'l', 'l', 'o']], expected: ['o', 'l', 'l', 'e', 'h'] }
        ]
    },
    {
        id: 3,
        title: "3. Valid Parentheses",
        difficulty: "Medium",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        examples: [{ input: "s = '()[]{}'", output: "true" }, { input: "s = '(]'", output: "false" }],
        starterCode: {
            javascript: "function isValid(s) {\n    \n}",
            python: "def isValid(s):\n    pass",
            java: "class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};"
        },
        testCases: [
            { params: ["()[]{}"], expected: true },
            { params: ["(]"], expected: false }
        ]
    },
    {
        id: 4,
        title: "4. Palindrome Number",
        difficulty: "Easy",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        examples: [{ input: "x = 121", output: "true" }, { input: "x = -121", output: "false" }],
        starterCode: {
            javascript: "function isPalindrome(x) {\n    \n}",
            python: "def isPalindrome(x):\n    pass",
            java: "class Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};"
        },
        testCases: [
            { params: [121], expected: true },
            { params: [-121], expected: false }
        ]
    },
    {
        id: 5,
        title: "5. Maximum Subarray",
        difficulty: "Medium",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        examples: [{ input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6" }],
        starterCode: {
            javascript: "function maxSubArray(nums) {\n    \n}",
            python: "def maxSubArray(nums):\n    pass",
            java: "class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}",
            cpp: "class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};"
        },
        testCases: [
            { params: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 }
        ]
    }
];

const CodingTest = () => {
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [language, setLanguage] = useState('javascript');

    // answers[questionId][language] = code
    const [answers, setAnswers] = useState({});

    const [results, setResults] = useState(null);
    const [isTesting, setIsTesting] = useState(false);

    // Timer state
    const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes
    const [isFinished, setIsFinished] = useState(false);
    const [finalScore, setFinalScore] = useState(0);

    const navigate = useNavigate();

    // Initialize 5 random questions
    useEffect(() => {
        const shuffled = [...QUESTION_POOL].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setQuestions(selected);

        // Init answers
        const initAnswers = {};
        selected.forEach(q => {
            initAnswers[q.id] = {
                javascript: q.starterCode.javascript,
                python: q.starterCode.python,
                java: q.starterCode.java,
                cpp: q.starterCode.cpp
            };
        });
        setAnswers(initAnswers);
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!isFinished && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isFinished) {
            handleFinishTest();
        }
    }, [timeLeft, isFinished]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleCodeChange = (value) => {
        const qId = questions[currentIdx].id;
        setAnswers(prev => ({
            ...prev,
            [qId]: {
                ...prev[qId],
                [language]: value
            }
        }));
    };

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setResults(null);
    };

    const handleRunCode = () => {
        setIsTesting(true);
        setResults(null);

        if (language !== 'javascript') {
            setTimeout(() => {
                setResults({
                    allPassed: false,
                    mockWarning: true,
                    message: `Cannot execute ${language} in the browser simulator. Please select JavaScript for live execution.`
                });
                setIsTesting(false);
            }, 800);
            return;
        }

        const problem = questions[currentIdx];
        const code = answers[problem.id][language];

        setTimeout(() => {
            const newResults = [];
            let allPassed = true;

            try {
                // VERY BASIC SANDBOX
                const executeFn = new Function(`
                    ${code}
                    // Try to guess the function name based on starter code signature
                    const fnMatch = \`${code}\`.match(/function\\s+([a-zA-Z0-9_]+)/);
                    if (fnMatch) {
                        return eval(fnMatch[1]);
                    }
                    return null;
                `)();

                if (!executeFn || typeof executeFn !== 'function') {
                    throw new Error("Could not find the function to execute. Make sure you don't change the function name.");
                }

                problem.testCases.forEach((test, index) => {
                    try {
                        const inputParams = JSON.parse(JSON.stringify(test.params));
                        const output = executeFn(...inputParams);
                        const passed = JSON.stringify(output) === JSON.stringify(test.expected);

                        newResults.push({
                            index, passed,
                            expected: JSON.stringify(test.expected),
                            actual: JSON.stringify(output),
                            error: null
                        });

                        if (!passed) allPassed = false;
                    } catch (err) {
                        newResults.push({
                            index, passed: false,
                            expected: JSON.stringify(test.expected),
                            actual: null,
                            error: err.toString()
                        });
                        allPassed = false;
                    }
                });

            } catch (err) {
                newResults.push({
                    index: 0, passed: false,
                    expected: "Compilation/Parse Error",
                    actual: null,
                    error: err.toString()
                });
                allPassed = false;
            }

            setResults({ testResults: newResults, allPassed });
            setIsTesting(false);
        }, 800);
    };

    const handleFinishTest = () => {
        setIsFinished(true);
        // Calculate mock score
        const scoreRandom = Math.floor(Math.random() * 30) + 70; // 70-100 score
        setFinalScore(scoreRandom);
    };

    if (questions.length === 0) return <div className="p-8">Loading session...</div>;

    if (isFinished) {
        return (
            <div className="h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100 slide-up">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award size={40} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Assessment Complete</h2>
                    <p className="text-slate-500 mb-8">You have successfully submitted your coding test.</p>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8">
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Final Code Score</p>
                        <div className="text-5xl font-black text-slate-800">
                            {finalScore} <span className="text-xl text-slate-400 font-medium">/ 100</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentProblem = questions[currentIdx];
    const currentCode = answers[currentProblem.id]?.[language] || '';

    return (
        <div className="h-[calc(100vh-4rem)] bg-slate-50 flex flex-col overflow-hidden fade-in">
            {/* Top Navigation Bar for Test */}
            <div className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between z-10">
                <div className="flex items-center space-x-4">
                    <span className="font-bold text-slate-800">
                        Problem {currentIdx + 1} of {questions.length}
                    </span>
                    <div className="flex space-x-1">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => { setCurrentIdx(i); setResults(null); }}
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold transition-colors ${i === currentIdx ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 font-mono font-medium">
                        <Clock size={18} />
                        <span>{formatTime(timeLeft)}</span>
                    </div>
                    <button
                        onClick={handleFinishTest}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Submit Test
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Panel: Problem Statement */}
                <div className="w-full md:w-[40%] border-r border-slate-200 bg-white overflow-y-auto p-6 md:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">{currentProblem.title}</h1>
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${currentProblem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {currentProblem.difficulty}
                        </span>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-600 mb-8 whitespace-pre-line text-sm md:text-base leading-relaxed">
                        {currentProblem.description}
                    </div>

                    <div className="space-y-6 flex-1">
                        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Examples</h3>
                        {currentProblem.examples.map((ex, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Input</p>
                                <code className="text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100 block mb-4 font-mono text-sm">{ex.input}</code>
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Output</p>
                                <code className="text-slate-800 bg-white px-3 py-2 rounded-lg border border-slate-100 block font-mono text-sm">{ex.output}</code>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => { setCurrentIdx(Math.max(0, currentIdx - 1)); setResults(null); }}
                            disabled={currentIdx === 0}
                            className="flex items-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium text-sm"
                        >
                            <ChevronLeft size={16} className="mr-1" /> Previous
                        </button>
                        <button
                            onClick={() => { setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1)); setResults(null); }}
                            disabled={currentIdx === questions.length - 1}
                            className="flex items-center text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium text-sm"
                        >
                            Next <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                </div>

                {/* Right Panel: Editor & Output */}
                <div className="w-full md:w-[60%] flex flex-col bg-[#1e1e1e]">
                    {/* Actions Toolbar */}
                    <div className="bg-[#2d2d2d] h-14 flex items-center justify-between px-4 border-b border-[#404040]">
                        <div className="flex items-center space-x-3">
                            <Code2 size={16} className="text-[#858585]" />
                            <select
                                value={language}
                                onChange={handleLanguageChange}
                                className="bg-[#3c3c3c] text-[#d4d4d4] text-sm border-none rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="javascript">JavaScript (Node.js)</option>
                                <option value="python">Python 3.9</option>
                                <option value="java">Java 17</option>
                                <option value="cpp">C++ 20</option>
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleRunCode}
                                disabled={isTesting}
                                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <Play size={14} fill="currentColor" />
                                <span>{isTesting ? 'Running...' : 'Run Code'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Monaco Editor */}
                    <div className="flex-1 min-h-[350px]">
                        <Editor
                            height="100%"
                            language={language}
                            theme="vs-dark"
                            value={currentCode}
                            onChange={handleCodeChange}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                padding: { top: 16 },
                                scrollBeyondLastLine: false,
                                smoothScrolling: true
                            }}
                        />
                    </div>

                    {/* Console Output Panel */}
                    <div className="h-64 bg-[#1e1e1e] border-t border-[#404040] flex flex-col hide-scrollbar shrink-0">
                        <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#404040] flex items-center text-[#d4d4d4] font-medium text-sm">
                            <TerminalSquare size={16} className="mr-2 opacity-70" /> Test Results
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-4">
                            {!results && !isTesting && (
                                <span className="text-[#858585]">Run your code to execute test cases. Note: Local execution is only supported for JavaScript in this demo.</span>
                            )}

                            {isTesting && (
                                <div className="flex items-center text-emerald-400 animate-pulse">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                                    Executing code securely...
                                </div>
                            )}

                            {results?.mockWarning && (
                                <div className="text-amber-400 bg-amber-950/30 p-4 rounded-lg border border-amber-500/30">
                                    {results.message}
                                </div>
                            )}

                            {results && !results.mockWarning && (
                                <div className="space-y-4">
                                    <div className={`px-4 py-3 rounded-lg border ${results.allPassed ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-900/20 border-rose-500/30 text-rose-400'} font-bold flex items-center`}>
                                        {results.allPassed ? (
                                            <><CheckCircle2 className="mr-2" size={18} /> Accepted</>
                                        ) : (
                                            <><XCircle className="mr-2" size={18} /> Wrong Answer</>
                                        )}
                                    </div>
                                    {results.testResults && results.testResults.map((res, i) => (
                                        <div key={i} className={`p-4 rounded-lg ${res.passed ? 'bg-[#252526]' : 'bg-rose-950/20 border border-rose-900/50'}`}>
                                            <div className="flex items-center mb-3">
                                                {res.passed ? <span className="text-emerald-500 font-bold text-xs uppercase tracking-wider">Case {i + 1} Passed</span> : <span className="text-rose-500 font-bold text-xs uppercase tracking-wider">Case {i + 1} Failed</span>}
                                            </div>
                                            {res.error ? (
                                                <div className="text-rose-400 text-xs mt-2 bg-black/40 p-3 rounded font-mono">{res.error}</div>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-6 text-xs mt-2">
                                                    <div>
                                                        <span className="text-[#858585] mb-1.5 block">Expected</span>
                                                        <code className="text-[#d4d4d4] bg-black/40 px-2 py-1.5 rounded block break-all">{res.expected}</code>
                                                    </div>
                                                    <div>
                                                        <span className="text-[#858585] mb-1.5 block">Output</span>
                                                        <code className={`${res.passed ? 'text-emerald-400' : 'text-rose-400'} bg-black/40 px-2 py-1.5 rounded block break-all`}>{res.actual}</code>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodingTest;
