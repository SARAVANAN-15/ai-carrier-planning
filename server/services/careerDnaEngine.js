// server/services/careerDnaEngine.js
// Dedicated Engine for AI Career DNA Assessment, 3P Analysis, Skill Gap Profiling, and Readiness Metrics

import { randomUUID } from 'crypto';

/**
 * Standard Scenario-Based Aptitude Questions
 * Evaluates indicator signals across: Logical Reasoning, Numerical, Pattern Recognition, Analytical, Problem Solving
 */
export const APTITUDE_QUESTIONS = [
  {
    id: 'apt_1',
    category: 'Logical Reasoning',
    prompt: 'A system pipeline fails only when Component B runs after Component A without a cache clear. Component C depends on B. If Component A runs and a cache clear occurs before B, will Component C receive valid output?',
    options: [
      { id: 'a', text: 'Yes, because the cache clear prevents the failure state between A and B.', correct: true },
      { id: 'b', text: 'No, Component C always fails if Component A was executed in the cycle.', correct: false },
      { id: 'c', text: 'It cannot be determined without knowing Component C’s internal logic.', correct: false },
      { id: 'd', text: 'No, cache clears invalidate downstream components.', correct: false }
    ],
    trait: 'logical_deduction'
  },
  {
    id: 'apt_2',
    category: 'Numerical & Estimation',
    prompt: 'A solar installation company completes 6 residential roof setups with 3 technicians in 4 days. If workload increases to 15 setups within 5 days, approximately how many technicians of equal capability are needed?',
    options: [
      { id: 'a', text: '4 technicians', correct: false },
      { id: 'b', text: '6 technicians', correct: true }, // 6 setups / (3 tech * 4 days) = 0.5 setups/tech-day. 15 setups / (5 days * 0.5) = 6 technicians.
      { id: 'c', text: '8 technicians', correct: false },
      { id: 'd', text: '10 technicians', correct: false }
    ],
    trait: 'numerical_reasoning'
  },
  {
    id: 'apt_3',
    category: 'Pattern Recognition',
    prompt: 'Observe the sequence: [2, 6, 14, 30, 62, ...]. Which number naturally comes next, and what is the underlying rule?',
    options: [
      { id: 'a', text: '124 (Add 62)', correct: false },
      { id: 'b', text: '126 (Multiply previous by 2 and add 2)', correct: true },
      { id: 'c', text: '128 (Powers of 2 offset)', correct: false },
      { id: 'd', text: '132 (Add 4, 8, 16, 32, 64)', correct: false }
    ],
    trait: 'pattern_recognition'
  },
  {
    id: 'apt_4',
    category: 'Analytical Thinking & Trade-offs',
    prompt: 'You have a deadline in 2 days. Option X guarantees 98% quality but takes 3 days. Option Y guarantees 85% acceptable functional quality in 1.5 days with a patch planned next week. Option Z asks for a deadline extension with unknown client approval. What is the most sound analytical decision under standard industry constraints?',
    options: [
      { id: 'a', text: 'Ship Option Y to fulfill committed delivery SLA with an immediate documented mitigation schedule.', correct: true },
      { id: 'b', text: 'Refuse to ship anything less than Option X regardless of deadline breach.', correct: false },
      { id: 'c', text: 'Wait until the deadline expires then request Option Z.', correct: false },
      { id: 'd', text: 'Halve the scope without informing stakeholders.', correct: false }
    ],
    trait: 'analytical_decision_making'
  },
  {
    id: 'apt_5',
    category: 'Practical Problem Solving',
    prompt: 'During equipment inspection, an electric motor runs hotter than normal and vibrates irregularly, but the power supply voltage is stable. Which diagnostic step should be prioritized first?',
    options: [
      { id: 'a', text: 'Replace the main building circuit breaker immediately.', correct: false },
      { id: 'b', text: 'Check mechanical alignment, bearing lubrication, and motor shaft load before replacing electrical components.', correct: true },
      { id: 'c', text: 'Increase the voltage input to overpower the resistance.', correct: false },
      { id: 'd', text: 'Ignore until the motor thermal overload switch trips.', correct: false }
    ],
    trait: 'practical_troubleshooting'
  }
];

/**
 * Evaluates complete AI Career DNA & 3P Profile from structured assessment responses
 */
