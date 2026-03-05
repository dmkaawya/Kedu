import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password, role, schoolId, profile } = req.body;

    // Check if user exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    // Create user
    const user = await User.create({
      email,
      username,
      password,
      role,
      schoolId,
      profile
    });

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Find user by email OR username
    let query = {};
    if (email) query.email = email;
    else if (username) query.username = username;
    else if (req.body.login) {
      // General login field support
      query = { $or: [{ email: req.body.login }, { username: req.body.login }] };
    } else {
      return res.status(400).json({ message: 'Email or Username required' });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        schoolId: user.schoolId,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
