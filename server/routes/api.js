import { Router } from 'express';
import crypto from 'crypto';
import { db } from '../db/connection.js';
import { requireAuth, optionalAuth, createToken } from '../middleware/auth.js';
import {
  runCareerRealityCheck,
  runCareerNavigator,
  runGenerateRoadmap,
  runGenerateTask,
  runEvaluateTaskSubmission,
  runMentorChat,
  runEvaluatePractice,
  runBuildBusinessPlan,
  getApiKey,
  getSelectedModel
} from '../services/ai.js';
import { seedDatabase } from '../db/seed.js';

const router = Router();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'career-solver-salt').digest('hex');
}

export function createNotification(userId, title, message, link = '') {
  try {
    const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `).run(id, userId, title, message, link);
    return id;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & DEMO PERSONAS
// -------------------------------------------------------------
router.post('/auth/register', (req, res) => {
  const { name, email, password, personaType = 'college_student' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const passwordHash = hashPassword(password);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, avatar, created_at)
    VALUES (?, ?, ?, ?, 'user', ?, ?)
  `).run(userId, name, email.toLowerCase().trim(), passwordHash, `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`, now);

  // Initialize empty profile
  db.prepare(`
    INSERT INTO user_profiles (user_id, persona_type, completion_pct, updated_at)
    VALUES (?, ?, 20, ?)
  `).run(userId, personaType, now);

  const token = createToken({ userId });
  const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(userId);

  res.status(201).json({ token, user, message: 'Account created successfully.' });
});

router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || user.password_hash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = createToken({ userId: user.id });
  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar };
  res.json({ token, user: safeUser, message: 'Logged in successfully.' });
});

// 1-Click Instant Demo Login (for Arun, Muthu, Priya, Admin)
router.post('/auth/demo-login/:persona', (req, res) => {
  const personaMap = {
    arun: 'usr_arun_college',
    muthu: 'usr_muthu_vocational',
    priya: 'usr_priya_switcher',
    sneha: 'usr_sneha_school',
    kavita: 'usr_kavita_entrepreneur',
    deepak: 'usr_deepak_higherstudies',
    admin: 'usr_admin'
  };

  const userId = personaMap[req.params.persona];
  if (!userId) {
    return res.status(404).json({ error: 'Demo persona not found.' });
  }

  const user = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(userId);
  if (!user) {
    // If not yet seeded, seed now
    seedDatabase();
    const retryUser = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(userId);
    if (!retryUser) return res.status(404).json({ error: 'User could not be found even after seeding.' });
    const token = createToken({ userId: retryUser.id });
    return res.json({ token, user: retryUser });
  }

  const token = createToken({ userId: user.id });
  res.json({ token, user, message: `Switched to demo persona: ${user.name}` });
});

router.get('/auth/me', requireAuth, (req, res) => {
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
  const activeGoal = db.prepare("SELECT * FROM career_goals WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(req.user.id);
  res.json({ user: req.user, profile: profile || {}, activeGoal: activeGoal || null });
});

// -------------------------------------------------------------
// 2. USER PROFILE & PROGRESSIVE ONBOARDING
// -------------------------------------------------------------
router.get('/profile', requireAuth, (req, res) => {
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};
  res.json({
    profile: {
      ...profile,
      technical_skills: JSON.parse(profile.technical_skills || '[]'),
      soft_skills: JSON.parse(profile.soft_skills || '[]'),
      practical_skills: JSON.parse(profile.practical_skills || '[]'),
      interests: JSON.parse(profile.interests || '[]'),
    }
  });
});

router.put('/profile', requireAuth, (req, res) => {
  const updates = req.body;
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE user_profiles SET
      persona_type = COALESCE(?, persona_type),
      education_level = COALESCE(?, education_level),
      field_of_study = COALESCE(?, field_of_study),
      current_status = COALESCE(?, current_status),
      occupation = COALESCE(?, occupation),
      target_goal = COALESCE(?, target_goal),
      experience_level = COALESCE(?, experience_level),
      technical_skills = COALESCE(?, technical_skills),
      soft_skills = COALESCE(?, soft_skills),
      practical_skills = COALESCE(?, practical_skills),
      interests = COALESCE(?, interests),
      work_preference = COALESCE(?, work_preference),
      collaboration_preference = COALESCE(?, collaboration_preference),
      employment_preference = COALESCE(?, employment_preference),
      daily_learning_hours = COALESCE(?, daily_learning_hours),
      budget_constraint = COALESCE(?, budget_constraint),
      has_smartphone = COALESCE(?, has_smartphone),
      has_computer = COALESCE(?, has_computer),
      internet_access = COALESCE(?, internet_access),
      preferred_language = COALESCE(?, preferred_language),
      location = COALESCE(?, location),
      bio = COALESCE(?, bio),
      completion_pct = COALESCE(?, completion_pct),
      updated_at = ?
    WHERE user_id = ?
  `).run(
    updates.persona_type,
    updates.education_level,
    updates.field_of_study,
    updates.current_status,
    updates.occupation,
    updates.target_goal,
    updates.experience_level,
    typeof updates.technical_skills === 'object' ? JSON.stringify(updates.technical_skills) : updates.technical_skills,
    typeof updates.soft_skills === 'object' ? JSON.stringify(updates.soft_skills) : updates.soft_skills,
    typeof updates.practical_skills === 'object' ? JSON.stringify(updates.practical_skills) : updates.practical_skills,
    typeof updates.interests === 'object' ? JSON.stringify(updates.interests) : updates.interests,
    updates.work_preference,
    updates.collaboration_preference,
    updates.employment_preference,
    updates.daily_learning_hours,
    updates.budget_constraint,
    updates.has_smartphone !== undefined ? (updates.has_smartphone ? 1 : 0) : undefined,
    updates.has_computer !== undefined ? (updates.has_computer ? 1 : 0) : undefined,
    updates.internet_access,
    updates.preferred_language,
    updates.location,
    updates.bio,
    updates.completion_pct,
    now,
    req.user.id
  );

  const updated = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id);
  res.json({ message: 'Profile updated successfully.', profile: updated });
});

router.post('/profile/onboarding', requireAuth, (req, res) => {
  const {
    persona_type,
    education_level,
    field_of_study,
    current_status,
    occupation,
    target_goal,
    experience_level,
    technical_skills = [],
    soft_skills = [],
    practical_skills = [],
    interests = [],
    work_preference,
    collaboration_preference,
    employment_preference,
    daily_learning_hours = 2,
    budget_constraint = 'moderate',
    has_smartphone = true,
    has_computer = true,
    preferred_language = 'English',
    location = ''
  } = req.body;

  const now = new Date().toISOString();

  // Upsert user profile
  db.prepare(`
    INSERT INTO user_profiles (
      user_id, persona_type, education_level, field_of_study, current_status, occupation,
      target_goal, experience_level, technical_skills, soft_skills, practical_skills,
      interests, work_preference, collaboration_preference, employment_preference,
      daily_learning_hours, budget_constraint, has_smartphone, has_computer,
      preferred_language, location, completion_pct, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 80, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      persona_type = excluded.persona_type,
      education_level = excluded.education_level,
      field_of_study = excluded.field_of_study,
      current_status = excluded.current_status,
      occupation = excluded.occupation,
      target_goal = excluded.target_goal,
      experience_level = excluded.experience_level,
      technical_skills = excluded.technical_skills,
      soft_skills = excluded.soft_skills,
      practical_skills = excluded.practical_skills,
      interests = excluded.interests,
      work_preference = excluded.work_preference,
      collaboration_preference = excluded.collaboration_preference,
      employment_preference = excluded.employment_preference,
      daily_learning_hours = excluded.daily_learning_hours,
      budget_constraint = excluded.budget_constraint,
      has_smartphone = excluded.has_smartphone,
      has_computer = excluded.has_computer,
      preferred_language = excluded.preferred_language,
      location = excluded.location,
      completion_pct = 80,
      updated_at = excluded.updated_at
  `).run(
    req.user.id,
    persona_type || 'college_student',
    education_level || 'Undergraduate',
    field_of_study || '',
    current_status || 'Exploring',
    occupation || '',
    target_goal || 'Career Advancement',
    experience_level || 'Beginner',
    JSON.stringify(technical_skills),
    JSON.stringify(soft_skills),
    JSON.stringify(practical_skills),
    JSON.stringify(interests),
    work_preference || 'balanced',
    collaboration_preference || 'balanced',
    employment_preference || 'full_time',
    Number(daily_learning_hours) || 2,
    budget_constraint || 'moderate',
    has_smartphone ? 1 : 0,
    has_computer ? 1 : 0,
    preferred_language || 'English',
    location || '',
    now
  );

  // If target_goal is provided, create or update active career goal
  if (target_goal) {
    const existingGoal = db.prepare("SELECT id FROM career_goals WHERE user_id = ? AND status = 'active'").get(req.user.id);
    if (!existingGoal) {
      const goalId = 'goal_' + Date.now();
      db.prepare(`
        INSERT INTO career_goals (id, user_id, title, target_pathway, description, status, created_at)
        VALUES (?, ?, ?, ?, ?, 'active', ?)
      `).run(goalId, req.user.id, target_goal, target_goal, `Personalized career goal for ${target_goal}`, now);
    }
  }

  // Populate user_skills table with initial skills
  const allInitialSkills = [
    ...technical_skills.map(s => ({ name: s, cat: 'technical' })),
    ...soft_skills.map(s => ({ name: s, cat: 'soft' })),
    ...practical_skills.map(s => ({ name: s, cat: 'practical' }))
  ];

  for (const s of allInitialSkills) {
    const existing = db.prepare('SELECT id FROM user_skills WHERE user_id = ? AND skill_name = ?').get(req.user.id, s.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO user_skills (id, user_id, skill_name, category, level, source)
        VALUES (?, ?, ?, ?, 'Intermediate', 'user_reported')
      `).run('usk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6), req.user.id, s.name, s.cat);
    }
  }

  res.json({ message: 'Onboarding completed successfully!', nextStep: '/reality-check' });
});

