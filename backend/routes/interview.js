const express = require('express');
const router = express.Router();
const {
    startInterview,
    submitAnswer,
    updateInterviewScores,
    getInterviews,
    getInterviewDetails,
    getUserAnalytics
} = require('../controllers/interviewController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .post(startInterview)
    .get(getInterviews);

router.post('/answers', submitAnswer);
router.put('/:id/scores', updateInterviewScores);
router.get('/analytics/stats', getUserAnalytics);
router.get('/:id', getInterviewDetails);

module.exports = router;
