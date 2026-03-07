import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});

export const createTables = async () => {
  const client = await pool.connect();
  try {
    // ensure UUID generator exists
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        university VARCHAR(255),
        major VARCHAR(255),
        graduation_year VARCHAR(10),
        linkedin VARCHAR(500),
        github VARCHAR(500),
        portfolio VARCHAR(500),
        skills TEXT[] DEFAULT '{}',
        target_industries TEXT[] DEFAULT '{}',
        target_companies TEXT[] DEFAULT '{}',
        career_interests TEXT,
        resume_text TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS resume_text TEXT;

      CREATE TABLE IF NOT EXISTS career_fair_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_name VARCHAR(255),
        company_list TEXT[] NOT NULL,
        analysis_results JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS networking_analyses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        linkedin_url VARCHAR(500),
        person_data JSONB,
        conversation_notes TEXT,
        generated_strategy JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS follow_ups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        context_type VARCHAR(50),
        context_data JSONB,
        generated_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Database tables ready');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    client.release();
  }
};