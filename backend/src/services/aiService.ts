import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Configure to use a free OpenAI-compatible provider (e.g. Groq) via AI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  // Override base URL if you are using a different OpenAI-compatible endpoint
  baseURL: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
});

const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

// ─── Resume Parser ─────────────────────────────────────────────────────────

export interface ParsedResume {
  skills: string[];
  suggestedIndustries: string[];
  suggestedInterests: string[];
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const prompt = `You are a career coach. Extract structured data from this resume/bio text.

Resume/bio text:
---
${resumeText.slice(0, 8000)}
---

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "skills": ["Python", "React", "Distributed Systems", "..."],
  "suggestedIndustries": ["Fintech", "AI/ML", "..."],
  "suggestedInterests": ["Backend systems", "Developer tools", "..."]
}

- skills: 8–15 technical and soft skills (programming languages, tools, frameworks, teamwork, etc.)
- suggestedIndustries: 3–6 industries that fit this background
- suggestedInterests: 3–6 career interest areas (job types, domains, or problems they might want to work on)

Return only valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const clean = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(clean) as ParsedResume;
  } catch (err) {
    console.error('Failed to parse resume AI response', err, content);
    throw new Error('Could not parse resume');
  }
}

// ─── Extract companies from webpage text ────────────────────────────────────

export async function extractCompaniesFromPageText(pageText: string): Promise<string[]> {
  const prompt = `You are extracting a list of company/employer names from a career fair or event webpage.

Webpage text (may be messy HTML or plain text):
---
${pageText.slice(0, 12000)}
---

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "companies": ["Company A", "Company B", "Company C"]
}

- Include only company or employer names (no "Inc.", "LLC", etc. unless part of the name).
- Deduplicate and use consistent spelling.
- If you cannot find any company names, return: {"companies": []}
Return only valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 1500,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const clean = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    const out = JSON.parse(clean) as { companies?: string[] };
    return Array.isArray(out.companies) ? out.companies : [];
  } catch (err) {
    console.error('Failed to parse extract-companies AI response', err, content);
    return [];
  }
}

interface UserProfile {
  name: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  skills?: string[];
  targetIndustries?: string[];
  targetCompanies?: string[];
  careerInterests?: string;
  linkedin?: string;
  github?: string;
}

// ─── Career Fair Analysis ────────────────────────────────────────────────────

