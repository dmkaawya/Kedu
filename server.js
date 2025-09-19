const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'kedu.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Lessons table
    db.run(`CREATE TABLE IF NOT EXISTS lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Videos table
    db.run(`CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_id INTEGER,
        title TEXT NOT NULL,
        youtube_url TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    )`);

    // Create default admin user
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR REPLACE INTO users (id, username, password, email, role) 
            VALUES (1, 'admin', ?, 'dmkaawya@gmail.com', 'admin')`, [hashedPassword]);

    // Insert sample data
    insertSampleData();
});

function insertSampleData() {
    // Sample categories
    const categories = [
        { name: 'Mathematics', description: 'Learn mathematical concepts from basic to advanced levels' },
        { name: 'Science', description: 'Explore physics, chemistry, and biology' },
        { name: 'History', description: 'Discover world history and Sri Lankan heritage' },
        { name: 'English', description: 'Improve your English language skills' },
        { name: 'Technology', description: 'Learn about computers and modern technology' }
    ];

    categories.forEach(category => {
        db.run(`INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)`, 
               [category.name, category.description]);
    });

    // Sample lessons
    const lessons = [
        { category_id: 1, title: 'Basic Algebra', description: 'Introduction to algebraic expressions and equations' },
        { category_id: 1, title: 'Geometry', description: 'Learn about shapes, angles, and measurements' },
        { category_id: 1, title: 'Calculus', description: 'Advanced mathematical concepts and derivatives' },
        
        { category_id: 2, title: 'Physics Basics', description: 'Fundamental concepts in physics' },
        { category_id: 2, title: 'Chemistry Elements', description: 'Periodic table and chemical reactions' },
        { category_id: 2, title: 'Biology Cells', description: 'Understanding cellular structure and function' },
        
        { category_id: 3, title: 'World Wars', description: 'History of the two world wars' },
        { category_id: 3, title: 'Sri Lankan History', description: 'Ancient and modern history of Sri Lanka' },
        
        { category_id: 4, title: 'Grammar Basics', description: 'Essential English grammar rules' },
        { category_id: 4, title: 'Vocabulary Building', description: 'Expand your English vocabulary' },
        
        { category_id: 5, title: 'Programming Basics', description: 'Introduction to computer programming' },
        { category_id: 5, title: 'Web Development', description: 'Learn HTML, CSS, and JavaScript' }
    ];

    lessons.forEach(lesson => {
        db.run(`INSERT OR IGNORE INTO lessons (category_id, title, description) VALUES (?, ?, ?)`, 
               [lesson.category_id, lesson.title, lesson.description]);
    });

    // Sample videos
    const videos = [
        { lesson_id: 1, title: 'Introduction to Algebra', youtube_url: 'https://www.youtube.com/watch?v=NybHckSEQBI', description: 'Learn the basics of algebra' },
        { lesson_id: 1, title: 'Solving Linear Equations', youtube_url: 'https://www.youtube.com/watch?v=9DqtN7Q4648', description: 'Step by step equation solving' },
        { lesson_id: 1, title: 'Quadratic Equations', youtube_url: 'https://www.youtube.com/watch?v=i7idZfS8t8w', description: 'Understanding quadratic formulas' },
        
        { lesson_id: 2, title: 'Basic Geometry', youtube_url: 'https://www.youtube.com/watch?v=2xyMn-e-q6A', description: 'Introduction to geometric shapes' },
        { lesson_id: 2, title: 'Area and Perimeter', youtube_url: 'https://www.youtube.com/watch?v=qJGfmXX-6Tk', description: 'Calculate area and perimeter' },
        
        { lesson_id: 4, title: 'Physics Introduction', youtube_url: 'https://www.youtube.com/watch?v=ZM8ECpBuQYE', description: 'What is physics?' },
        { lesson_id: 4, title: 'Motion and Forces', youtube_url: 'https://www.youtube.com/watch?v=5-LjIrJGcEg', description: 'Understanding motion and forces' },
        
        { lesson_id: 11, title: 'HTML Basics', youtube_url: 'https://www.youtube.com/watch?v=UB1O30fR-EE', description: 'Learn HTML fundamentals' },
        { lesson_id: 11, title: 'CSS Styling', youtube_url: 'https://www.youtube.com/watch?v=yfoY53QXEnI', description: 'Style your web pages' },
        { lesson_id: 11, title: 'JavaScript Basics', youtube_url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', description: 'Programming for the web' }
    ];

    videos.forEach(video => {
        db.run(`INSERT OR IGNORE INTO videos (lesson_id, title, youtube_url, description) VALUES (?, ?, ?, ?)`, 
               [video.lesson_id, video.title, video.youtube_url, video.description]);
    });
}

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.
