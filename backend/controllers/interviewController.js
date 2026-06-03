const db = require('../config/db');

// Expanded pool of questions per role
const QUESTION_POOL = {
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

// Helper function to get random questions
const getRandomQuestions = (type, count = 5) => {
    const pool = QUESTION_POOL[type] || QUESTION_POOL['Frontend Developer'];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// @desc    Create new interview
// @route   POST /api/interviews
// @access  Private
const startInterview = async (req, res) => {
    const { interview_type } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO Interviews (user_id, interview_type) VALUES (?, ?)',
            [req.user.id, interview_type]
        );

        const questions = getRandomQuestions(interview_type);

        res.status(201).json({
            id: result.insertId,
            user_id: req.user.id,
            interview_type,
            questions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Submit an answer
// @route   POST /api/interviews/answers
// @access  Private
const submitAnswer = async (req, res) => {
    const { interview_id, question, answer_text, feedback } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO Answers (interview_id, question, answer_text, feedback) VALUES (?, ?, ?, ?)',
            [interview_id, question, answer_text, feedback]
        );

        res.status(201).json({ id: result.insertId, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update interview scores
// @route   PUT /api/interviews/:id/scores
// @access  Private
const updateInterviewScores = async (req, res) => {
    const { technical_score, confidence_score, communication_score } = req.body;

    try {
        await db.query(
            'UPDATE Interviews SET technical_score = ?, confidence_score = ?, communication_score = ? WHERE id = ? AND user_id = ?',
            [technical_score, confidence_score, communication_score, req.params.id, req.user.id]
        );

        res.json({ message: 'Scores updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all interviews for a user
// @route   GET /api/interviews
// @access  Private
const getInterviews = async (req, res) => {
    try {
        const [interviews] = await db.query(
            'SELECT * FROM Interviews WHERE user_id = ? ORDER BY date DESC',
            [req.user.id]
        );

        res.json(interviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single interview details including answers
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewDetails = async (req, res) => {
    try {
        const [interviews] = await db.query(
            'SELECT * FROM Interviews WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (interviews.length === 0) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        const [answers] = await db.query(
            'SELECT * FROM Answers WHERE interview_id = ?',
            [req.params.id]
        );

        res.json({
            ...interviews[0],
            answers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get user analytics
// @route   GET /api/interviews/analytics/stats
// @access  Private
const getUserAnalytics = async (req, res) => {
    try {
        const [stats] = await db.query(
            'SELECT AVG(technical_score) as avg_technical, AVG(confidence_score) as avg_confidence, AVG(communication_score) as avg_communication, COUNT(id) as total_interviews FROM Interviews WHERE user_id = ? AND technical_score > 0',
            [req.user.id]
        );

        res.json(stats[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { startInterview, submitAnswer, updateInterviewScores, getInterviews, getInterviewDetails, getUserAnalytics };
