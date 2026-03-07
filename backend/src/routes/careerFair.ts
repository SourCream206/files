import { Router } from 'express';
import { pool } from '../db/schema';
import { authMiddleware, AuthedRequest } from '../middleware/auth';
import { analyzeCareerFair, extractCompaniesFromPageText } from '../services/aiService';

const router = Router();

router.post('/extract-companies', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { url } = req.body || {};
  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ message: 'url is required', success: false });
  }

  const trimmedUrl = url.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) {
    return res.json({
      success: false,
      companies: [],
      message: 'Please enter a valid URL (e.g. https://example.com/career-fair).',
    });
  }

  try {
    const response = await fetch(trimmedUrl, {
      headers: { 'User-Agent': 'FairGame-Bot/1.0 (career-fair company extraction)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return res.json({
        success: false,
        companies: [],
        message: `Could not load the page (${response.status}). Please enter company names manually below.`,
      });
    }
    const html = await response.text();
    const companies = await extractCompaniesFromPageText(html);
    if (companies.length === 0) {
      return res.json({
        success: false,
        companies: [],
        message: 'No companies could be detected from this page. Please enter company names manually below.',
      });
    }
    return res.json({ success: true, companies, message: `Found ${companies.length} companies.` });
  } catch (err) {
    console.error('extract-companies fetch error', err);
    return res.json({
      success: false,
      companies: [],
      message: 'Could not fetch the link (check URL or try again). Please enter company names manually below.',
    });
  }
});

router.post('/analyze', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { companies, eventName } = req.body || {};
  if (!Array.isArray(companies) || !companies.length) {
    return res.status(400).json({ message: 'companies must be a non-empty array of names' });
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
    const analysis = await analyzeCareerFair(companies, user);

    await pool.query(
      `INSERT INTO career_fair_events (user_id, event_name, company_list, analysis_results)
       VALUES ($1, $2, $3, $4)`,
      [userId, eventName || null, companies, analysis],
    );

    return res.json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to analyze career fair' });
  }
});

router.get('/history', authMiddleware, async (req: AuthedRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const result = await pool.query(
      `SELECT id, event_name AS "eventName", company_list AS companies,
              analysis_results AS analysis, created_at
       FROM career_fair_events
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

