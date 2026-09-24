import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'career_solver.db');

export const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for high performance and foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export function initDatabase() {
  db.exec(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user', -- 'user', 'mentor', 'organization', 'admin'
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- User Profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      persona_type TEXT DEFAULT 'college_student', -- 'school_student', 'college_student', 'professional', 'vocational_practical', 'entrepreneur', 'higher_studies'
      education_level TEXT,
      field_of_study TEXT,
      current_status TEXT,
      occupation TEXT,
      target_goal TEXT,
      experience_level TEXT DEFAULT 'Beginner',
      technical_skills TEXT DEFAULT '[]', -- JSON array
      soft_skills TEXT DEFAULT '[]', -- JSON array
      practical_skills TEXT DEFAULT '[]', -- JSON array
      interests TEXT DEFAULT '[]', -- JSON array
      work_preference TEXT, -- 'indoor', 'outdoor', 'hands_on', 'computer_based', 'mixed'
      collaboration_preference TEXT, -- 'individual', 'team', 'balanced'
      employment_preference TEXT, -- 'full_time', 'part_time', 'apprenticeship', 'self_employed'
      daily_learning_hours REAL DEFAULT 2.0,
      budget_constraint TEXT DEFAULT 'low',
      has_smartphone INTEGER DEFAULT 1,
      has_computer INTEGER DEFAULT 1,
      internet_access TEXT DEFAULT 'high_speed',
      preferred_language TEXT DEFAULT 'English',
      location TEXT,
      bio TEXT,
      completion_pct INTEGER DEFAULT 30,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Career Goals table
    CREATE TABLE IF NOT EXISTS career_goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_pathway TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'archived'
      target_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Career Reality Checks table
    CREATE TABLE IF NOT EXISTS career_assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_career TEXT NOT NULL,
      fit_observations TEXT NOT NULL, -- JSON or text
      strengths TEXT NOT NULL, -- JSON array
      skill_gaps TEXT NOT NULL, -- JSON array
      requirements TEXT NOT NULL, -- JSON array
      challenges TEXT NOT NULL, -- JSON array
      preparation_areas TEXT NOT NULL, -- JSON array
      alternative_pathways TEXT NOT NULL, -- JSON array
      immediate_next_steps TEXT NOT NULL, -- JSON array
      verdict_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Roadmaps table
    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal_id TEXT,
      title TEXT NOT NULL,
      target_role TEXT NOT NULL,
      current_level TEXT DEFAULT 'Beginner',
      phases_json TEXT NOT NULL, -- JSON array of phases with milestones
      weekly_plan_json TEXT NOT NULL, -- JSON array of weekly schedules
      milestones_json TEXT NOT NULL, -- JSON array
      status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
      current_phase_index INTEGER DEFAULT 0,
      progress_pct INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      roadmap_id TEXT,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      why_it_matters TEXT,
      skill TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Beginner', -- 'Beginner', 'Intermediate', 'Advanced'
      estimated_minutes INTEGER DEFAULT 45,
      instructions_json TEXT NOT NULL, -- JSON array of steps
      expected_outcome TEXT,
      status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'skipped'
      user_notes TEXT,
      ai_feedback TEXT,
      due_day TEXT,
      order_index INTEGER DEFAULT 0,
      is_daily_task INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Practice Sessions table
    CREATE TABLE IF NOT EXISTS practice_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      practice_type TEXT NOT NULL, -- 'interview', 'communication', 'group_discussion', 'business_pitch', 'vocational_safety'
      mode TEXT, -- 'hr', 'technical', 'situational', 'self_intro', 'pitch'
      prompt_question TEXT NOT NULL,
      user_response TEXT NOT NULL,
      feedback_json TEXT NOT NULL, -- { clarity, relevance, structure, completeness, areas_to_improve, summary }
      score_metrics_json TEXT, -- { clarityScore, relevanceScore, structureScore, overallScore }
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- AI Conversations table
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mentor_mode TEXT NOT NULL DEFAULT 'career', -- 'career', 'study', 'job', 'skill', 'business', 'communication'
      title TEXT NOT NULL,
      messages_json TEXT NOT NULL DEFAULT '[]', -- JSON array of { sender, text, timestamp, suggestions }
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Challenges table
    CREATE TABLE IF NOT EXISTS challenges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      skill TEXT NOT NULL,
      duration_days INTEGER NOT NULL DEFAULT 7,
      difficulty TEXT DEFAULT 'Beginner',
      participants_count INTEGER DEFAULT 0,
      daily_tasks_json TEXT NOT NULL, -- JSON array of 7 days
      badge_icon TEXT DEFAULT 'Trophy',
      category TEXT DEFAULT 'general'
    );

    -- Challenge Participants table
    CREATE TABLE IF NOT EXISTS challenge_participants (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_id TEXT NOT NULL,
      progress_days INTEGER DEFAULT 0,
      completed_days_json TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );

    -- Community Posts table
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_role TEXT DEFAULT 'Learner',
      category TEXT NOT NULL, -- 'Career Guidance', 'Technical Learning', 'Vocational Skills', 'Entrepreneurship', 'Interview Prep', 'Success Stories'
      title TEXT,
      content TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Post Likes table
    CREATE TABLE IF NOT EXISTS post_likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Post Comments table
    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Post Reports table
    CREATE TABLE IF NOT EXISTS post_reports (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE
    );

    -- Mentors table (Human Mentorship Hub)
    CREATE TABLE IF NOT EXISTS mentors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      professional_area TEXT NOT NULL,
      current_title TEXT NOT NULL,
      company_or_field TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      skills_json TEXT NOT NULL, -- JSON array
      languages_json TEXT NOT NULL, -- JSON array
      availability TEXT NOT NULL, -- e.g. '2 hours / week', 'Weekends'
      bio TEXT NOT NULL,
      mentoring_areas_json TEXT NOT NULL, -- JSON array
      avatar TEXT,
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 12,
      participation_type TEXT DEFAULT 'Volunteer', -- 'Volunteer', 'Alumni Mentor', 'Professional Mentor', 'Vocational Trainer'
      verification_status TEXT DEFAULT 'Verified Mentor',
      is_demo INTEGER DEFAULT 1 -- 1 for Demo Mentor
    );

    -- Mentor Requests table
    CREATE TABLE IF NOT EXISTS mentor_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      mentor_id TEXT NOT NULL,
      message TEXT NOT NULL,
      goals TEXT,
      preferred_time TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed', 'cancelled'
      response_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES mentors(id) ON DELETE CASCADE
    );

    -- Organizations table
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      org_type TEXT NOT NULL, -- 'Employer', 'Training Provider', 'Educational Institution', 'Skill Development Org', 'NGO'
      industry TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      website TEXT,
      skills_json TEXT NOT NULL, -- JSON array
      services_json TEXT NOT NULL, -- JSON array
      verification_status TEXT DEFAULT 'Verified Partner',
      logo TEXT,
      is_demo INTEGER DEFAULT 1
    );

    -- Opportunities table
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      organization_id TEXT NOT NULL,
      title TEXT NOT NULL,
      opp_type TEXT NOT NULL, -- 'Internship', 'Apprenticeship', 'Training Program', 'Workshop', 'Entry-Level Job'
      skills_json TEXT NOT NULL,
      location TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      application_info TEXT NOT NULL,
      status TEXT DEFAULT 'Open',
      deadline TEXT,
      is_demo INTEGER DEFAULT 1,
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
    );

    -- Opportunity Applications table
    CREATE TABLE IF NOT EXISTS opportunity_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      status TEXT DEFAULT 'submitted', -- 'submitted', 'under_review', 'accepted', 'completed'
      notes TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    -- Business Ideas table (Module 18)
    CREATE TABLE IF NOT EXISTS business_ideas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      idea_title TEXT NOT NULL,
      problem TEXT NOT NULL,
      target_users TEXT NOT NULL,
      existing_alternatives TEXT NOT NULL,
      proposed_solution TEXT NOT NULL,
      value_proposition TEXT NOT NULL,
      mvp_description TEXT NOT NULL,
      validation_tasks_json TEXT NOT NULL, -- JSON array
      cost_estimate_json TEXT NOT NULL, -- JSON object
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- User Skills (Skill Passport)
    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      category TEXT NOT NULL, -- 'technical', 'soft', 'practical'
      level TEXT DEFAULT 'Intermediate', -- 'Beginner', 'Intermediate', 'Proficient', 'Master'
      source TEXT NOT NULL, -- 'user_reported', 'completed_activity', 'verified'
      verified_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- In-App Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- System Settings table (stores API key, model selection, etc.)
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
