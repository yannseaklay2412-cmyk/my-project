import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export const createAcc = async (full_name, email, hashedPassword) => {
  const query = 'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
  const values = [full_name, email, hashedPassword];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getAllUsers = async () => {
  const query = 'SELECT id, username, email, created_at FROM users';
  const result = await pool.query(query);
  return result.rows;
};

export const getUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const values = [email];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const getUserById = async (id) => {
  const query =
    'SELECT id, full_name, email, bio, university, year, major, github_url, skills, created_at FROM users WHERE id = $1';
  const values = [id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

export const updateUserProfile = async (id, { bio, university, year, major, github_url, skills }) => {
  const query = `
    UPDATE users
    SET bio = $1, university = $2, year = $3, major = $4, github_url = $5, skills = $6
    WHERE id = $7
    RETURNING id, username, email, bio, university, year, major, github_url, skills, created_at
  `;
  const values = [bio, university, year, major, github_url, skills, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

