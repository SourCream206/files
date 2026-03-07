import { Router } from 'express';
import { pool } from '../db/schema';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { analyzeNetworkingConnection, generateNetworkingStrategy } from '../services/aiService';

const router = Router();

router.post('/analyze', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { linkedinUrl, conversationNotes } = req.body || {};
  if (!linkedinUrl) {
    return res.status(400).json({ message: 'linkedinUrl is required' });
  }

  try {
    const userResult = await pool.query(
      `SELECT name, university, major, graduation_year AS "graduationYear",
              skills, target_industries AS "targetIndustries",
              target_companies AS "targetCompanies",
              career_interests AS "careerInterests",
              linkedin, github
       FROM users WHERE id = $1`,
      [userId],
    );

    if (!userResult.rowCount) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    const user = userResult.rows[0];
    const analysis = await analyzeNetworkingConnection(linkedinUrl, user);
    const strategyText = await generateNetworkingStrategy([analysis], user);

    const insertResult = await pool.query(
      `INSERT INTO networking_analyses (
         user_id, linkedin_url, person_data, conversation_notes, generated_strategy
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [userId, linkedinUrl, analysis, conversationNotes || null, { plan: strategyText }],
    );

    return res.json({
      id: insertResult.rows[0].id,
      createdAt: insertResult.rows[0].created_at,
      analysis,
      strategy: strategyText,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to analyze networking connection' });
  }
});

router.get('/history', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const result = await pool.query(
      `SELECT id, linkedin_url AS "linkedinUrl", person_data AS "personData",
              generated_strategy AS "generatedStrategy",
              created_at
       FROM networking_analyses
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId],
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch history' });
  }
});

export default router;

