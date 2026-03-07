import { Router } from 'express';
import { pool } from '../db/schema';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { generateFollowUp } from '../services/aiService';

const router = Router();

router.post('/', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { type, company, person, conversationNotes } = req.body || {};
  if (!type || !conversationNotes) {
    return res.status(400).json({ message: 'type and conversationNotes are required' });
  }

  if (!['career_fair', 'linkedin', 'email'].includes(type)) {
    return res.status(400).json({ message: 'Invalid follow-up type' });
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
    const followUp = await generateFollowUp({
      type,
      company,
      person,
      conversationNotes,
      userProfile: user,
    });

    await pool.query(
      `INSERT INTO follow_ups (user_id, context_type, context_data, generated_message)
       VALUES ($1, $2, $3, $4)`,
      [userId, type, { company, person, conversationNotes }, followUp],
    );

    return res.json({ followUp });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate follow-up' });
  }
});

export default router;

