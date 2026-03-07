import { Router } from 'express';
import { pool } from '../db/schema';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { parseResume } from '../services/aiService';

const router = Router();

router.get('/profile', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const result = await pool.query(
      `SELECT id, name, email, university, major, graduation_year AS "graduationYear",
              linkedin, github, portfolio,
              skills, target_industries AS "targetIndustries",
              target_companies AS "targetCompanies",
              career_interests AS "careerInterests",
              resume_text AS "resumeText",
              created_at, updated_at
       FROM users WHERE id = $1`,
      [userId],
    );
    if (!result.rowCount) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const {
    name,
    university,
    major,
    graduationYear,
    linkedin,
    github,
    portfolio,
    skills,
    targetIndustries,
    targetCompanies,
    careerInterests,
    resumeText,
  } = req.body || {};

  const normalizeArray = (value: unknown): string[] | null => {
    if (value === undefined) return null;
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

  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET
          name = COALESCE($2, name),
          university = COALESCE($3, university),
          major = COALESCE($4, major),
          graduation_year = COALESCE($5, graduation_year),
          linkedin = COALESCE($6, linkedin),
          github = COALESCE($7, github),
          portfolio = COALESCE($8, portfolio),
          skills = COALESCE($9, skills),
          target_industries = COALESCE($10, target_industries),
          target_companies = COALESCE($11, target_companies),
          career_interests = COALESCE($12, career_interests),
          resume_text = COALESCE($13, resume_text),
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, name, email, university, major, graduation_year AS "graduationYear",
                  linkedin, github, portfolio,
                  skills, target_industries AS "targetIndustries",
                  target_companies AS "targetCompanies",
                  career_interests AS "careerInterests",
                  resume_text AS "resumeText",
                  created_at, updated_at`,
        [
          userId,
          name ?? null,
          university ?? null,
          major ?? null,
          graduationYear ?? null,
          linkedin ?? null,
          github ?? null,
          portfolio ?? null,
          normalizeArray(skills),
          normalizeArray(targetIndustries),
          normalizeArray(targetCompanies),
          careerInterests ?? null,
          resumeText ?? null,
        ],
      );

      return res.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

router.post('/parse-resume', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { resumeText } = req.body || {};
  if (typeof resumeText !== 'string' || !resumeText.trim()) {
    return res.status(400).json({ message: 'resumeText is required' });
  }

  try {
    const parsed = await parseResume(resumeText.trim());
    return res.json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to parse resume' });
  }
});

export default router;

