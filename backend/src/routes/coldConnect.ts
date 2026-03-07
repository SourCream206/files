import { Router } from 'express';
import { pool } from '../db/schema';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { getColdConnectSuggestions } from '../services/aiService';
import { SAMPLE_EVENTS } from '../data/events';

const router = Router();

router.get('/', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const profileResult = await pool.query(
      `SELECT name, university, major, graduation_year AS "graduationYear",
              skills, target_industries AS "targetIndustries",
              target_companies AS "targetCompanies",
              career_interests AS "careerInterests"
       FROM users WHERE id = $1`,
      [userId],
    );
    const row = profileResult.rows[0];
    if (!row) return res.status(404).json({ message: 'Profile not found' });

    const userProfile = {
      name: row.name,
      university: row.university,
      major: row.major,
      graduationYear: row.graduationYear,
      skills: row.skills || [],
      targetIndustries: row.targetIndustries || [],
      targetCompanies: row.targetCompanies || [],
      careerInterests: row.careerInterests,
    };

    const { internships, peopleToConnect } = await getColdConnectSuggestions(userProfile);

    return res.json({
      internships,
      peopleToConnect,
      events: SAMPLE_EVENTS,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load Cold Connect data' });
  }
});

export default router;
