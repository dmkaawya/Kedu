const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/kedu', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
});
const User = mongoose.model('User', userSchema);

// Category Schema
const videoSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: true }
});

const categorySchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    videos: [videoSchema]
});
const Category = mongoose.model('Category', categorySchema);

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access token required' });

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Initialize default users
async function initializeUsers() {
    const users = [
        { username: 'admin', password: 'admin123' },
        { username: 'teacher', password: 'teach2025' }
    ];

    for (const user of users) {
        const existingUser = await User.findOne({ username: user.username });
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await User.create({ username: user.username, password: hashedPassword, role: 'admin' });
        }
    }
    console.log('Default users initialized');
}

// Initialize default categories
async function initializeCategories() {
    const categories = [
        {
            id: 1,
            name: 'Mathematics',
            description: 'From basic arithmetic to advanced calculus',
            videos: [
                { id: 1, title: 'Introduction to Algebra', url: 'https://www.youtube.com/embed/NybHckSEQBI', description: 'Learn the fundamentals of algebra with clear explanations and examples.' },
                { id: 2, title: 'Calculus Basics', url: 'https://www.youtube.com/embed/WUvTyaaNkzM', description: 'Understanding derivatives and integrals made simple.' }
            ]
        },
        {
            id: 2,
            name: 'Science',
            description: 'Physics, Chemistry, and Biology explained simply',
            videos: [
                { id: 3, title: 'Newton\'s Laws of Motion', url: 'https://www.youtube.com/embed/kKKM8Y-u7ds', description: 'Explore the three fundamental laws that govern motion.' },
                { id: 4, title: 'The Periodic Table', url: 'https://www.youtube.com/embed/rz4Dd1I_fX0', description: 'Understanding the organization of elements in chemistry.' }
            ]
        },
        {
            id: 3,
            name: 'History',
            description: 'Journey through time and learn from the past',
            videos: [
                { id: 5, title: 'World War 2 Overview', url: 'https://www.youtube.com/embed/Q78COTwT7nE', description: 'A comprehensive overview of the Second World War.' }
            ]
        }
    ];

    const count = await Category.countDocuments();
    if (count === 0) {
        await Category.insertMany(categories);
        console.log('Default categories initialized');
    }
}

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ username: user.username, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new category
app.post('/api/categories', authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) return res.status(400).json({ message: 'All fields are required' });

    try {
        const lastCategory = await Category.findOne().sort({ id: -1 });
        const newId = lastCategory ? lastCategory.id + 1 : 1;
        const category = new Category({ id: newId, name, description, videos: [] });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new video
app.post('/api/videos', authenticateToken, async (req, res) => {
    const { categoryId, title, url, description } = req.body;
    if (!categoryId || !title || !url || !description) return res.status(400).json({ message: 'All fields are required' });

    try {
        const category = await Category.findOne({ id: categoryId });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const lastVideo = category.videos.length > 0 ? category.videos[category.videos.length - 1] : null;
        const newId = lastVideo ? lastVideo.id + 1 : 1;
        const embedUrl = convertToEmbedUrl(url);
        if (!embedUrl) return res.status(400).json({ message: 'Invalid YouTube URL' });

        category.videos.push({ id: newId, title, url: embedUrl, description });
        await category.save();
        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Convert YouTube URL to embed format
function convertToEmbedUrl(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// Initialize data and start server
async function startServer() {
    await initializeUsers();
    await initializeCategories();
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

startServer();