// -------------------------------------------------------------
// 3. CAREER GOALS
// -------------------------------------------------------------
router.get('/goals', requireAuth, (req, res) => {
  const goals = db.prepare('SELECT * FROM career_goals WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ goals });
});

router.post('/goals', requireAuth, (req, res) => {
  const { title, target_pathway, description, target_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Goal title is required.' });

  const goalId = 'goal_' + Date.now();
  const now = new Date().toISOString();

  // Set previous goals to paused
  db.prepare("UPDATE career_goals SET status = 'paused' WHERE user_id = ? AND status = 'active'").run(req.user.id);

  db.prepare(`
    INSERT INTO career_goals (id, user_id, title, target_pathway, description, status, target_date, created_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?, ?)
  `).run(goalId, req.user.id, title, target_pathway || title, description || '', target_date || null, now);

  const newGoal = db.prepare('SELECT * FROM career_goals WHERE id = ?').get(goalId);
  res.status(201).json({ goal: newGoal, message: 'Active goal set successfully.' });
});

// -------------------------------------------------------------
// 4. MODULE 2: CAREER REALITY CHECK & COMPARISONS
// -------------------------------------------------------------
router.post('/reality-check', requireAuth, async (req, res) => {
  try {
    const { targetCareer } = req.body;
    if (!targetCareer) return res.status(400).json({ error: 'Target career name is required.' });

    const rawProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};
    const result = await runCareerRealityCheck(rawProfile, targetCareer);

    // Save assessment to database
    const assessmentId = 'asst_' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO career_assessments (
        id, user_id, target_career, fit_observations, strengths, skill_gaps,
        requirements, challenges, preparation_areas, alternative_pathways,
        immediate_next_steps, verdict_summary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assessmentId,
      req.user.id,
      result.targetCareer,
      result.fitObservations,
      JSON.stringify(result.strengths),
      JSON.stringify(result.skillGaps),
      JSON.stringify(result.requirements),
      JSON.stringify(result.challenges),
      JSON.stringify(result.preparationAreas),
      JSON.stringify(result.alternativePathways),
      JSON.stringify(result.immediateNextSteps),
      result.verdictSummary || '',
      now
    );

    res.json({ assessmentId, result });
  } catch (err) {
    console.error('Reality check error:', err);
    res.status(500).json({ error: 'Reality check failed: ' + err.message });
  }
});

router.get('/reality-check/history', requireAuth, (req, res) => {
  const history = db.prepare('SELECT * FROM career_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.user.id);
  const formatted = history.map(h => ({
    ...h,
    strengths: JSON.parse(h.strengths || '[]'),
    skill_gaps: JSON.parse(h.skill_gaps || '[]'),
    requirements: JSON.parse(h.requirements || '[]'),
    challenges: JSON.parse(h.challenges || '[]'),
    preparation_areas: JSON.parse(h.preparation_areas || '[]'),
    alternative_pathways: JSON.parse(h.alternative_pathways || '[]'),
    immediate_next_steps: JSON.parse(h.immediate_next_steps || '[]'),
  }));
  res.json({ history: formatted });
});

// Compare multiple pathways side-by-side
router.post('/reality-check/compare', requireAuth, (req, res) => {
  const { careers = ['Java Backend Developer', 'QA Automation Engineer', 'Data Analyst'] } = req.body;

  // Curated comparison knowledge base
  const comparisonData = {
    'Java Backend Developer': {
      category: 'Software Engineering',
      requiredSkills: ['Java 17+', 'Spring Boot', 'SQL & RDBMS', 'REST APIs', 'Git', 'Data Structures'],
      learningEffortMonths: '4 - 6 Months',
      transferableSkills: ['Logical reasoning', 'Algorithmic thinking', 'Attention to detail'],
      entryBarrier: 'Moderate to High (Technical rounds, coding tests)',
      practicalTaskExample: 'Build a secure JWT order processing API with PostgreSQL',
      portfolioNeed: 'High (1-2 deployed microservices on GitHub with Docker)',
      salaryRangeIndicator: 'High initial growth and senior architect progression'
    },
    'QA Automation Engineer': {
      category: 'Software Testing & Quality',
      requiredSkills: ['Selenium / Playwright', 'Java or Python', 'TestNG / JUnit', 'API Testing (Postman)', 'CI/CD Pipelines'],
      learningEffortMonths: '3 - 4 Months',
      transferableSkills: ['Edge case analysis', 'Systematic debugging', 'User empathy'],
      entryBarrier: 'Moderate (Practical test script demonstration)',
      practicalTaskExample: 'Automate a 5-step user checkout flow with assertions and HTML reports',
      portfolioNeed: 'Moderate (GitHub repo with test framework and CI integration)',
      salaryRangeIndicator: 'Strong demand with high automation reliability'
    },
    'Data Analyst': {
      category: 'Data & Analytics',
      requiredSkills: ['SQL (Advanced Joins & Window Functions)', 'Excel / Sheets modeling', 'Tableau / PowerBI', 'Python (Pandas)'],
      learningEffortMonths: '3 - 5 Months',
      transferableSkills: ['Business intuition', 'Storytelling with charts', 'Curiosity for patterns'],
      entryBarrier: 'Moderate (Data analysis presentation case study)',
      practicalTaskExample: 'Analyze customer retention cohorts from a 10,000-row dataset',
      portfolioNeed: 'High (Interactive dashboard link + business insights write-up)',
      salaryRangeIndicator: 'Cross-industry versatility across finance, tech, and retail'
    },
    'Certified Electrical & Appliance Technician': {
      category: 'Skilled Vocational Trades',
      requiredSkills: ['Live-Dead-Live Safety Protocol', 'Digital Multimeter Diagnostics', 'Motor Capacitor & Relay Testing', 'Domestic Wiring Standards'],
      learningEffortMonths: '3 - 6 Months + Apprenticeship',
      transferableSkills: ['Mechanical aptitude', 'Physical troubleshooting', 'Customer honesty'],
      entryBarrier: 'Practical (Skill test + Trade/Safety License)',
      practicalTaskExample: 'Diagnose and replace faulty start capacitor in a washing machine motor',
      portfolioNeed: 'Moderate (Verified trade logbook & apprenticeship sign-off)',
      salaryRangeIndicator: 'Immediate steady demand with independent contracting upside'
    },
    'Digital Marketing & Growth Specialist': {
      category: 'Marketing & Growth',
      requiredSkills: ['SEO & Keyword Intent', 'Google Analytics 4', 'Meta Ads Manager', 'Conversion Copywriting', 'A/B Testing'],
      learningEffortMonths: '3 - 4 Months',
      transferableSkills: ['Customer empathy', 'Persuasive writing', 'Data curiosity'],
      entryBarrier: 'Moderate (Live case study showing metric growth)',
      practicalTaskExample: 'Execute an SEO keyword audit and draft a 1,200-word high-ranking guide',
      portfolioNeed: 'High (Documented campaign results & analytics snapshots)',
      salaryRangeIndicator: 'Direct correlation with revenue generation'
    }
  };

  const results = careers.map(title => {
    return comparisonData[title] || {
      category: 'Professional Pathway',
      requiredSkills: ['Domain Fundamentals', 'Industry Tools', 'Communication', 'Applied Practice'],
      learningEffortMonths: '3 - 6 Months',
      transferableSkills: ['Problem solving', 'Adaptability'],
      entryBarrier: 'Moderate',
      practicalTaskExample: `Complete an end-to-end practical project in ${title}`,
      portfolioNeed: 'Recommended proof of work',
      salaryRangeIndicator: 'Varies by specialization'
    };
  });

  res.json({ careers, comparisons: results });
});

// -------------------------------------------------------------
// 5. MODULE 3: AI CAREER NAVIGATOR (CONVERSATIONAL)
// -------------------------------------------------------------
router.post('/navigator/chat', requireAuth, async (req, res) => {
  try {
    const { query, history = [], language = 'English' } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    const rawProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};
    const result = await runCareerNavigator(rawProfile, query, history, language);

    res.json({ result });
  } catch (err) {
    console.error('Navigator error:', err);
    res.status(500).json({ error: 'Career navigation failed: ' + err.message });
  }
});

// -------------------------------------------------------------
// 6. MODULE 5: ACTION PLAN & ROADMAPS
// -------------------------------------------------------------
router.get('/roadmaps/active', requireAuth, (req, res) => {
  const roadmap = db.prepare("SELECT * FROM roadmaps WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(req.user.id);
  if (!roadmap) {
    return res.json({ roadmap: null, tasks: [] });
  }

  const tasks = db.prepare('SELECT * FROM tasks WHERE roadmap_id = ? ORDER BY order_index ASC').all(roadmap.id);

  res.json({
    roadmap: {
      ...roadmap,
      phases: JSON.parse(roadmap.phases_json || '[]'),
      weeklyPlan: JSON.parse(roadmap.weekly_plan_json || '[]'),
      milestones: JSON.parse(roadmap.milestones_json || '[]')
    },
    tasks: tasks.map(t => ({
      ...t,
      instructions: JSON.parse(t.instructions_json || '[]')
    }))
  });
});

router.post('/roadmaps/generate', requireAuth, async (req, res) => {
  try {
    const { goalTitle, targetPathway, currentLevel = 'Beginner' } = req.body;
    const rawProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};

    const generated = await runGenerateRoadmap(rawProfile, goalTitle || rawProfile.target_goal || 'Career Advancement', targetPathway || goalTitle, currentLevel);

    const roadmapId = 'rdm_' + Date.now();
    const now = new Date().toISOString();

    // Archive previous roadmaps
    db.prepare("UPDATE roadmaps SET status = 'archived' WHERE user_id = ?").run(req.user.id);

    // Save roadmap
    db.prepare(`
      INSERT INTO roadmaps (
        id, user_id, goal_id, title, target_role, current_level,
        phases_json, weekly_plan_json, milestones_json, status, current_phase_index, progress_pct, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, 10, ?)
    `).run(
      roadmapId,
      req.user.id,
      null,
      generated.title,
      generated.targetRole,
      generated.currentLevel,
      JSON.stringify(generated.phases),
      JSON.stringify(generated.weeklyPlan),
      JSON.stringify(generated.milestones),
      now
    );

    // Automatically generate 3 initial actionable tasks for Phase 1!
    const phase1 = generated.phases[0];
    const initialTopics = phase1?.topics || ['Core Fundamentals', 'Practical Exercise', 'STAR Explanation'];

    initialTopics.slice(0, 3).forEach((topic, idx) => {
      const taskId = 'tsk_' + Date.now() + '_' + idx;
      const days = ['Yesterday', 'Today', 'Tomorrow'];
      const statuses = idx === 0 ? 'completed' : (idx === 1 ? 'in_progress' : 'not_started');

      db.prepare(`
        INSERT INTO tasks (
          id, roadmap_id, user_id, title, description, why_it_matters, skill,
          difficulty, estimated_minutes, instructions_json, expected_outcome, status,
          due_day, order_index, is_daily_task, created_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        taskId,
        roadmapId,
        req.user.id,
        `Mastering ${topic}: Hands-on Exercise`,
        `Complete a practical exercise applying ${topic} to build real-world competency.`,
        `Directly tested in real-world professional scenarios and team interviews.`,
        topic,
        'Intermediate',
        45,
        JSON.stringify([
          `Step 1: Set up your workspace and review the syntax/safety guidelines for ${topic}.`,
          `Step 2: Implement a functional test case or diagnostic run.`,
          `Step 3: Document your observations and handle 1 edge case.`,
          `Step 4: Prepare a 2-minute explanation of your approach.`
        ]),
        `A verified working demonstration of ${topic}.`,
        statuses,
        days[idx],
        idx + 1,
        idx === 1 ? 1 : 0,
        now,
        idx === 0 ? now : null
      );
    });

    res.status(201).json({ message: 'Roadmap and initial tasks created successfully!', roadmapId });
  } catch (err) {
    console.error('Generate roadmap error:', err);
    res.status(500).json({ error: 'Failed to generate roadmap: ' + err.message });
  }
});

// -------------------------------------------------------------
// 7. MODULE 6: LEARN-BY-DOING TASKS
// -------------------------------------------------------------
router.get('/tasks', requireAuth, (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [req.user.id];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  query += ' ORDER BY order_index ASC, created_at DESC';

  const tasks = db.prepare(query).all(...params);
  res.json({
    tasks: tasks.map(t => ({
      ...t,
      instructions: JSON.parse(t.instructions_json || '[]')
    }))
  });
});

router.get('/tasks/today', requireAuth, (req, res) => {
  const todayTasks = db.prepare("SELECT * FROM tasks WHERE user_id = ? AND (is_daily_task = 1 OR due_day = 'Today') ORDER BY order_index ASC").all(req.user.id);
  res.json({
    tasks: todayTasks.map(t => ({
      ...t,
      instructions: JSON.parse(t.instructions_json || '[]')
    }))
  });
});

router.put('/tasks/:id/status', requireAuth, (req, res) => {
  const { status, user_notes } = req.body;
  const taskId = req.params.id;

  const validStatuses = ['not_started', 'in_progress', 'completed', 'skipped'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  const now = new Date().toISOString();
  const completedAt = status === 'completed' ? now : null;

  db.prepare(`
    UPDATE tasks SET
      status = ?,
      user_notes = COALESCE(?, user_notes),
      completed_at = COALESCE(?, completed_at)
    WHERE id = ? AND user_id = ?
  `).run(status, user_notes || null, completedAt, taskId, req.user.id);

  // Recalculate roadmap progress
  const task = db.prepare('SELECT roadmap_id, skill, title FROM tasks WHERE id = ?').get(taskId);
  if (task && task.roadmap_id) {
    const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE roadmap_id = ?').get(task.roadmap_id).count;
    const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE roadmap_id = ? AND status = 'completed'").get(task.roadmap_id).count;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    db.prepare('UPDATE roadmaps SET progress_pct = ? WHERE id = ?').run(pct, task.roadmap_id);

    // If completed, also automatically add to Skill Passport as completed_activity!
    if (status === 'completed') {
      createNotification(req.user.id, 'Task Completed! 🚀', `Great work completing: "${task?.title || 'Daily Task'}". Skill progress recorded.`, '/tasks');
    }
    // If completed, also automatically add to Skill Passport as completed_activity!
    if (status === 'completed') {
      const existingSkill = db.prepare('SELECT id FROM user_skills WHERE user_id = ? AND skill_name = ?').get(req.user.id, task.skill);
      if (!existingSkill) {
        db.prepare(`
          INSERT INTO user_skills (id, user_id, skill_name, category, level, source, verified_at)
          VALUES (?, ?, ?, 'practical', 'Intermediate', 'completed_activity', ?)
        `).run('sk_auto_' + Date.now(), req.user.id, task.skill, now);
      }
    }
  }

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  res.json({
    message: `Task marked as ${status}.`,
    task: { ...updated, instructions: JSON.parse(updated.instructions_json || '[]') }
  });
});

// Submit user notes and receive instant AI feedback
router.post('/tasks/:id/submit', requireAuth, async (req, res) => {
  try {
    const { userNotes } = req.body;
    const taskId = req.params.id;

    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });

    const feedback = await runEvaluateTaskSubmission(task, userNotes);
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks SET
        status = 'completed',
        user_notes = ?,
        ai_feedback = ?,
        completed_at = ?
      WHERE id = ?
    `).run(userNotes, feedback, now, taskId);

    // Update progress %
    if (task.roadmap_id) {
      const total = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE roadmap_id = ?').get(task.roadmap_id).count;
      const completed = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE roadmap_id = ? AND status = 'completed'").get(task.roadmap_id).count;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      db.prepare('UPDATE roadmaps SET progress_pct = ? WHERE id = ?').run(pct, task.roadmap_id);
    }

    res.json({
      message: 'Task submitted and reviewed!',
      feedback,
      completedAt: now
    });
  } catch (err) {
    console.error('Task submit error:', err);
    res.status(500).json({ error: 'Submission evaluation failed: ' + err.message });
  }
});

// -------------------------------------------------------------
// 8. MODULE 7 & 8: PERSISTENT AI MENTOR & HANDOFF
// -------------------------------------------------------------
router.get('/mentor/conversations/:mode', requireAuth, (req, res) => {
  const mode = req.params.mode || 'career';
  const convo = db.prepare('SELECT * FROM ai_conversations WHERE user_id = ? AND mentor_mode = ? ORDER BY updated_at DESC LIMIT 1').get(req.user.id, mode);

  if (!convo) {
    // Return welcoming default greeting
    const welcomeMessages = {
      career: "Hello! I am your Career Solver AI Career Mentor. I'm here to help you evaluate pathways, structure next steps, and keep you grounded in realistic actions. What would you like to explore today?",
      study: "Welcome! As your Study Mentor, I can help break complex concepts into simple analogies and structured practice routines. What topic are you working on?",
      job: "Hi there! I am your Job & Placement Mentor. Let's sharpen your resume points, practice STAR method answers, and prepare for interviews. What role are you targeting?",
      skill: "Ready to build? As your Skill Mentor, I specialize in practical problem solving, debugging advice, and project design. What are you building today?",
      business: "Welcome entrepreneur! I am your Business Mentor. Let's turn your raw idea into customer discovery tasks and a lean 7-day MVP. What problem are you trying to solve?",
      communication: "Hello! I am your Communication Mentor. Let's practice speaking with clarity, crisp 60-second self-introductions, and confident professional articulation. Ready?"
    };

    return res.json({
      mode,
      messages: [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          text: welcomeMessages[mode] || welcomeMessages.career,
          timestamp: new Date().toISOString(),
          suggestedActions: ['Review My Active Goal', 'Give Me a Daily Action Tip', 'What Should I Practice Next?']
        }
      ]
    });
  }

  res.json({
    mode,
    messages: JSON.parse(convo.messages_json || '[]')
  });
});

router.post('/mentor/chat', requireAuth, async (req, res) => {
  try {
    const { mode = 'career', message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message cannot be empty.' });

    const rawProfile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};
    const activeGoal = db.prepare("SELECT * FROM career_goals WHERE user_id = ? AND status = 'active' LIMIT 1").get(req.user.id);
    const activeRoadmap = db.prepare("SELECT * FROM roadmaps WHERE user_id = ? AND status = 'active' LIMIT 1").get(req.user.id);

    // Retrieve previous conversation
    let convo = db.prepare('SELECT * FROM ai_conversations WHERE user_id = ? AND mentor_mode = ?').get(req.user.id, mode);
    let messages = convo ? JSON.parse(convo.messages_json || '[]') : [];

    const userMsgObj = {
      id: 'usr_msg_' + Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString()
    };
    messages.push(userMsgObj);

    // Run AI Mentor
    const aiResult = await runMentorChat(rawProfile, activeGoal, mode, messages, activeRoadmap);

    const botMsgObj = {
      id: 'bot_msg_' + Date.now(),
      sender: 'assistant',
      text: aiResult.reply,
      timestamp: new Date().toISOString(),
      suggestedActions: aiResult.suggestedActions || [],
      suggestHumanHandoff: aiResult.suggestHumanHandoff || false,
      handoffReason: aiResult.handoffReason || '',
      aiSource: aiResult.aiSource
    };
    messages.push(botMsgObj);

    // Persist conversation
    const now = new Date().toISOString();
    if (convo) {
      db.prepare(`
        UPDATE ai_conversations SET
          messages_json = ?,
          updated_at = ?
        WHERE id = ?
      `).run(JSON.stringify(messages), now, convo.id);
    } else {
      const convoId = 'cnv_' + Date.now();
      db.prepare(`
        INSERT INTO ai_conversations (id, user_id, mentor_mode, title, messages_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(convoId, req.user.id, mode, `${mode.toUpperCase()} Mentor Chat`, JSON.stringify(messages), now, now);
    }

    res.json({ reply: botMsgObj });
  } catch (err) {
    console.error('Mentor chat error:', err);
    res.status(500).json({ error: 'Mentor chat failed: ' + err.message });
  }
});

// -------------------------------------------------------------
// 9. MODULE 9: PRACTICE STUDIO
// -------------------------------------------------------------
router.get('/practice/prompts', (req, res) => {
  const prompts = [
    {
      id: 'pr_hr_1',
      type: 'interview',
      mode: 'hr',
      title: 'Tell Me About Yourself',
      scenario: 'Interview Icebreaker',
      question: 'Please introduce yourself, highlight your core background, and explain why you are interested in this career path in 60-90 seconds.',
      sampleStructure: 'Past Background → Key Hands-on Accomplishment → Why This Opportunity'
    },
    {
      id: 'pr_hr_2',
      type: 'interview',
      mode: 'situational',
      title: 'Handling a Significant Setback or Mistake',
      scenario: 'Behavioral STAR Assessment',
      question: 'Describe a situation where a technical project or practical task did not go as planned. What action did you take to fix it, and what did you learn?',
      sampleStructure: 'Situation → Task → Action Taken → Measurable Result & Takeaway'
    },
    {
      id: 'pr_tech_1',
      type: 'interview',
      mode: 'technical',
      title: 'Explaining an Architectural Trade-off',
      scenario: 'Technical Depth Evaluation',
      question: 'Explain the difference between SQL relational storage vs NoSQL/Cache storage, or describe why you chose a particular framework/tool for your recent project.',
      sampleStructure: 'Core Difference → Performance/Consistency Trade-off → Real-World Example'
    },
    {
      id: 'pr_comm_1',
      type: 'communication',
      mode: 'self_intro',
      title: 'Explaining a Concept to a Non-Technical Stakeholder',
      scenario: 'Communication Clarity Drill',
      question: 'Explain how an API or a circuit breaker works using an everyday analogy that anyone can easily understand.',
      sampleStructure: 'Familiar Analogy → Mapping to the System → Why It Matters'
    },
    {
      id: 'pr_trade_1',
      type: 'vocational_safety',
      mode: 'safety',
      title: 'The Live-Dead-Live Protocol Explanation',
      scenario: 'Workshop Safety Demonstration',
      question: 'Explain step-by-step how you prove an electrical circuit is dead before beginning diagnostic work, and why skipping any step is hazardous.',
      sampleStructure: 'Isolate & Tag → Prove Meter on Known Source → Measure Target → Re-prove Meter'
    },
    {
      id: 'pr_biz_1',
      type: 'business_pitch',
      mode: 'pitch',
      title: '90-Second Problem & Solution Elevator Pitch',
      scenario: 'Entrepreneurial Communication',
      question: 'Pitch your business idea: What customer pain do you solve, who pays for it, and why is your approach better than current alternatives?',
      sampleStructure: 'The Pain → Target Customer → Your Solution → Traction / Next Step'
    }
  ];

  res.json({ prompts });
});

router.post('/practice/evaluate', requireAuth, async (req, res) => {
  try {
    const { practiceType, mode, promptQuestion, userResponse } = req.body;
    if (!promptQuestion || !userResponse) {
      return res.status(400).json({ error: 'Question and response are required.' });
    }

    const evaluation = await runEvaluatePractice(practiceType, mode, promptQuestion, userResponse);

    // Save session to practice_sessions
    const sessionId = 'prs_' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO practice_sessions (
        id, user_id, practice_type, mode, prompt_question, user_response,
        feedback_json, score_metrics_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      req.user.id,
      practiceType,
      mode || 'general',
      promptQuestion,
      userResponse,
      JSON.stringify(evaluation.feedback),
      JSON.stringify(evaluation.scores),
      now
    );

    res.json({ sessionId, evaluation });
  } catch (err) {
    console.error('Practice evaluation error:', err);
    res.status(500).json({ error: 'Evaluation failed: ' + err.message });
  }
});

router.get('/practice/history', requireAuth, (req, res) => {
  const sessions = db.prepare('SELECT * FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.user.id);
  res.json({
    sessions: sessions.map(s => ({
      ...s,
      feedback: JSON.parse(s.feedback_json || '{}'),
      scores: JSON.parse(s.score_metrics_json || '{}')
    }))
  });
});

// -------------------------------------------------------------
// 10. MODULE 12 & 13: CHALLENGES & COMMUNITY
// -------------------------------------------------------------
router.get('/challenges', optionalAuth, (req, res) => {
  const challenges = db.prepare('SELECT * FROM challenges ORDER BY duration_days ASC').all();
  const userId = req.user?.id;

  const result = challenges.map(c => {
    let participant = null;
    if (userId) {
      participant = db.prepare('SELECT * FROM challenge_participants WHERE user_id = ? AND challenge_id = ?').get(userId, c.id);
    }
    return {
      ...c,
      dailyTasks: JSON.parse(c.daily_tasks_json || '[]'),
      isJoined: !!participant,
      progressDays: participant ? participant.progress_days : 0,
      completedDays: participant ? JSON.parse(participant.completed_days_json || '[]') : []
    };
  });

  res.json({ challenges: result });
});

router.post('/challenges/:id/join', requireAuth, (req, res) => {
  const challengeId = req.params.id;
  const existing = db.prepare('SELECT * FROM challenge_participants WHERE user_id = ? AND challenge_id = ?').get(req.user.id, challengeId);

  if (existing) {
    return res.json({ message: 'Already joined this challenge.', participant: existing });
  }

  const cpId = 'cp_' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO challenge_participants (id, user_id, challenge_id, progress_days, completed_days_json, status, joined_at)
    VALUES (?, ?, ?, 1, '[]', 'active', ?)
  `).run(cpId, req.user.id, challengeId, now);

  db.prepare('UPDATE challenges SET participants_count = participants_count + 1 WHERE id = ?').run(challengeId);

  res.json({ message: 'Successfully joined challenge!', participantId: cpId });
});

router.post('/challenges/:id/check-day', requireAuth, (req, res) => {
  const challengeId = req.params.id;
  const { dayNumber } = req.body;

  const participant = db.prepare('SELECT * FROM challenge_participants WHERE user_id = ? AND challenge_id = ?').get(req.user.id, challengeId);
  if (!participant) return res.status(404).json({ error: 'You have not joined this challenge yet.' });

  const completedDays = JSON.parse(participant.completed_days_json || '[]');
  if (!completedDays.includes(dayNumber)) {
    completedDays.push(dayNumber);
  }

  const progress = completedDays.length;
  const challenge = db.prepare('SELECT duration_days FROM challenges WHERE id = ?').get(challengeId);
  const isCompleted = progress >= (challenge?.duration_days || 7);
  const now = new Date().toISOString();

  db.prepare(`
    UPDATE challenge_participants SET
      progress_days = ?,
      completed_days_json = ?,
      status = ?,
      completed_at = ?
    WHERE id = ?
  `).run(progress, JSON.stringify(completedDays), isCompleted ? 'completed' : 'active', isCompleted ? now : null, participant.id);

  createNotification(
    req.user.id,
    isCompleted ? 'Challenge Completed! 🏆' : 'Challenge Check-in',
    isCompleted ? `Congratulations! You finished the entire "${challenge?.title || 'Challenge'}"!` : `Day ${dayNumber} marked complete for "${challenge?.title || 'Challenge'}".`,
    '/challenges'
  );
  res.json({ message: `Day ${dayNumber} marked complete!`, progressDays: progress, isCompleted });
});

// Community Posts
router.get('/community/posts', optionalAuth, (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM community_posts WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (content LIKE ? OR title LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  query += ' ORDER BY created_at DESC LIMIT 30';

  const posts = db.prepare(query).all(...params);
  const userId = req.user?.id;

  const formatted = posts.map(p => {
    let hasLiked = false;
    if (userId) {
      const like = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(p.id, userId);
      hasLiked = !!like;
    }
    return { ...p, hasLiked };
  });

  res.json({ posts: formatted });
});

router.post('/community/posts', requireAuth, (req, res) => {
  const { title, content, category = 'Career Guidance' } = req.body;
  if (!content) return res.status(400).json({ error: 'Post content is required.' });

  const postId = 'pst_' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO community_posts (id, user_id, author_name, author_role, category, title, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(postId, req.user.id, req.user.name, 'Learner', category, title || null, content, now);

  const post = db.prepare('SELECT * FROM community_posts WHERE id = ?').get(postId);
  res.status(201).json({ post, message: 'Post shared with community!' });
});

router.delete('/community/posts/:id', requireAuth, (req, res) => {
  const post = db.prepare('SELECT user_id FROM community_posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  if (post.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only delete your own posts.' });
  }

  db.prepare('DELETE FROM community_posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post removed.' });
});

router.post('/community/posts/:id/like', requireAuth, (req, res) => {
  const postId = req.params.id;
  const existing = db.prepare('SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?').get(postId, req.user.id);

  if (existing) {
    db.prepare('DELETE FROM post_likes WHERE post_id = ? AND user_id = ?').run(postId, req.user.id);
    db.prepare('UPDATE community_posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
    return res.json({ hasLiked: false });
  } else {
    db.prepare('INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)').run(postId, req.user.id);
    db.prepare('UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
    return res.json({ hasLiked: true });
  }
});

router.get('/community/posts/:id/comments', (req, res) => {
  const comments = db.prepare('SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC').all(req.params.id);
  res.json({ comments });
});

router.post('/community/posts/:id/comments', requireAuth, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content cannot be empty.' });

  const commentId = 'cmt_' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO post_comments (id, post_id, user_id, author_name, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(commentId, req.params.id, req.user.id, req.user.name, content, now);

  db.prepare('UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = ?').run(req.params.id);

  const comment = db.prepare('SELECT * FROM post_comments WHERE id = ?').get(commentId);
  res.status(201).json({ comment });
});

router.post('/community/posts/:id/report', requireAuth, (req, res) => {
  const { reason = 'Inappropriate content' } = req.body;
  const reportId = 'rep_' + Date.now();

  db.prepare(`
    INSERT INTO post_reports (id, post_id, user_id, reason, status)
    VALUES (?, ?, ?, ?, 'pending')
  `).run(reportId, req.params.id, req.user.id, reason);

  res.json({ message: 'Thank you for reporting. Our moderation team has been notified.' });
});

// -------------------------------------------------------------
// 11. MODULE 14 & 15: HUMAN MENTORSHIP HUB
// -------------------------------------------------------------
router.get('/mentors', (req, res) => {
  const { area, search, language } = req.query;
  let query = 'SELECT * FROM mentors WHERE 1=1';
  const params = [];

  if (area && area !== 'All') {
    query += ' AND professional_area LIKE ?';
    params.push(`%${area}%`);
  }
  if (search) {
    query += ' AND (name LIKE ? OR current_title LIKE ? OR bio LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const mentors = db.prepare(query).all(...params);
  const formatted = mentors.map(m => ({
    ...m,
    skills: JSON.parse(m.skills_json || '[]'),
    languages: JSON.parse(m.languages_json || '[]'),
    mentoringAreas: JSON.parse(m.mentoring_areas_json || '[]')
  }));

  res.json({ mentors: formatted });
});

router.post('/mentors/:id/request', requireAuth, (req, res) => {
  const mentorId = req.params.id;
  const { message, goals, preferredTime } = req.body;
  if (!message) return res.status(400).json({ error: 'Please include a message for the mentor.' });

  const requestId = 'mr_' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO mentor_requests (
      id, user_id, mentor_id, message, goals, preferred_time, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(requestId, req.user.id, mentorId, message, goals || '', preferredTime || '', now, now);

  const mentorObj = db.prepare('SELECT name FROM mentors WHERE id = ?').get(mentorId);
  createNotification(
    req.user.id,
    'Mentorship Request Submitted',
    `Your guidance request to ${mentorObj?.name || 'mentor'} has been submitted.`,
    '/mentors'
  );
  res.status(201).json({ message: 'Mentorship request sent successfully!', requestId });
});

router.get('/mentors/my-requests', requireAuth, (req, res) => {
  const requests = db.prepare(`
    SELECT mr.*, m.name as mentor_name, m.current_title, m.avatar as mentor_avatar, m.company_or_field
    FROM mentor_requests mr
    JOIN mentors m ON mr.mentor_id = m.id
    WHERE mr.user_id = ?
    ORDER BY mr.created_at DESC
  `).all(req.user.id);

  res.json({ requests });
});

// -------------------------------------------------------------
// 12. MODULE 16 & 17: ORGANIZATIONS & OPPORTUNITIES
// -------------------------------------------------------------
router.get('/organizations', (req, res) => {
  const { type } = req.query;
  let query = 'SELECT * FROM organizations WHERE 1=1';
  const params = [];

  if (type && type !== 'All') {
    query += ' AND org_type = ?';
    params.push(type);
  }

  const orgs = db.prepare(query).all(...params);
  const formatted = orgs.map(o => ({
    ...o,
    skills: JSON.parse(o.skills_json || '[]'),
    services: JSON.parse(o.services_json || '[]')
  }));

  res.json({ organizations: formatted });
});

router.get('/opportunities', (req, res) => {
  const { type, search } = req.query;
  let query = `
    SELECT opp.*, org.name as org_name, org.logo as org_logo, org.org_type
    FROM opportunities opp
    JOIN organizations org ON opp.organization_id = org.id
    WHERE 1=1
  `;
  const params = [];

  if (type && type !== 'All') {
    query += ' AND opp.opp_type = ?';
    params.push(type);
  }
  if (search) {
    query += ' AND (opp.title LIKE ? OR opp.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  const opps = db.prepare(query).all(...params);
  const formatted = opps.map(o => ({
    ...o,
    skills: JSON.parse(o.skills_json || '[]')
  }));

  res.json({ opportunities: formatted });
});

router.post('/opportunities/:id/apply', requireAuth, (req, res) => {
  const oppId = req.params.id;
  const { notes } = req.body;

  const existing = db.prepare('SELECT 1 FROM opportunity_applications WHERE user_id = ? AND opportunity_id = ?').get(req.user.id, oppId);
  if (existing) {
    return res.json({ message: 'You have already submitted an application for this demo opportunity.' });
  }

  const appId = 'app_' + Date.now();
  db.prepare(`
    INSERT INTO opportunity_applications (id, user_id, opportunity_id, status, notes)
    VALUES (?, ?, ?, 'submitted', ?)
  `).run(appId, req.user.id, oppId, notes || 'Applied via Career Solver');

  const oppObj = db.prepare('SELECT title FROM opportunities WHERE id = ?').get(oppId);
  createNotification(
    req.user.id,
    'Application Submitted 📄',
    `Application registered for "${oppObj?.title || 'Opportunity'}".`,
    '/organizations'
  );
  res.status(201).json({ message: 'Application submitted successfully (Demo listing)!' });
});

// -------------------------------------------------------------
// 13. MODULE 18: BUSINESS & PROJECT BUILDER
// -------------------------------------------------------------
router.post('/business/generate', requireAuth, async (req, res) => {
  try {
    const { ideaTitle, rawDescription, targetAudience } = req.body;
    if (!ideaTitle) return res.status(400).json({ error: 'Idea title is required.' });

    const plan = await runBuildBusinessPlan(ideaTitle, rawDescription, targetAudience);

    const ideaId = 'biz_' + Date.now();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO business_ideas (
        id, user_id, idea_title, problem, target_users, existing_alternatives,
        proposed_solution, value_proposition, mvp_description, validation_tasks_json,
        cost_estimate_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ideaId,
      req.user.id,
      plan.ideaTitle,
      plan.problem,
      plan.targetUsers,
      plan.existingAlternatives,
      plan.proposedSolution,
      plan.valueProposition,
      plan.mvpDescription,
      JSON.stringify(plan.validationTasks),
      JSON.stringify(plan.costPlanning),
      now
    );

    res.json({ ideaId, plan });
  } catch (err) {
    console.error('Business builder error:', err);
    res.status(500).json({ error: 'Business plan generation failed: ' + err.message });
  }
});

router.get('/business/my-ideas', requireAuth, (req, res) => {
  const ideas = db.prepare('SELECT * FROM business_ideas WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({
    ideas: ideas.map(i => ({
      ...i,
      validationTasks: JSON.parse(i.validation_tasks_json || '[]'),
      costPlanning: JSON.parse(i.cost_estimate_json || '{}')
    }))
  });
});

// -------------------------------------------------------------
// 14. MODULE 11: SKILL PASSPORT / PERSONAL GROWTH PROFILE
// -------------------------------------------------------------
router.get('/skill-passport', requireAuth, (req, res) => {
  const skills = db.prepare('SELECT * FROM user_skills WHERE user_id = ? ORDER BY source DESC, verified_at DESC').all(req.user.id);
  const completedTasks = db.prepare("SELECT title, skill, completed_at FROM tasks WHERE user_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 15").all(req.user.id);
  const practiceSessions = db.prepare('SELECT practice_type, mode, created_at, score_metrics_json FROM practice_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10').all(req.user.id);
  const completedChallenges = db.prepare("SELECT c.title, c.badge_icon, cp.completed_at FROM challenge_participants cp JOIN challenges c ON cp.challenge_id = c.id WHERE cp.user_id = ? AND cp.status = 'completed'").all(req.user.id);

  res.json({
    skills,
    completedTasks,
    practiceSessions: practiceSessions.map(p => ({
      ...p,
      scores: JSON.parse(p.score_metrics_json || '{}')
    })),
    completedChallenges
  });
});

router.post('/skill-passport/add-skill', requireAuth, (req, res) => {
  const { skill_name, category = 'technical', level = 'Intermediate' } = req.body;
  if (!skill_name) return res.status(400).json({ error: 'Skill name is required.' });

  const existing = db.prepare('SELECT id FROM user_skills WHERE user_id = ? AND skill_name = ?').get(req.user.id, skill_name);
  if (existing) {
    db.prepare('UPDATE user_skills SET level = ? WHERE id = ?').run(level, existing.id);
    return res.json({ message: 'Skill updated.' });
  }

  const skillId = 'usk_' + Date.now();
  db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_name, category, level, source)
    VALUES (?, ?, ?, ?, ?, 'user_reported')
  `).run(skillId, req.user.id, skill_name, category, level);

  res.status(201).json({ message: 'Skill added to passport!' });
});

// -------------------------------------------------------------
// 15. MODULE 10: PROGRESS DASHBOARD AGGREGATE
// -------------------------------------------------------------
router.get('/dashboard/overview', requireAuth, (req, res) => {
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user.id) || {};
  const activeGoal = db.prepare("SELECT * FROM career_goals WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(req.user.id);
  const activeRoadmap = db.prepare("SELECT * FROM roadmaps WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(req.user.id);

  // Today's tasks
  const todayTasks = db.prepare("SELECT * FROM tasks WHERE user_id = ? AND (is_daily_task = 1 OR due_day = 'Today') ORDER BY order_index ASC").all(req.user.id);

  // Stats
  const totalTasksCompleted = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = 'completed'").get(req.user.id).count;
  const practiceSessionsCount = db.prepare('SELECT COUNT(*) as count FROM practice_sessions WHERE user_id = ?').get(req.user.id).count;

  // Active Challenge
  const activeChallenge = db.prepare(`
    SELECT c.title, c.badge_icon, c.duration_days, cp.progress_days, cp.challenge_id
    FROM challenge_participants cp
    JOIN challenges c ON cp.challenge_id = c.id
    WHERE cp.user_id = ? AND cp.status = 'active'
    LIMIT 1
  `).get(req.user.id);

  // Notifications
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(req.user.id);

  // Next Best Action calculation
  let nextBestAction = {
    title: "Complete Today's Hands-On Task",
    description: "Build your hands-on competency by finishing today's action item.",
    buttonText: "Go to Tasks",
    link: "/tasks",
    type: "task"
  };

  if (todayTasks.length > 0 && todayTasks.some(t => t.status !== 'completed')) {
    const nextTask = todayTasks.find(t => t.status !== 'completed');
    nextBestAction = {
      title: `Next: ${nextTask.title}`,
      description: nextTask.why_it_matters || 'Practice by doing to advance your roadmap.',
      buttonText: "Work on Task",
      link: "/tasks",
      type: "task"
    };
  } else if (!activeRoadmap) {
    nextBestAction = {
      title: "Run Career Reality Check",
      description: "Evaluate your profile against your target career to generate a personalized roadmap.",
      buttonText: "Start Reality Check",
      link: "/reality-check",
      type: "reality_check"
    };
  } else if (practiceSessionsCount === 0) {
    nextBestAction = {
      title: "Practice a Mock Interview Question",
      description: "Receive instant AI evaluation on clarity, structure, and relevance.",
      buttonText: "Open Practice Studio",
      link: "/practice",
      type: "practice"
    };
  }

  res.json({
    profileCompletion: profile.completion_pct || 40,
    activeGoal: activeGoal ? activeGoal.title : 'Explore Career Pathways',
    targetPathway: activeGoal ? activeGoal.target_pathway : (profile.target_goal || 'General'),
    roadmapProgress: activeRoadmap ? activeRoadmap.progress_pct : 0,
    currentPhase: activeRoadmap ? (JSON.parse(activeRoadmap.phases_json || '[]')[activeRoadmap.current_phase_index]?.name || 'Phase 1') : 'Getting Started',
    todayTasks: todayTasks.map(t => ({
      ...t,
      instructions: JSON.parse(t.instructions_json || '[]')
    })),
    stats: {
      tasksCompleted: totalTasksCompleted,
      streakDays: 4,
      practiceCount: practiceSessionsCount,
      weeklyProgressPct: Math.min(100, Math.round((totalTasksCompleted / 7) * 100))
    },
    nextBestAction,
    activeChallenge: activeChallenge || null,
    notifications
  });
});

// -------------------------------------------------------------
// 16. SYSTEM SETTINGS & DEMO CONTROLS
// -------------------------------------------------------------
router.get('/settings', requireAuth, (req, res) => {
  const currentKey = getApiKey();
  const maskedKey = currentKey ? currentKey.substring(0, 4) + '••••••••' + currentKey.substring(currentKey.length - 4) : '';
  const model = getSelectedModel();

  res.json({
    hasApiKey: !!currentKey,
    maskedApiKey: maskedKey,
    activeModel: model,
    availableModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
    heuristicFallbackEnabled: true
  });
});

router.post('/settings', requireAuth, (req, res) => {
  const { apiKey, model } = req.body;
  const now = new Date().toISOString();

  if (apiKey !== undefined) {
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('gemini_api_key', ?, ?)").run(apiKey.trim(), now);
  }
  if (model) {
    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('ai_model', ?, ?)").run(model, now);
  }

  res.json({ message: 'Settings saved successfully.' });
});

router.post('/settings/reset-demo', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can reset demo data.' });
  }

  // Clear and re-seed
  db.exec(`
    DELETE FROM tasks;
    DELETE FROM roadmaps;
    DELETE FROM career_goals;
    DELETE FROM career_assessments;
    DELETE FROM practice_sessions;
    DELETE FROM ai_conversations;
    DELETE FROM challenge_participants;
    DELETE FROM user_skills;
  `);

  seedDatabase();
  res.json({ message: 'Demo data has been reset to default state.' });
});

// -------------------------------------------------------------
// 17. ADMIN DASHBOARD CONTROLS
// -------------------------------------------------------------
router.get('/admin/stats', requireAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  const usersCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const goalsCount = db.prepare('SELECT COUNT(*) as c FROM career_goals').get().c;
  const tasksCount = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
  const postsCount = db.prepare('SELECT COUNT(*) as c FROM community_posts').get().c;
  const mentorsCount = db.prepare('SELECT COUNT(*) as c FROM mentors').get().c;
  const orgsCount = db.prepare('SELECT COUNT(*) as c FROM organizations').get().c;
  const reportsCount = db.prepare("SELECT COUNT(*) as c FROM post_reports WHERE status = 'pending'").get().c;

  res.json({
    counts: {
      users: usersCount,
      goals: goalsCount,
      tasks: tasksCount,
      posts: postsCount,
      mentors: mentorsCount,
      organizations: orgsCount,
      pendingReports: reportsCount
    }
  });
});


// -------------------------------------------------------------
// NOTIFICATIONS SYSTEM (MODULE / SECTION 50)
// -------------------------------------------------------------
router.get('/notifications', requireAuth, (req, res) => {
  const notifs = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 30
  `).all(req.user.id);
  const unreadCount = db.prepare(`
    SELECT COUNT(*) as c FROM notifications 
    WHERE user_id = ? AND is_read = 0
  `).get(req.user.id).c;
  res.json({ notifications: notifs, unreadCount });
});

router.put('/notifications/:id/read', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.put('/notifications/read-all', requireAuth, (req, res) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ success: true });
});

router.delete('/notifications/:id', requireAuth, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// -------------------------------------------------------------
// MENTOR REVIEW & INCOMING REQUESTS (SECTION 18, 19, 30)
// -------------------------------------------------------------
router.get('/mentors/incoming-requests', requireAuth, (req, res) => {
  const requests = db.prepare(`
    SELECT mr.*, u.name as mentee_name, u.email as mentee_email, u.avatar as mentee_avatar,
           up.occupation as mentee_occupation, up.target_goal as mentee_target_goal,
           m.name as mentor_name
    FROM mentor_requests mr
    JOIN users u ON mr.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    JOIN mentors m ON mr.mentor_id = m.id
    ORDER BY mr.created_at DESC
  `).all();
  res.json({ requests });
});

router.put('/mentors/requests/:id/respond', requireAuth, (req, res) => {
  const { status, response_notes } = req.body;
  if (!['accepted', 'declined', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const existing = db.prepare(`
    SELECT mr.*, m.name as mentor_name 
    FROM mentor_requests mr 
    JOIN mentors m ON mr.mentor_id = m.id 
    WHERE mr.id = ?
  `).get(req.params.id);

  if (!existing) {
    return res.status(404).json({ error: 'Mentorship request not found.' });
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE mentor_requests 
    SET status = ?, response_notes = ?, updated_at = ?
    WHERE id = ?
  `).run(status, response_notes || '', now, req.params.id);

  createNotification(
    existing.user_id,
    status === 'accepted' ? 'Mentor Request Accepted! 🎉' : 'Mentor Request Update',
    `${existing.mentor_name} has ${status} your mentorship request.${response_notes ? ` Note: "${response_notes}"` : ''}`,
    '/mentors'
  );

  res.json({ success: true, message: `Request marked as ${status}.` });
});

// -------------------------------------------------------------
// OPPORTUNITY CREATION / PARTNER POSTING (SECTION 20, 21, 30)
// -------------------------------------------------------------
router.post('/opportunities', requireAuth, (req, res) => {
  const {
    organization_id,
    title,
    opp_type,
    skills,
    location,
    duration,
    description,
    eligibility,
    application_info
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  let orgId = organization_id;
  if (!orgId) {
    const firstOrg = db.prepare('SELECT id FROM organizations LIMIT 1').get();
    orgId = firstOrg ? firstOrg.id : 'org_default';
  }

  const oppId = 'opp_' + Date.now();
  const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills || 'General']);

  db.prepare(`
    INSERT INTO opportunities (
      id, organization_id, title, opp_type, skills_json, location, duration,
      description, eligibility, application_info, status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', 1)
  `).run(
    oppId,
    orgId,
    title,
    opp_type || 'Internship',
    skillsJson,
    location || 'Remote / Hybrid',
    duration || '3 Months',
    description,
    eligibility || 'Open to all motivated learners',
    application_info || 'Click apply on Career Solver platform'
  );

  res.status(201).json({ success: true, id: oppId, message: 'Opportunity posted successfully!' });
});

// -------------------------------------------------------------
// COMPREHENSIVE ADMIN PORTAL API (SECTION 30 & 48)
// -------------------------------------------------------------
router.get('/admin/users', requireAuth, (req, res) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.avatar, u.created_at,
           up.persona_type, up.occupation, up.target_goal, up.completion_pct, up.education_level
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    ORDER BY u.created_at DESC
  `).all();
  res.json({ users });
});

router.put('/admin/users/:id/role', requireAuth, (req, res) => {
  const { role } = req.body;
  if (!['user', 'mentor', 'organization', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ success: true, message: `User role updated to ${role}` });
});

router.get('/admin/reports', requireAuth, (req, res) => {
  const reports = db.prepare(`
    SELECT pr.id, pr.post_id, pr.user_id as reporter_id, pr.reason, pr.status, pr.created_at,
           cp.title as post_title, cp.content as post_content, cp.author_name, cp.category as post_category,
           u.name as reporter_name
    FROM post_reports pr
    JOIN community_posts cp ON pr.post_id = cp.id
    LEFT JOIN users u ON pr.user_id = u.id
    ORDER BY pr.created_at DESC
  `).all();
  res.json({ reports });
});

router.put('/admin/reports/:id/action', requireAuth, (req, res) => {
  const { action } = req.body;
  const report = db.prepare('SELECT * FROM post_reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found.' });

  if (action === 'delete_post') {
    db.prepare('DELETE FROM community_posts WHERE id = ?').run(report.post_id);
    db.prepare("UPDATE post_reports SET status = 'reviewed' WHERE post_id = ?").run(report.post_id);
    return res.json({ success: true, message: 'Reported post deleted and report resolved.' });
  } else if (action === 'dismiss') {
    db.prepare("UPDATE post_reports SET status = 'dismissed' WHERE id = ?").run(req.params.id);
    return res.json({ success: true, message: 'Report dismissed.' });
  }

  res.status(400).json({ error: 'Invalid action.' });
});

router.get('/admin/mentors', requireAuth, (req, res) => {
  const mentors = db.prepare('SELECT * FROM mentors ORDER BY name ASC').all().map(m => ({
    ...m,
    skills: JSON.parse(m.skills_json || '[]'),
    languages: JSON.parse(m.languages_json || '[]')
  }));
  res.json({ mentors });
});

router.put('/admin/mentors/:id/verify', requireAuth, (req, res) => {
  const mentor = db.prepare('SELECT verification_status FROM mentors WHERE id = ?').get(req.params.id);
  if (!mentor) return res.status(404).json({ error: 'Mentor not found.' });
  const newStatus = mentor.verification_status === 'Verified Mentor' ? 'Pending Verification' : 'Verified Mentor';
  db.prepare('UPDATE mentors SET verification_status = ? WHERE id = ?').run(newStatus, req.params.id);
  res.json({ success: true, verification_status: newStatus });
});

router.get('/admin/organizations', requireAuth, (req, res) => {
  const orgs = db.prepare('SELECT * FROM organizations ORDER BY name ASC').all().map(o => ({
    ...o,
    skills: JSON.parse(o.skills_json || '[]'),
    services: JSON.parse(o.services_json || '[]')
  }));
  const opps = db.prepare(`
    SELECT o.*, org.name as org_name 
    FROM opportunities o 
    JOIN organizations org ON o.organization_id = org.id 
    ORDER BY o.deadline ASC
  `).all().map(op => ({
    ...op,
    skills: JSON.parse(op.skills_json || '[]')
  }));
  res.json({ organizations: orgs, opportunities: opps });
});

export default router;
