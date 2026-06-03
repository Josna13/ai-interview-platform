const pdfParse = require('pdf-parse');

const extractSkills = (text) => {
    // Mock simple AI extraction based on keywords
    const keywords = [
        'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'Express',
        'TypeScript', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
        'Kubernetes', 'HTML', 'CSS', 'Redux', 'Angular', 'Vue', 'Spring Boot',
        'Django', 'Flask', 'Machine Learning', 'Data Science', 'Azure'
    ];

    const extracted = [];
    const textLower = text.toLowerCase();

    keywords.forEach(keyword => {
        if (textLower.includes(keyword.toLowerCase())) {
            extracted.push(keyword);
        }
    });

    return extracted.length > 0 ? extracted : ['General Programming', 'Problem Solving'];
};

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Parse PDF buffer
        const pdfData = await pdfParse(req.file.buffer);
        const text = pdfData.text || '';

        // Extract skills
        const skills = extractSkills(text);

        res.status(200).json({
            message: 'Resume parsed successfully',
            skills: skills
        });

    } catch (error) {
        console.error('Error parsing resume:', error);
        res.status(500).json({ message: 'Error processing resume' });
    }
};

module.exports = {
    uploadResume
};
