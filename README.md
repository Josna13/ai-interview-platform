# AI-Powered Technical Interview Platform

## 1. Overview

The AI-Powered Technical Interview Platform is a full-stack web application designed to simulate real-world technical interviews. The platform helps students and job seekers improve their interview skills through AI-driven mock interviews, coding assessments, resume analysis, emotion detection, and detailed performance feedback.

The system combines interview preparation, coding evaluation, facial expression analysis, and interview analytics in a single platform.

---

## 2. Features

### 2.1 Candidate Features

* User Registration and Login
* Resume Upload and Parsing
* Resume-Based Question Generation
* Voice-Based Interview Sessions
* Speech-to-Text Transcription
* Interactive Coding Environment
* Interview History Tracking
* Performance Analytics

### 2.2 AI and Proctoring Features

* Facial Expression Detection
* Emotion Analysis
* Face Tracking and Monitoring
* Webcam Recording
* Confidence Assessment
* Communication Analysis

### 2.3 Analytics and Feedback

* Technical Performance Score
* Communication Score
* Confidence Score
* Detailed Interview Feedback
* Video Replay System
* Interview Timeline Analysis

---

## 3. Technology Stack

### 3.1 Frontend

* React.js
* Vite
* React Router DOM
* Tailwind CSS
* Axios
* Monaco Editor
* TensorFlow.js
* Face API.js

### 3.2 Backend

* Node.js
* Express.js
* JWT Authentication
* BcryptJS
* Multer
* PDF Parse

### 3.3 Database

* MySQL

---

## 4. Project Structure

```text
ai-interview-platform/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── initDB.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│
└── download_models.js
```

---

## 5. AI Technologies Used

### 5.1 Face Detection and Emotion Analysis

The platform uses Face API.js with TensorFlow.js for real-time facial expression recognition and monitoring.

### 5.2 Models Used

* Tiny Face Detector Model
* Face Expression Recognition Model

### 5.3 Why These Models?

* Real-time browser-based execution
* Low latency and fast performance
* Enhanced user privacy
* Reduced server workload
* Accurate emotion and facial tracking

---

## 6. Core Modules

### 6.1 Authentication Module

* User Registration
* Secure Login
* JWT-Based Authentication

### 6.2 Resume Analysis Module

* Resume Upload
* PDF Parsing
* Skill Extraction

### 6.3 Interview Module

* AI Interview Sessions
* Custom Interview Rooms
* Voice-Based Questions
* Response Evaluation

### 6.4 Coding Assessment Module

* Online Coding Environment
* Real-Time Code Writing
* Technical Skill Evaluation

### 6.5 Analytics Module

* Interview Reports
* Performance Tracking
* Historical Analysis
* Video Replay

---

## 7. Installation and Setup

### 7.1 Clone the Repository

```bash
git clone <repository-url>
cd ai-interview-platform
```

### 7.2 Backend Setup

```bash
cd backend
npm install
```

Configure the `.env` file with MySQL database credentials and JWT secret.

Initialize the database:

```bash
node initDB.js
```

Start the backend server:

```bash
npm run dev
```

---

### 7.3 Download AI Models

From the project root directory:

```bash
node download_models.js
```

---

### 7.4 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 8. Security Features

* JWT Authentication
* Password Hashing with BcryptJS
* Protected Routes
* Secure File Upload Handling
* Input Validation

---

## 9. Project Objective

The primary objective of this project is to help students and job seekers prepare for technical interviews through AI-powered mock interviews, coding assessments, behavior analysis, and personalized performance feedback.

---

## 10. Future Enhancements

1. AI-Based Interview Question Generation using LLMs
2. Advanced Speech Analysis
3. Multi-Language Interview Support
4. Live Interview Collaboration
5. Cloud Video Storage
6. Recruitment Dashboard for Companies

---

## 11. Developed Using

* React.js
* Vite
* Node.js
* Express.js
* MySQL
* TensorFlow.js
* Face API.js
* Monaco Editor

---

## 12. License

This project is developed for educational and academic purposes.
