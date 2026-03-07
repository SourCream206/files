import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/schema';

const router = Router();

const normalizeArrayField = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

router.post('/signup', async (req, res) => {
  const {
    name,
    email,
    password,
    university,
    major,
    graduationYear,
    linkedin,
    github,
    portfolio,
    skills,
    careerInterests,
    targetCompanies,
    targetIndustries,
  } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const client = await pool.connect();
    try {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rowCount) {
        return res.status(400).json({ message: 'Email already in use' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await client.query(
        `INSERT INTO users (
          name, email, password_hash, university, major, graduation_year,
          linkedin, github, portfolio,
          skills, target_industries, target_companies, career_interests
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9,
          $10, $11, $12, $13
        )
        RETURNING id, name, email, university, major, graduation_year AS "graduationYear",
                  linkedin, github, portfolio, skills, target_industries AS "targetIndustries",
                  target_companies AS "targetCompanies", career_interests AS "careerInterests"`,
        [
          name,
          email,
          passwordHash,
          university || null,
          major || null,
          graduationYear || null,
          linkedin || null,
          github || null,
          portfolio || null,
          normalizeArrayField(skills),
          normalizeArrayField(targetIndustries),
          normalizeArrayField(targetCompanies),
          careerInterests || null,
        ],
      );

      const user = result.rows[0];
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
      return res.status(201).json({ token, user });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to sign up' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, name, email, password_hash, university, major, graduation_year AS "graduationYear", linkedin, github, portfolio, skills, target_industries AS "targetIndustries", target_companies AS "targetCompanies", career_interests AS "careerInterests" FROM users WHERE email = $1',
        [email],
      );

      if (!result.rowCount) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const user = result.rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET not configured');
      }

      const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });
      delete user.password_hash;
      return res.json({ token, user });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to login' });
  }
});

export default router;