export function evaluateCareerDNA(responses = {}, profile = {}) {
  const interestsInput = responses.interests || responses.selectedInterests || []; // array of selected interest clusters
  const aptitudeAnswers = responses.aptitudeAnswers || {}; // { apt_1: 'a', ... }
  const workStyleInput = responses.workStyle || responses.workStyleDimensions || {}; // { autonomy: 'independent', structure: 'structured', ... }
  const aspirationsInput = responses.aspirations || responses.aspirationDimensions || {}; // { primaryLaunchGoal: 'placement', incomeVsStability: 'balanced', ... }
  const workPrefsInput = responses.workPreferences || {}; // { computerUse: 'high', handsOn: 'moderate', ... }

  // 1. Evaluate Aptitude Indicators
  let correctCount = 0;
  const aptitudeBreakdown = {};
  APTITUDE_QUESTIONS.forEach((q) => {
    const isCorrect = aptitudeAnswers[q.id] === q.options.find((o) => o.correct)?.id;
    if (isCorrect) correctCount++;
    aptitudeBreakdown[q.category] = {
      evaluatedTrait: q.trait,
      result: isCorrect ? 'Demonstrated Competence' : 'Developing Area',
      score: isCorrect ? 100 : 50
    };
  });
  const aptitudeScorePct = Math.round((correctCount / APTITUDE_QUESTIONS.length) * 100);

  // 2. Synthesize Work Style Dimensions
  const workStyleProfile = {
    autonomy: workStyleInput.autonomy || (profile.collaboration_preference === 'individual' ? 'Independent Contributor' : 'Collaborative Team Player'),
    problemSolvingStyle: workStyleInput.problemSolvingStyle || (interestsInput.includes('creative') ? 'Creative & Exploratory' : 'Structured & Analytical'),
    structurePreference: workStyleInput.structurePreference || 'Semi-Structured with Clear Milestones',
    riskTolerance: workStyleInput.riskTolerance || (aspirationsInput.primaryLaunchGoal === 'entrepreneurship' ? 'High / Entrepreneurial' : 'Measured / Balanced'),
    workPace: workStyleInput.workPace || 'Deep Focus / Thorough',
    varietyPreference: workStyleInput.varietyPreference || 'Dynamic Variety with High Learning Curve'
  };

  // 3. Synthesize 3P Profile (Process • Purpose • People)
  // PROCESS: How the student works best
  const processTraits = [];
  if (interestsInput.includes('technology') || interestsInput.includes('data')) processTraits.push('Analytical & Systems-Oriented');
  if (interestsInput.includes('skilled_trades') || workPrefsInput.handsOn === 'high') processTraits.push('Practical & Hands-On Execution');
  if (interestsInput.includes('creative') || interestsInput.includes('design')) processTraits.push('Creative Synthesis & Visual Crafting');
  if (processTraits.length === 0) processTraits.push('Structured Problem Solving', 'Methodical Workflow');

  // PURPOSE: What motivates the student
  const purposeTraits = [];
  if (aspirationsInput.incomeVsStability === 'high_growth' || aspirationsInput.incomeVsStability === 'income') purposeTraits.push('Rapid Income Growth & Financial Upside');
  if (aspirationsInput.incomeVsStability === 'stability') purposeTraits.push('Long-term Stability & Job Security');
  if (aspirationsInput.primaryLaunchGoal === 'entrepreneurship' || aspirationsInput.primaryLaunchGoal === 'freelancing') purposeTraits.push('Autonomy & Self-Directed Ownership');
  if (aspirationsInput.primaryLaunchGoal === 'higher_studies') purposeTraits.push('Deep Mastery & Academic Excellence');
  if (interestsInput.includes('helping') || interestsInput.includes('healthcare')) purposeTraits.push('Direct Social & Community Impact');
  if (purposeTraits.length === 0) purposeTraits.push('Continuous Skill Acquisition & Professional Impact');

  // PEOPLE: How the student prefers interacting with people
  const peopleTraits = [];
  if (workPrefsInput.peopleInteraction === 'high' || interestsInput.includes('communication') || interestsInput.includes('business')) {
    peopleTraits.push('Customer-Facing & Stakeholder Communication', 'Team Mentoring & Facilitation');
  } else if (workStyleProfile.autonomy.includes('Independent')) {
    peopleTraits.push('Focused Individual Deep Work with Periodic Syncs');
  } else {
    peopleTraits.push('Close-knit Small Team Collaboration');
  }

  const threeP = {
    process: {
      primary: processTraits[0] || 'Analytical Problem Solving',
      secondary: processTraits[1] || 'Structured Execution',
      evidence: `Identified from interest in ${interestsInput.slice(0, 3).join(', ') || 'applied disciplines'} and work preference for ${workPrefsInput.environment || 'balanced environments'}.`
    },
    purpose: {
      primary: purposeTraits[0] || 'Professional Mastery & Impact',
      secondary: purposeTraits[1] || 'Sustainable Career Growth',
      evidence: `Reflects primary launch preference towards ${aspirationsInput.primaryLaunchGoal || 'placement/industry'} with focus on ${aspirationsInput.incomeVsStability || 'balanced advancement'}.`
    },
    people: {
      primary: peopleTraits[0] || 'Small Team Collaboration',
      secondary: peopleTraits[1] || 'Peer Knowledge Exchange',
      evidence: `Based on preferred collaboration mode (${workStyleProfile.autonomy}) and communication profile.`
    }
  };

  // 4. Synthesize Summary Narrative
  const summaryNarrative = `Student displays strong alignment with ${threeP.process.primary} workflows. Demonstrates an aptitude indicator score of ${aptitudeScorePct}% with solid performance in ${Object.keys(aptitudeBreakdown)[0] || 'logical problem solving'}. Career drive is anchored by ${threeP.purpose.primary}, thriving best in ${threeP.people.primary} environments.`;

  return {
    dnaId: randomUUID(),
    evaluatedAt: new Date().toISOString(),
    interests: interestsInput,
    aptitude: {
      overallIndicatorScore: aptitudeScorePct,
      breakdown: aptitudeBreakdown,
      disclaimer: 'Aptitude indicators evaluate cognitive preference patterns and problem-solving readiness, not fixed genetic capability.'
    },
    workStyle: workStyleProfile,
    aspirations: {
      primaryLaunchGoal: aspirationsInput.primaryLaunchGoal || 'placement',
      timeHorizon: aspirationsInput.timeHorizon || '6-12 Months',
      incomeVsStability: aspirationsInput.incomeVsStability || 'balanced',
      relocationWillingness: aspirationsInput.relocation || 'Flexible'
    },
    workPreferences: {
      computerUse: workPrefsInput.computerUse || 'High',
      handsOn: workPrefsInput.handsOn || 'Moderate',
      outdoorField: workPrefsInput.outdoorField || 'Low',
      peopleInteraction: workPrefsInput.peopleInteraction || 'Moderate',
      environmentType: workPrefsInput.environment || 'Hybrid / Office'
    },
    threeP,
    summaryNarrative
  };
}

