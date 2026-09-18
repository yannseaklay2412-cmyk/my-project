import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createAcc,
  getAllUsers as fetchAllUsers,
  getUserByEmail,
  getUserById,
  updateUserProfile,
} from '../models/User.js';

export async function createAccount(req, res) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = full_name.trim();

  try {
    // 1. Fast direct indexed DB lookup before doing expensive password hashing
    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // 2. Hash password ONLY after confirming user does not already exist
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createAcc(trimmedName, normalizedEmail, hashedPassword);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await fetchAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const secret = process.env.JWT_SECRET || 'c8f1a27e94b30d65e712a83f95b0c41872e4d96a5b3c1082f76e4d29a15b8390';
    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        university: user.university,
        major: user.major,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getUserProfile(req, res) {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  const { bio, university, year, major, github_url, skills } = req.body;

  try {
    const updatedUser = await updateUserProfile(req.user.id, {
      bio,
      university,
      year,
      major,
      github_url,
      skills,
    });
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