export async function analyzeCareerFair(companies: string[], userProfile: UserProfile) {
  const profileContext = `
User Profile:
- Name: ${userProfile.name}
- University: ${userProfile.university || 'Not specified'}
- Major: ${userProfile.major || 'Not specified'}
- Graduation Year: ${userProfile.graduationYear || 'Not specified'}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Target Industries: ${userProfile.targetIndustries?.join(', ') || 'Not specified'}
- Target Companies: ${userProfile.targetCompanies?.join(', ') || 'Not specified'}
- Career Interests: ${userProfile.careerInterests || 'Not specified'}
- GitHub: ${userProfile.github || 'Not provided'}
`;

  const prompt = `You are a career networking strategist. Analyze these companies for a career fair and match them to the user's profile.

${profileContext}

Companies at the career fair:
${companies.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "rankedCompanies": [
    {
      "rank": 1,
      "company": "Company Name",
      "score": 85,
      "description": "Brief 2-sentence company description and why they're relevant to this user",
      "roles": ["Software Engineer Intern", "ML Research Intern"],
      "talkingPoints": [
        "Mention your Python and distributed systems experience",
        "Ask about their infrastructure team's tech stack",
        "Reference your GitHub project on X"
      ],
      "suggestedQuestions": [
        "What does the internship onboarding look like?",
        "How does the team structure work for new engineers?"
      ]
    }
  ],
  "recommendedRoute": ["Company A", "Company B", "Company C"],
  "strategy": "Overall strategic advice for this specific fair in 2-3 sentences."
}

Score companies 0-100 based on: skill match (40%), industry alignment (30%), career interest fit (20%), hiring probability (10%).
Rank from highest to lowest score. The recommendedRoute should optimize for high-priority companies first, with logical physical flow.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const clean = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error('Failed to parse career fair AI response', err, content);
    throw new Error('AI response parsing failed for career fair analysis');
  }
}

// ─── Networking Analysis ─────────────────────────────────────────────────────
// We do NOT have access to real LinkedIn profile data (no scraping). The response
// must not invent a specific name, company, or title for the profile owner.

export async function analyzeNetworkingConnection(linkedinUrl: string, userProfile: UserProfile) {
  const profileContext = `
User (the person preparing to network) profile:
- Name: ${userProfile.name}
- Major: ${userProfile.major || 'Not specified'}
- Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
- Target Industries: ${userProfile.targetIndustries?.join(', ') || 'Not specified'}
- Target Companies: ${userProfile.targetCompanies?.join(', ') || 'Not specified'}
- Career Interests: ${userProfile.careerInterests || 'Not specified'}
`;

  const prompt = `You are a networking coach. The user has shared a LinkedIn profile URL. We do NOT have access to the actual profile content (no scraping). So you must NOT invent a specific name, job title, or company for the profile owner.

LinkedIn URL: ${linkedinUrl}

${profileContext}

Your task:
1. Acknowledge that we cannot see the real profile. Do not make up details about this person.
2. Give the USER (the one networking) a strategy and conversation prompts that work for reaching out to any professional they might find via this URL—personalized to the USER's skills and goals above.
3. Suggest what kinds of roles/industries to look for when they open the profile (e.g. "When you open their profile, note their current role and company; then use the prompts below.").
4. opportunityScore (0-100): rate how valuable doing outreach to a generic strong connection could be for this user's stated goals (not the fake profile). priorityRank: HIGH (>70), MEDIUM (40-70), LOW (<40).

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "personSummary": {
    "name": "Profile owner (check their page)",
    "title": "Check their LinkedIn for current role",
    "company": "Check their LinkedIn for current company",
    "industry": "Varies",
    "summary": "We don't have access to this profile. When you open the link, note their role and company, then use the strategy and conversation prompts below to prepare your outreach."
  },
  "opportunityScore": 72,
  "priorityRank": "HIGH",
  "potentialConnections": [
    {
      "name": "Their colleagues (after you view their profile)",
      "title": "Look for similar roles on their page",
      "company": "Same or related companies",
      "relevance": "Use the user's target industries and companies to decide who might be most useful to ask for intros to."
    }
  ],
  "conversationPrompts": [
    "When you view their profile: note their current role and 1-2 things you have in common (e.g. same school, similar skills).",
    "Open with a specific compliment or question about their work, then mention your interest in [user's career interests].",
    "Ask about their path into their current role or what they look for when hiring/connecting.",
    "Mention one of your projects or skills that fits their domain and ask for their perspective or advice."
  ],
  "networkingStrategy": "2-3 sentences: open the profile first, note their role and company, then use the prompts above. Tailor the first message to what you see (e.g. shared university, similar tech stack) so it doesn't feel generic."
}

potentialConnections: 2-3 generic placeholder entries that remind the user to look at the real profile for names. conversationPrompts: 3-5 actionable prompts personalized to the USER's skills and career interests. Do not fabricate any specific person's name, title, or company.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 1500,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const clean = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (err) {
    console.error('Failed to parse networking AI response', err, content);
    throw new Error('AI response parsing failed for networking analysis');
  }
}

// ─── Follow-up Generator ─────────────────────────────────────────────────────