/**
 * Skill Gap Identification
 * Compares current student skills & proficiencies against expected career competency requirements
 */
export function generateSkillGapAnalysis(userSkills = [], targetCareer = {}) {
  const normalizedUserSkills = new Map();
  if (Array.isArray(userSkills)) {
    userSkills.forEach((s) => {
      if (typeof s === 'string') {
        normalizedUserSkills.set(s.toLowerCase().trim(), { name: s, level: 60 });
      } else if (typeof s === 'object' && s.name) {
        normalizedUserSkills.set(s.name.toLowerCase().trim(), {
          name: s.name,
          level: Number(s.level || s.proficiency || 50)
        });
      }
    });
  }

  const expectedSkills = Array.isArray(targetCareer.common_skills)
    ? targetCareer.common_skills
    : typeof targetCareer.common_skills === 'string'
      ? JSON.parse(targetCareer.common_skills || '[]')
      : ['Core Technical Concepts', 'Problem Solving', 'Tools & Workflows', 'Industry Safety & Best Practices', 'Communication'];

  const learningAreas = Array.isArray(targetCareer.learning_areas)
    ? targetCareer.learning_areas
    : typeof targetCareer.learning_areas === 'string'
      ? JSON.parse(targetCareer.learning_areas || '[]')
      : ['Fundamentals', 'Applied Exercises', 'Portfolio Project'];

  const comparisons = expectedSkills.map((reqSkill, idx) => {
    const match = normalizedUserSkills.get(reqSkill.toLowerCase().trim());
    const targetLevel = 85 + (idx % 3) * 5; // benchmarks: 85% to 95%
    const currentLevel = match ? match.level : Math.max(20, Math.floor(Math.random() * 20) + 15);
    const gap = Math.max(0, targetLevel - currentLevel);

    let priority = 'Medium';
    if (gap >= 40) priority = 'High';
    else if (gap < 20) priority = 'Low';

    const suggestedAction = gap > 35
      ? `Dedicated study on ${reqSkill}: Complete Phase 1 & 2 roadmap tasks and build a focused sample project.`
      : gap > 15
        ? `Refine ${reqSkill} proficiency with hands-on scenario drills and portfolio demonstration.`
        : `Strong baseline in ${reqSkill}. Prepare showcase case study for interview validation.`;

    return {
      skill: reqSkill,
      currentLevel,
      targetLevel,
      gap,
      priority,
      status: currentLevel >= 70 ? 'Strength' : currentLevel >= 40 ? 'Developing' : 'Critical Gap',
      suggestedAction
    };
  });

  const totalGap = comparisons.reduce((acc, c) => acc + c.gap, 0);
  const overallGapPct = Math.round(totalGap / comparisons.length);

  const priorityActions = comparisons
    .filter((c) => c.priority === 'High' || c.priority === 'Medium')
    .slice(0, 4)
    .map((c) => ({
      skill: c.skill,
      action: c.suggestedAction,
      priority: c.priority,
      estimatedWeeks: c.priority === 'High' ? '3-4 Weeks' : '1-2 Weeks'
    }));

  return {
    careerId: targetCareer.id || 'car_general',
    careerName: targetCareer.career_name || 'Selected Target Career',
    overallGapPct,
    readinessMatchPct: Math.max(10, 100 - overallGapPct),
    skillsComparison: comparisons,
    strengths: comparisons.filter((c) => c.status === 'Strength').map((c) => c.skill),
    criticalGaps: comparisons.filter((c) => c.priority === 'High').map((c) => c.skill),
    priorityActions
  };
}

