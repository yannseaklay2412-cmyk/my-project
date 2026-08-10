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
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUsers = await fetchAllUsers();
    if (existingUsers.find(user => user.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = await createAcc(full_name, email, hashedPassword);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
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

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, full_name: user.full_name, email: user.email },
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