export async function generateFollowUp(params: {
  type: 'career_fair' | 'linkedin' | 'email';
  company?: string;
  person?: { name: string; title: string; company: string };
  conversationNotes: string;
  userProfile: UserProfile;
}) {
  const { type, company, person, conversationNotes, userProfile } = params;

  let contextStr = '';
  if (type === 'career_fair' && company) {
    contextStr = `Context: Career fair conversation with a recruiter from ${company}`;
  } else if (person) {
    contextStr = `Context: Networking conversation with ${person.name}, ${person.title} at ${person.company}`;
  }

  const isLinkedIn = type === 'linkedin';
  const format = isLinkedIn
    ? 'short LinkedIn connection message (under 300 characters, very concise)'
    : 'professional follow-up email with subject line and body';

  const prompt = `You are a professional communication writer. Generate a ${format}.

${contextStr}
What was discussed: "${conversationNotes}"

Writer: ${userProfile.name}
University: ${userProfile.university || 'University'}
Major: ${userProfile.major || 'Computer Science'}

Requirements:
- Warm but professional tone
- Reference something specific from the conversation
- Clear and direct
- End with a specific next step or ask
${isLinkedIn ? '- Must be under 300 characters' : '- Include: Subject: line, then the email body'}

Write only the message, no explanations:`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content?.trim() || '';
}

// ─── Networking Strategy ─────────────────────────────────────────────────────

export async function generateNetworkingStrategy(connections: any[], userProfile: UserProfile) {
  const prompt = `Generate a prioritized networking strategy for this user.

User: ${userProfile.name}
Major: ${userProfile.major}, Skills: ${userProfile.skills?.join(', ')}
Goals: ${userProfile.careerInterests}

Top connections analyzed:
${connections
  .slice(0, 5)
  .map((c, i) => `${i + 1}. ${c.personSummary?.title} at ${c.personSummary?.company} (Score: ${c.opportunityScore})`)
  .join('\n')}

Return a brief strategic networking plan as plain text, 3-4 actionable sentences.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0].message.content?.trim() || '';
}

// ─── Cold Connect: internships + people to connect ──────────────────────────

export interface ColdConnectInternship {
  title: string;
  company: string;
  matchReason: string;
  searchHint: string;
}

export interface ColdConnectPerson {
  role: string;
  industry: string;
  whyConnect: string;
  linkedinSearchHint: string;
}

export interface ColdConnectResult {
  internships: ColdConnectInternship[];
  peopleToConnect: ColdConnectPerson[];
}

export async function getColdConnectSuggestions(userProfile: UserProfile): Promise<ColdConnectResult> {
  const profileContext = `
User: ${userProfile.name}
University: ${userProfile.university || 'Not specified'}
Major: ${userProfile.major || 'Not specified'}
Skills: ${userProfile.skills?.join(', ') || 'Not specified'}
Target Industries: ${userProfile.targetIndustries?.join(', ') || 'Not specified'}
Target Companies: ${userProfile.targetCompanies?.join(', ') || 'Not specified'}
Career Interests: ${userProfile.careerInterests || 'Not specified'}
`;

  const prompt = `You are a career advisor. Based on this profile, suggest internship opportunities and types of people to connect with on LinkedIn.

${profileContext}

Return a JSON object with this exact structure (no markdown, just JSON):
{
  "internships": [
    {
      "title": "Software Engineer Intern",
      "company": "Example Corp",
      "matchReason": "Brief reason this fits the profile",
      "searchHint": "Search phrase for job boards (e.g. 'software engineer intern 2025')"
    }
  ],
  "peopleToConnect": [
    {
      "role": "Senior Software Engineer",
      "industry": "Fintech",
      "whyConnect": "Brief reason to connect",
      "linkedinSearchHint": "LinkedIn search suggestion (e.g. 'Software Engineer Stripe')"
    }
  ]
}

- internships: 4–6 roles that match skills and interests (use realistic company types; you may use real company names or "companies in [industry]").
- peopleToConnect: 4–6 types of people (by role/industry) to find on LinkedIn, with a concrete search hint.
Return only valid JSON.`;

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content || '{}';
  const clean = content.replace(/```json\n?|\n?```/g, '').trim();
  try {
    const parsed = JSON.parse(clean);
    return {
      internships: Array.isArray(parsed.internships) ? parsed.internships.slice(0, 6) : [],
      peopleToConnect: Array.isArray(parsed.peopleToConnect) ? parsed.peopleToConnect.slice(0, 6) : [],
    };
  } catch (err) {
    console.error('Failed to parse cold connect AI response', err, content);
    return { internships: [], peopleToConnect: [] };
  }
}