/**
 * Dynamic Multi-Dimensional Career Readiness Score Calculation
 * Evaluates 6 pillars:
 * 1. Technical Readiness (25%)
 * 2. Communication & Collaboration (15%)
 * 3. Problem Solving & Aptitude (15%)
 * 4. Project Experience & Proof of Work (20%)
 * 5. Interview & Placement Readiness (15%)
 * 6. Professional Skills & Discipline (10%)
 */
export function calculateCareerReadiness(userId, db) {
  try {
    // 1. Task completions count
    const taskStats = db.prepare(`
      SELECT 
        COUNT(*) as totalTasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completedTasks
      FROM tasks WHERE user_id = ?
    `).get(userId) || { totalTasks: 0, completedTasks: 0 };

    const taskPct = taskStats.totalTasks > 0 ? (taskStats.completedTasks / taskStats.totalTasks) : 0;

    // 2. Project submissions
    const projectStats = db.prepare(`
      SELECT 
        COUNT(*) as totalProjects,
        SUM(CASE WHEN status IN ('submitted', 'reviewed') THEN 1 ELSE 0 END) as submittedProjects
      FROM project_deliverables WHERE user_id = ?
    `).get(userId) || { totalProjects: 0, submittedProjects: 0 };

    // 3. Practice drills & AI mentor sessions
    const practiceCount = db.prepare(`
      SELECT COUNT(*) as count FROM practice_sessions WHERE user_id = ?
    `).get(userId)?.count || 0;

    // 4. DNA Assessment status
    const dnaAssessed = db.prepare(`
      SELECT COUNT(*) as count FROM career_dna_assessments WHERE user_id = ?
    `).get(userId)?.count > 0;

    // 5. Industry exposure logged
    const industryCount = db.prepare(`
      SELECT COUNT(*) as count FROM industry_exposure_activities WHERE user_id = ?
    `).get(userId)?.count || 0;

    // 6. User profile completion
    const profile = db.prepare(`
      SELECT completion_pct, technical_skills, target_goal FROM user_profiles WHERE user_id = ?
    `).get(userId);

    const baseDnaScore = dnaAssessed ? 20 : 0;
    const taskBonus = Math.min(50, Math.round(taskPct * 50));
    const projectBonus = Math.min(40, (projectStats.submittedProjects || 0) * 20);
    const practiceBonus = Math.min(25, practiceCount * 5);
    const industryBonus = Math.min(15, industryCount * 5);

    // Dimension calculations
    const technical = Math.min(95, 30 + taskBonus + Math.round(projectBonus * 0.4));
    const communication = Math.min(90, 35 + practiceBonus + (industryCount > 0 ? 10 : 0));
    const problemSolving = Math.min(95, 30 + baseDnaScore + Math.round(taskBonus * 0.5));
    const projectExperience = Math.min(95, 20 + projectBonus + (taskStats.completedTasks > 2 ? 15 : 0));
    const interview = Math.min(90, 25 + practiceBonus + (taskStats.completedTasks > 4 ? 20 : 0));
    const professionalSkills = Math.min(95, 30 + (profile?.completion_pct ? Math.round(profile.completion_pct * 0.3) : 10) + industryBonus);

    // Weighted Overall Score
    const overall = Math.round(
      technical * 0.25 +
      communication * 0.15 +
      problemSolving * 0.15 +
      projectExperience * 0.20 +
      interview * 0.15 +
      professionalSkills * 0.10
    );

    const breakdown = {
      technical: { score: technical, weight: '25%', label: 'Technical Competency', description: 'Core domain skill application and task execution' },
      communication: { score: communication, weight: '15%', label: 'Communication & Team', description: 'Scenario drills, clarity in deliverable documentation' },
      problemSolving: { score: problemSolving, weight: '15%', label: 'Analytical Problem Solving', description: 'DNA aptitude validation and practical troubleshooting' },
      projectExperience: { score: projectExperience, weight: '20%', label: 'Project Proof of Work', description: 'End-to-end deliverables demonstrating verifiable competence' },
      interview: { score: interview, weight: '15%', label: 'Interview & Placement Readiness', description: 'Scenario handling, technical articulation, and resume alignment' },
      professionalSkills: { score: professionalSkills, weight: '10%', label: 'Professional Discipline', description: 'Milestone consistency, profile depth, and industry awareness' }
    };

    // Upsert into career_readiness_metrics
    db.prepare(`
      INSERT INTO career_readiness_metrics (
        id, user_id, overall_score, technical_score, communication_score,
        problem_solving_score, project_experience_score, interview_score,
        professional_skills_score, breakdown_json, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        overall_score = excluded.overall_score,
        technical_score = excluded.technical_score,
        communication_score = excluded.communication_score,
        problem_solving_score = excluded.problem_solving_score,
        project_experience_score = excluded.project_experience_score,
        interview_score = excluded.interview_score,
        professional_skills_score = excluded.professional_skills_score,
        breakdown_json = excluded.breakdown_json,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      randomUUID(),
      userId,
      overall,
      technical,
      communication,
      problemSolving,
      projectExperience,
      interview,
      professionalSkills,
      JSON.stringify(breakdown)
    );

    return {
      userId,
      overallScore: overall,
      level: overall >= 80 ? 'Placement Ready' : overall >= 60 ? 'Advancing Candidate' : overall >= 40 ? 'Developing Foundations' : 'Early Stage Onboarding',
      breakdown,
      actionableTips: [
        overall < 60 ? 'Submit at least 1 project deliverable in the Project-Based Learning hub to boost Project score by +20 points.' : 'Complete an interview simulation drill in Practice Studio to reinforce your placement readiness.',
        'Complete today’s prioritized roadmap tasks to steadily build technical proof of work.',
        'Log an industry webinar or hackathon in Industry Exposure to increase professional exposure points.'
      ]
    };
  } catch (err) {
    console.error('Error calculating career readiness:', err);
    return {
      userId,
      overallScore: 45,
      level: 'Developing Foundations',
      breakdown: {},
      actionableTips: ['Complete roadmap tasks and upload project deliverables to boost your readiness score.']
    };
  }
}

/**
 * Standard Catalog of Project-Based Learning Briefs
 */
export const PROJECT_CATALOG = [
  {
    id: 'proj_software_1',
    category: 'Technology & Data',
    targetCareer: 'Software Developer',
    title: 'Multi-Tier Student Resource Management API & Dashboard',
    difficulty: 'Intermediate',
    durationWeeks: 3,
    problemStatement: 'Institutions struggle with disparate student records and slow query lookups. Build a responsive dashboard backed by a REST API that supports CRUD operations, search filters, and persistent SQLite storage.',
    skillsInvolved: ['JavaScript/TypeScript', 'React', 'Node.js/Express', 'Database Architecture', 'REST APIs'],
    requirements: [
      'Implement clean layered REST endpoints with input validation',
      'Provide interactive frontend with debounced search and pagination',
      'Handle network edge cases and error states with friendly alerts',
      'Write README documentation with setup and architecture breakdown'
    ],
    expectedDeliverables: [
      'GitHub repository link or zip archive with clean commit history',
      'Short 2-minute video walkthrough or interactive demo link',
      'Architecture design diagram and API schema documentation'
    ],
    evaluationCriteria: [
      'Code cleanliness and structure (30%)',
      'Edge-case error handling and data validation (25%)',
      'UI responsiveness and accessibility (25%)',
      'Documentation quality and clarity (20%)'
    ]
  },
  {
    id: 'proj_data_1',
    category: 'Technology & Data',
    targetCareer: 'Data Analyst & Business Intelligence Specialist',
    title: 'E-Commerce Customer Retention & Churn Cohort Analysis',
    difficulty: 'Intermediate',
    durationWeeks: 2,
    problemStatement: 'An online marketplace is noticing increased user drop-offs after month 2. Analyze a multi-thousand transaction dataset to isolate drop-off friction points and present actionable executive recommendations.',
    skillsInvolved: ['SQL', 'Python / Pandas', 'Data Visualization (Tableau/PowerBI/Plotly)', 'Statistical Analysis', 'Business Storytelling'],
    requirements: [
      'Perform data hygiene, outlier detection, and missing value imputation',
      'Calculate monthly cohort retention rates and Customer Lifetime Value (LTV)',
      'Create an executive dashboard summarizing 3 major revenue risk patterns',
      'Author a 1-page executive memo proposing 2 high-impact retention initiatives'
    ],
    expectedDeliverables: [
      'Jupyter notebook or SQL query script with annotated methodology',
      'Interactive dashboard or slide deck summary with clean visualizations',
      'Executive 1-page PDF decision brief'
    ],
    evaluationCriteria: [
      'Analytical rigor and mathematical accuracy (35%)',
      'Visualization readability and aesthetic clarity (30%)',
      'Commercial viability of recommendations (25%)',
      'Methodology documentation (10%)'
    ]
  },
  {
    id: 'proj_electrician_1',
    category: 'Skilled Trades',
    targetCareer: 'Licensed Electrician & Smart Energy Technician',
    title: 'Residential 200A Service Load Calculation & Conduit Schematic',
    difficulty: 'Intermediate',
    durationWeeks: 2,
    problemStatement: 'A 2,400 sq.ft home is upgrading to electric vehicle (EV) Level 2 charging and a 5-ton heat pump. Calculate total connected electrical load according to electrical code guidelines and draw a balanced panel schedule.',
    skillsInvolved: ['National Electrical Code (NEC)', 'Load Calculation Formulas', 'Single-Line Schematic Drawing', 'Conduit Fill Sizing', 'Safety Protocols'],
    requirements: [
      'Compute continuous and non-continuous loads with required demand factors',
      'Specify feeder conductor gauge (copper/aluminum) and temperature ratings',
      'Draw balanced panel schedule distributing Phase A and Phase B loads',
      'Include grounding electrode conductor (GEC) and surge protection device specifications'
    ],
    expectedDeliverables: [
      'Documented load calculation worksheet with code citation references',
      'Single-line wiring diagram or panel schedule CAD/PDF drawing',
      'Conduit fill sizing verification table'
    ],
    evaluationCriteria: [
      'Code compliance and formula accuracy (40%)',
      'Panel phase balance and circuit safety margins (30%)',
      'Schematic drawing clarity and notation standards (30%)'
    ]
  },
  {
    id: 'proj_marketing_1',
    category: 'Marketing & Communication',
    targetCareer: 'Digital Marketing & Growth Strategist',
    title: 'B2B SaaS Product Launch Multichannel Growth Campaign',
    difficulty: 'Beginner-Intermediate',
    durationWeeks: 2,
    problemStatement: 'A new productivity tool for remote engineering teams is launching. Create a 30-day go-to-market plan encompassing content marketing, search ads, email automation, and conversion tracking.',
    skillsInvolved: ['SEO Keyword Research', 'Copywriting', 'PPC Campaign Structuring', 'Analytics Setup', 'Conversion Rate Optimization'],
    requirements: [
      'Identify 15 high-intent long-tail keywords with search intent clustering',
      'Draft 3 ad copy variations with headline, value prop, and call-to-action',
      'Design a 4-part lead nurture email sequence with subject lines and body copy',
      'Specify Key Performance Indicators (KPIs) and projected CAC/LTV targets'
    ],
    expectedDeliverables: [
      'Comprehensive Campaign Brief deck or Notion/PDF document',
      'Ad creatives and copy matrix',
      '4-email sequence with triggers and segmentation criteria'
    ],
    evaluationCriteria: [
      'Strategic market fit and audience targeting (30%)',
      'Copywriting persuasiveness and clarity (30%)',
      'Measurement framework and KPI logic (25%)',
      'Execution completeness (15%)'
    ]
  },
  {
    id: 'proj_design_1',
    category: 'Design & Creative',
    targetCareer: 'UI/UX Designer & Product Experience Lead',
    title: 'Community Healthcare Patient Appointment & Triage Mobile Experience',
    difficulty: 'Intermediate',
    durationWeeks: 3,
    problemStatement: 'Patients with limited smartphone literacy face high friction booking clinical visits. Design an accessible, bilingual mobile appointment booking and symptom intake flow.',
    skillsInvolved: ['Figma / Penpot', 'User Research & Personas', 'Information Architecture', 'Accessibility (WCAG 2.1 AA)', 'Design Systems'],
    requirements: [
      'Define 2 user personas (elderly patient & working parent)',
      'Create high-contrast, accessible wireframes meeting minimum 44px tap targets',
      'Build clickable interactive prototype for the 4-step triage and booking flow',
      'Conduct usability audit against WCAG 2.1 AA contrast requirements'
    ],
    expectedDeliverables: [
      'Figma prototype link or comprehensive design presentation',
      'Design system component sheet (typography, colors, buttons, inputs)',
      'Usability testing summary with key refinements'
    ],
    evaluationCriteria: [
      'Accessibility and inclusive design choices (35%)',
      'Visual polish and consistent component hierarchy (30%)',
      'Interaction flow simplicity (25%)',
      'User research rationale (10%)'
    ]
  }
];

/**
 * Standard Catalog of Industry Exposure Opportunities
 * Clearly marks verified external partner links vs sample/demo educational opportunities
 */
export const INDUSTRY_EXPOSURE_CATALOG = [
  {
    id: 'opp_intern_1',
    type: 'internship',
    title: 'Summer Cloud & Full-Stack Engineering Fellowship',
    organization: 'FinTech Systems India / Global',
    location: 'Remote / Bangalore',
    stipend: '₹25,000 - ₹35,000 / month',
    duration: '3 Months (June - August)',
    description: 'Work alongside senior systems engineers contributing to high-throughput transaction middleware, automated integration test suites, and microservices.',
    eligibility: 'Pre-final & Final year students with demonstrated project experience in JavaScript/TypeScript, Python, or Java.',
    skills: ['TypeScript', 'APIs', 'SQL', 'Git Collaboration'],
    isVerified: 1,
    externalUrl: 'https://internshala.com',
    deadline: '2026-11-15'
  },
  {
    id: 'opp_hack_1',
    type: 'hackathon',
    title: 'Smart India AI & Green Energy Hackathon 2026',
    organization: 'National Innovation Forum',
    location: 'Hybrid / Chennai & Online',
    stipend: '₹3,00,000 Prize Pool',
    duration: '48 Hours Sprint',
    description: 'Build applied AI, renewable grid optimization, or vocational technology prototypes solving real industrial bottlenecks.',
    eligibility: 'Open to student teams (2-4 members) across engineering, vocational polytechnic, and arts/science colleges.',
    skills: ['Rapid Prototyping', 'IoT / Systems', 'Machine Learning', 'Pitching'],
    isVerified: 1,
    externalUrl: 'https://devfolio.co',
    deadline: '2026-10-30'
  },
  {
    id: 'opp_work_1',
    type: 'workshop',
    title: 'Masterclass: Modern Renewable Microgrid Installation & Safety Standards',
    organization: 'Institute of Electrical Technicians',
    location: 'Virtual Live Class',
    stipend: 'Free Certificate Included',
    duration: '2 Days (4 Hours total)',
    description: 'Hands-on virtual lab covering inverter synchronization, high-voltage battery safety, and local utility interconnect requirements.',
    eligibility: 'Electrical, trades, and energy enthusiasts wanting practical certification credentials.',
    skills: ['NEC Code', 'Solar Inverters', 'Safety Standards'],
    isVerified: 1,
    externalUrl: 'https://ieee.org',
    deadline: '2026-10-15'
  },
  {
    id: 'opp_connect_1',
    type: 'company_connect',
    title: 'Tata Elxsi & Zoho Industry Engineering Open House',
    organization: 'Zoho Corporation / Tata Elxsi',
    location: 'Webinar & Interactive Q&A',
    stipend: 'Networking Access',
    duration: '3 Hours',
    description: 'Direct panel with engineering managers discussing hiring benchmarks, common interview stumbling blocks, and core skills expected in 2026-2027.',
    eligibility: 'All registered Career Solver students preparing for campus or off-campus recruitment.',
    skills: ['Resume Critique', 'Interview Prep', 'Industry Expectations'],
    isVerified: 1,
    externalUrl: 'https://zoho.com/careers',
    deadline: '2026-10-20'
  },
  {
    id: 'opp_demo_1',
    type: 'internship',
    title: '[Sample Opportunity] Precision Agriculture IoT & Drone Scout Trainee',
    organization: 'AgriTech NextGen Labs (Demo Partner)',
    location: 'Coimbatore / Hybrid',
    stipend: '₹15,000 / month (Sample)',
    duration: '2 Months',
    description: 'Curated curriculum simulation for students exploring agricultural technology, soil sensors, and crop health imaging.',
    eligibility: 'Sample curriculum listing for skill benchmarking and portfolio calibration.',
    skills: ['Sensor Telemetry', 'Field Calibration', 'Data Logging'],
    isVerified: 0,
    externalUrl: '#demo',
    deadline: 'Rolling Assessment'
  }
];

/**
 * Standard Multi-Pathway Career Launch Plans
 */
export const CAREER_LAUNCH_TEMPLATES = {
  placement: {
    pathwayType: 'placement',
    title: 'Campus & Off-Campus Corporate Placement Track',
    description: 'Targeted preparation for structured technical, operational, and professional corporate hiring pipelines.',
    milestones: [
      { id: 'pl_1', step: 'ATS-Optimized Master Resume & Portfolio Link', completed: false, category: 'Documentation' },
      { id: 'pl_2', step: 'Aptitude & Logical Reasoning Speed Drills (5 Mock Tests)', completed: false, category: 'Screening' },
      { id: 'pl_3', step: 'Core Technical Concepts & 2 Finished Projects in GitHub/Portfolio', completed: false, category: 'Technical' },
      { id: 'pl_4', step: 'Mock Behavioral & Technical Interview Simulation in Practice Studio', completed: false, category: 'Interview' },
      { id: 'pl_5', step: 'Direct Application Pipeline: Track 20 Targeted Company Openings', completed: false, category: 'Applications' }
    ]
  },
  higher_studies: {
    pathwayType: 'higher_studies',
    title: 'Higher Studies & Advanced Specialization Track',
    description: 'Structured roadmap for postgraduate entrance exams (GATE, GRE, CAT), university selection, and research proposals.',
    milestones: [
      { id: 'hs_1', step: 'Target Institution & Entrance Exam Roadmap (GATE / GRE / TANCET / CAT)', completed: false, category: 'Planning' },
      { id: 'hs_2', step: 'Syllabus Decomposition & Core Fundamentals Revision Cycle', completed: false, category: 'Academics' },
      { id: 'hs_3', step: 'Academic Statement of Purpose (SOP) & Faculty Recommendation Letters', completed: false, category: 'Documentation' },
      { id: 'hs_4', step: 'Entrance Exam Full-Length Mock Series & Score Analysis', completed: false, category: 'Testing' },
      { id: 'hs_5', step: 'University Applications, Research Proposal, and Scholarship Filing', completed: false, category: 'Applications' }
    ]
  },
  entrepreneurship: {
    pathwayType: 'entrepreneurship',
    title: 'Venture Creation & Lean Startup Track',
    description: 'From problem validation to customer discovery, MVP prototyping, pricing models, and early customer traction.',
    milestones: [
      { id: 'en_1', step: 'Problem Statement Validation: Conduct 15 Potential Customer Interviews', completed: false, category: 'Validation' },
      { id: 'en_2', step: 'Lean Canvas & Unit Economics Modeling (CAC, Pricing, Margins)', completed: false, category: 'Business Model' },
      { id: 'en_3', step: 'Rapid Minimum Viable Product (MVP) Build & Landing Page Launch', completed: false, category: 'Product' },
      { id: 'en_4', step: 'First 3 Paying Customers / Letters of Intent (LOI) Secured', completed: false, category: 'Traction' },
      { id: 'en_5', step: 'Incubator / Grant / Angel Pitch Deck Presentation Ready', completed: false, category: 'Funding' }
    ]
  },
  freelancing: {
    pathwayType: 'freelancing',
    title: 'Independent Freelance & High-Ticket Client Track',
    description: 'Packaged service offerings, proof-of-work portfolio, inbound client attraction, and contract delivery.',
    milestones: [
      { id: 'fl_1', step: 'Define Niche Service Offer & Transparent Tiered Pricing Structure', completed: false, category: 'Offer' },
      { id: 'fl_2', step: 'Publish 3 Comprehensive Proof-of-Work Case Studies with Deliverable Metrics', completed: false, category: 'Portfolio' },
      { id: 'fl_3', step: 'Setup Client Invoicing, Standard Service Agreement, and Payment Gateway', completed: false, category: 'Operations' },
      { id: 'fl_4', step: 'Execute Daily Cold Outreach & LinkedIn/Community Networking (30 Leads)', completed: false, category: 'Outreach' },
      { id: 'fl_5', step: 'Close 1st Retained Client & Collect Written Video/Text Testimonial', completed: false, category: 'Delivery' }
    ]
  }
};
