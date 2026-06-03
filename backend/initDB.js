const mysql = require('mysql2/promise');

async function initializeDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Default for XAMPP
        });

        console.log('Connected to MySQL. Creating database and tables...');

        await connection.query('CREATE DATABASE IF NOT EXISTS ai_interview_db;');
        await connection.query('USE ai_interview_db;');

        // Users Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Interviews Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS Interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        interview_type VARCHAR(255) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        technical_score INT DEFAULT 0,
        confidence_score INT DEFAULT 0,
        communication_score INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
      );
    `);

        // Answers Table
        await connection.query(`
      CREATE TABLE IF NOT EXISTS Answers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        interview_id INT NOT NULL,
        question TEXT NOT NULL,
        answer_text TEXT NOT NULL,
        feedback TEXT NOT NULL,
        FOREIGN KEY (interview_id) REFERENCES Interviews(id) ON DELETE CASCADE
      );
    `);

        console.log('Database and tables initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeDB();
