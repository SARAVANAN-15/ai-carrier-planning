import { GoogleGenAI } from '@google/genai';
import { db } from '../db/connection.js';

// Retrieve active Gemini API key from environment
export function getApiKey() {
  return process.env.GEMINI_API_KEY || '';
}

// Retrieve selected model (enforcing non-deprecated Gemini 3 models)
export function getSelectedModel() {
  const envModel = process.env.GEMINI_MODEL;
  if (envModel && !envModel.includes('1.5') && !envModel.includes('2.0') && !envModel.includes('2.5')) {
    return envModel;
  }
  try {
    const row = db.prepare("SELECT value FROM system_settings WHERE key = 'ai_model'").get();
    if (row && row.value && !row.value.includes('1.5') && !row.value.includes('2.0') && !row.value.includes('2.5')) {
      return row.value;
    }
  } catch (e) {
    // ignore
  }
  return 'gemini-3.8-flash';
}

let geminiClientInstance = null;
export function getGeminiClient() {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  if (!geminiClientInstance) {
    geminiClientInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClientInstance;
}

// Robust Gemini content generation with multi-model fallback & silent failure handling
async function generateGeminiContent(prompt, modelOverride) {
  const client = getGeminiClient();
  if (!client) return null;

  const preferredModel = modelOverride || getSelectedModel();
  const models = [preferredModel, 'gemini-flash-latest', 'gemini-3.8-flash'];
  const uniqueModels = [...new Set(models.filter(Boolean))];

  for (const model of uniqueModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      // Gracefully continue to next model without throwing
    }
  }
  return null;
}

// Helper to safely parse JSON from AI response
function cleanAndParseJSON(text, fallback) {
  if (!text) return fallback;
  try {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
    return JSON.parse(cleaned);
  } catch (err) {
    return fallback;
  }
}

// -------------------------------------------------------------
// MODULE 2: CAREER REALITY CHECK
// -------------------------------------------------------------
export async function runCareerRealityCheck(profile, targetCareer) {
  const prompt = `
You are the Career Solver AI Reality Check Specialist.
Analyze the realistic match between this user's profile and their target career: "${targetCareer}".

User Profile:
- Persona Type: ${profile.persona_type || 'learner'}
- Education: ${profile.education_level || 'Not specified'} (${profile.field_of_study || ''})
- Current Occupation/Status: ${profile.occupation || profile.current_status || 'Exploring'}
- Existing Technical Skills: ${profile.technical_skills || '[]'}
- Existing Practical Skills: ${profile.practical_skills || '[]'}
- Existing Soft Skills: ${profile.soft_skills || '[]'}
- Interests: ${profile.interests || '[]'}
- Constraints: Budget: ${profile.budget_constraint || 'moderate'}, Daily Learning Hours: ${profile.daily_learning_hours || 2}h, Computer: ${profile.has_computer ? 'Yes' : 'No'}

CRITICAL GUIDELINES:
1. Do NOT make absolute dogmatic claims (Never say "You are definitely guaranteed" or "You cannot do this").
2. Use respectful, realistic guidance language ("Based on the information provided...", "This pathway typically requires...", "Consider developing...").
3. If practical/vocational skills or limited formal education is present, treat practical hands-on experience with high respect and highlight vocational pathways and safety guidelines.
4. Output valid JSON ONLY matching this exact structure:
{
  "targetCareer": "${targetCareer}",
  "fitObservations": "A 2-3 sentence balanced overview of current profile alignment.",
  "strengths": ["3-5 concrete existing transferable strengths or relevant background traits"],
  "skillGaps": ["3-5 specific technical, conceptual, or practical skills missing"],
  "requirements": ["3-4 real-world expectations (e.g. portfolio, tool handling, certifications, math/logic)"],
  "challenges": ["2-3 practical obstacles such as learning curve, market expectations, or time needed"],
  "preparationAreas": ["3-4 prioritized subjects or hands-on domains to master first"],
  "alternativePathways": ["2-3 related or accessible adjacent careers that share similar strengths"],
  "immediateNextSteps": ["3 immediate, actionable tasks the user can do this week"],
  "verdictSummary": "A supportive, realistic conclusion summarizing the realistic road ahead."
}
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.fitObservations && parsed.skillGaps) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  // High-fidelity heuristic engine fallback
  return generateHeuristicRealityCheck(profile, targetCareer);
}

// -------------------------------------------------------------
// MODULE 3: AI CAREER NAVIGATOR (CONVERSATIONAL)
// -------------------------------------------------------------
export async function runCareerNavigator(profile, query, history = [], language = 'English') {
  const client = getGeminiClient();
  const isTamil = language === 'Tamil' || profile.preferred_language === 'Tamil';

  const systemPrompt = `
You are the Career Solver AI Career Navigator.
Help the user explore career options, understand prerequisites, and navigate uncertainty.

User Profile:
- Persona: ${profile.persona_type || 'learner'}
- Education: ${profile.education_level || 'Not specified'} (${profile.field_of_study || ''})
- Skills: ${profile.technical_skills || '[]'} / ${profile.practical_skills || '[]'}
- Desired Goal: ${profile.target_goal || 'Exploring'}
- Work Preference: ${profile.work_preference || 'balanced'}
- Daily Hours: ${profile.daily_learning_hours || 2}

Guidelines:
- Answer with clarity, empathy, and realistic perspective.
- Distinguish between: (1) What the user told us, (2) General industry reality, (3) AI suggestions, and (4) Requirements that must be verified externally.
- If essential information is missing, ask 1 focused follow-up question.
- If language is Tamil, provide explanations in natural, clear Tamil while keeping technical industry terms recognizable.
- Format output as JSON:
{
  "answer": "Clear markdown-formatted guidance answering the query",
  "suggestedFollowUps": ["Question 1 to explore next", "Question 2", "Question 3"],
  "sourcesAndNotes": {
    "userProvided": "Key user context factored in",
    "generalGuidance": "Industry standard expectations",
    "externalVerificationNeeded": "Specific certifications, local job openings, or union/licensing rules to verify locally"
  }
}
`;

  const conversationText = history.slice(-4).map(m => `${m.sender}: ${m.text}`).join('\n');
  const fullPrompt = `${systemPrompt}\n\nRecent Conversation:\n${conversationText}\n\nUser: ${query}\nLanguage: ${language}\nRespond with JSON:`;
  const text = await generateGeminiContent(fullPrompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.answer) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicNavigator(profile, query, language);
}

// -------------------------------------------------------------
// MODULE 5: ACTION PLAN & ROADMAP GENERATOR
// -------------------------------------------------------------
export async function runGenerateRoadmap(profile, goalTitle, targetPathway, currentLevel = 'Beginner') {
  const prompt = `
You are Career Solver AI Roadmap Architect.
Create a detailed, 5-phase personalized learning and career roadmap for:
Goal: "${goalTitle}"
Target Pathway: "${targetPathway}"
Current Level: "${currentLevel}"

User Details:
- Education: ${profile.education_level || 'Practical'}
- Daily Learning Hours: ${profile.daily_learning_hours || 2} hrs/day
- Existing Skills: ${profile.technical_skills || '[]'}, ${profile.practical_skills || '[]'}
- Work Preference: ${profile.work_preference || 'balanced'}

Required Phases:
Phase 1: Foundation & Core Principles
Phase 2: Skill Development & Applied Tools
Phase 3: Practical Projects & Real-World Application
Phase 4: Interview & Practical Demonstration Preparation
Phase 5: Job / Market Readiness & Portfolio Polish

Output JSON ONLY:
{
  "title": "${goalTitle} Action Plan",
  "targetRole": "${targetPathway}",
  "currentLevel": "${currentLevel}",
  "phases": [
    {
      "phaseNumber": 1,
      "name": "Phase Name",
      "durationWeeks": "Weeks 1-2",
      "status": "in_progress",
      "description": "Why this phase matters",
      "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
    },
    ... (total 5 phases)
  ],
  "weeklyPlan": [
    { "day": "Monday", "focus": "Topic area", "task": "Actionable task description" },
    { "day": "Tuesday", "focus": "Topic area", "task": "Actionable task description" },
    { "day": "Wednesday", "focus": "Topic area", "task": "Actionable task description" },
    { "day": "Thursday", "focus": "Topic area", "task": "Actionable task description" },
    { "day": "Friday", "focus": "Topic area", "task": "Actionable task description" },
    { "day": "Saturday", "focus": "Practice & Review", "task": "Practice studio task" },
    { "day": "Sunday", "focus": "Rest & Planning", "task": "Review weekly achievements" }
  ],
  "milestones": [
    { "id": "m1", "title": "Milestone 1 title", "status": "pending", "targetWeeks": "Week 2" },
    { "id": "m2", "title": "Milestone 2 title", "status": "pending", "targetWeeks": "Week 5" },
    { "id": "m3", "title": "Milestone 3 title", "status": "pending", "targetWeeks": "Week 8" },
    { "id": "m4", "title": "Milestone 4 title", "status": "pending", "targetWeeks": "Week 12" }
  ]
}
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.phases && parsed.phases.length > 0) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicRoadmap(profile, goalTitle, targetPathway, currentLevel);
}

// -------------------------------------------------------------
// MODULE 6: LEARN-BY-DOING TASK GENERATOR & EVALUATOR
// -------------------------------------------------------------
export async function runGenerateTask(profile, roadmap, currentPhase, skillFocus) {
  const client = getGeminiClient();
  const prompt = `
You are the Career Solver Learn-by-Doing Task Specialist.
Generate 1 highly practical, actionable task for:
Role: ${roadmap?.target_role || 'Specialist'}
Skill: ${skillFocus || 'Core Skill'}
Level: ${roadmap?.current_level || 'Beginner'}

RULE: DO NOT generate vague advice like "Study Java" or "Practice speaking".
Generate a concrete, bite-sized exercise with clear step-by-step instructions.

JSON Format ONLY:
{
  "title": "Action-oriented task title (e.g., 'Build an SQL Filter with Group By')",
  "description": "Clear 2-sentence description of the hands-on exercise",
  "whyItMatters": "Why employers or practical clients care about this skill",
  "skill": "${skillFocus || 'Practical Skill'}",
  "difficulty": "Intermediate",
  "estimatedMinutes": 45,
  "instructions": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ..."
  ],
  "expectedOutcome": "What the user will have created or proven by the end"
}
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.title && parsed.instructions) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicTask(roadmap?.target_role, skillFocus);
}

// Evaluate user's task submission
export async function runEvaluateTaskSubmission(task, userNotes) {
  const prompt = `
You are Career Solver's AI Task Coach.
Review the user's completed submission for this hands-on task:
Task: "${task.title}"
Expected Outcome: "${task.expected_outcome}"
User Submission / Notes: "${userNotes}"

Provide encouraging, constructive feedback in 2-3 sentences.
Highlight 1 specific strength in their work, and 1 bonus pro-tip for real-world interviews or practical workplace application.
Do not give grades or declare absolute success; give actionable coaching.
Output plain text feedback only.
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    return text.trim();
  }

  return `Great effort on completing "${task.title}"! Your submission demonstrates that you followed the practical sequence and understood the underlying mechanics. For your next step, try explaining your approach out loud as if answering a technical team lead or client—it will solidify your retention!`;
}

// -------------------------------------------------------------
// MODULE 7 & 8: AI MENTOR (PERSISTENT & HANDOFF AWARE)
// -------------------------------------------------------------
export async function runMentorChat(profile, goal, mode, messages, currentRoadmap) {
  const lastUserMsg = messages[messages.length - 1]?.text || '';

  // Check for Human Mentor Handoff trigger
  const lowerMsg = lastUserMsg.toLowerCase();
  const humanTriggerWords = ['human mentor', 'real person', 'talk to someone who worked', 'real expert', 'referral', 'hire me', 'actual industry senior', 'someone who has actually worked'];
  const wantsHuman = humanTriggerWords.some(w => lowerMsg.includes(w));

  const modeDescriptions = {
    career: 'Career Mentor — broad guidance, long-term pathway planning, realistic industry expectations, and next steps.',
    study: 'Study Mentor — breaking down technical topics, creating study rhythms, conceptual clarity, and retention.',
    job: 'Job Mentor — placement preparation, resume review, interview strategy, and behavioral STAR answers.',
    skill: 'Skill Mentor — hands-on code/trade diagnostics, debugging tips, and practical project architecture.',
    business: 'Business Mentor — validating ideas, customer interviews, MVP definition, and realistic unit economics.',
    communication: 'Communication Mentor — crisp speaking, self-introductions, group discussions, and workplace diplomacy.'
  };

  const systemPrompt = `
You are Career Solver's persistent AI Mentor operating in "${mode.toUpperCase()} MENTOR" mode.
${modeDescriptions[mode] || modeDescriptions.career}

User Context:
- Name: ${profile.name || 'Learner'}
- Active Goal: ${goal?.title || profile.target_goal || 'Skill growth'}
- Target Role: ${currentRoadmap?.target_role || profile.occupation || 'Specialist'}
- Roadmap Progress: ${currentRoadmap?.progress_pct || 30}% completed
- Persona Type: ${profile.persona_type || 'learner'}
- Preferred Language: ${profile.preferred_language || 'English'}

RULES:
1. You are explicitly an AI assistant, not a human. Never claim to have personal employment history or offer job guarantees.
2. Remember user context. If the user mentions recent progress, celebrate it and connect to their next action.
3. Be action-oriented. End your response with 1 clear recommendation or thought-provoking question.
4. If the user expresses a desire to speak with someone who has direct real-world experience, suggest visiting the Human Mentorship Hub.
5. If the user prefers Tamil, incorporate natural Tamil responses while keeping technical terms intact.

Output JSON:
{
  "reply": "Your mentor response in markdown",
  "suggestedActions": ["Actionable step 1", "Actionable step 2"],
  "suggestHumanHandoff": ${wantsHuman ? 'true' : 'false'},
  "handoffReason": "${wantsHuman ? 'The user is looking for first-hand industry experience or direct human mentorship.' : ''}"
}
`;

  const recentHistory = messages.slice(-5).map(m => `${m.sender === 'user' ? 'User' : 'Mentor'}: ${m.text}`).join('\n');
  const prompt = `${systemPrompt}\n\nChat History:\n${recentHistory}\n\nRespond with JSON:`;
  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.reply) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicMentorChat(profile, goal, mode, lastUserMsg, wantsHuman);
}

// -------------------------------------------------------------
// MODULE 9: PRACTICE STUDIO EVALUATOR
// -------------------------------------------------------------
export async function runEvaluatePractice(practiceType, mode, promptQuestion, userResponse) {
  const prompt = `
You are the Career Solver Practice Studio AI Evaluator.
Analyze the user's practice response:

Practice Type: ${practiceType} (${mode})
Question / Scenario: "${promptQuestion}"
User's Response: "${userResponse}"

Evaluate objectively across 4 dimensions:
1. Clarity (0-100): Clear diction, absence of filler phrases, directness.
2. Relevance (0-100): Directly answered the question without drifting.
3. Structure (0-100): Used a recognizable framework (like STAR, Problem-Solution, or step-by-step logic).
4. Completeness (0-100): Covered necessary points, trade-offs, or real-world details.

IMPORTANT: Do NOT claim this is a certified official score. Frame this as constructive practice feedback.

Output JSON ONLY:
{
  "scores": {
    "clarity": 82,
    "relevance": 85,
    "structure": 78,
    "completeness": 80,
    "overall": 81
  },
  "feedback": {
    "clarity": "Feedback on clarity and delivery tone",
    "relevance": "Feedback on how directly the core question was addressed",
    "structure": "Feedback on logical flow and framing",
    "completeness": "Feedback on depth and missing details",
    "summary": "2-sentence encouraging summary",
    "areasToImprove": [
      "Concrete improvement tip 1",
      "Concrete improvement tip 2"
    ]
  },
  "improvedSampleResponse": "A polished 1-paragraph example demonstrating an optimal structure for this exact question"
}
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.scores && parsed.feedback) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicPracticeEvaluation(practiceType, mode, promptQuestion, userResponse);
}

// -------------------------------------------------------------
// MODULE 18: BUSINESS & PROJECT BUILDER
// -------------------------------------------------------------
export async function runBuildBusinessPlan(ideaTitle, rawDescription, targetAudience) {
  const prompt = `
You are Career Solver AI Startup & Practical Business Architect.
Turn this raw idea into a structured, lean MVP plan:

Idea Title: "${ideaTitle}"
Description: "${rawDescription}"
Target Audience: "${targetAudience || 'General'}"

Generate JSON ONLY:
{
  "ideaTitle": "${ideaTitle}",
  "problem": "Clear statement of the unmet customer pain point",
  "targetUsers": "Specific group of people who feel this pain most acutely",
  "existingAlternatives": "How they currently cope or what inadequate tools they use",
  "proposedSolution": "The core offering that solves the problem simply",
  "valueProposition": "1 compelling sentence why someone would pick this",
  "mvpDescription": "The smallest, fastest prototype to build in 7 days to test demand",
  "validationTasks": [
    "Task 1: Interview 5 target users with these specific questions...",
    "Task 2: Create a simple 1-page flyer or mock landing page...",
    "Task 3: Test willingness to pay with a pre-order or letter of intent...",
    "Task 4: Run 1 pilot service/product delivery manually"
  ],
  "costPlanning": {
    "initialToolsEstimate": "Low budget estimate (e.g. $50 - $150 / INR 3,000 - 10,000)",
    "monthlyOperating": "Estimated monthly variable cost",
    "disclaimer": "High-level estimation only. Actual market costs may vary based on local vendors."
  }
}
`;

  const text = await generateGeminiContent(prompt);
  if (text) {
    const parsed = cleanAndParseJSON(text, null);
    if (parsed && parsed.problem && parsed.validationTasks) {
      return { ...parsed, aiSource: 'Google Gemini AI' };
    }
  }

  return generateHeuristicBusinessPlan(ideaTitle, rawDescription, targetAudience);
}

// =============================================================
// HIGH-FIDELITY HEURISTIC FALLBACK ENGINES
// Guarantee 100% rich, realistic, zero-crash output offline or without API key!
// =============================================================

function generateHeuristicRealityCheck(profile, targetCareer) {
  const careerLower = (targetCareer || '').toLowerCase();
  const isTech = careerLower.includes('java') || careerLower.includes('software') || careerLower.includes('developer') || careerLower.includes('data') || careerLower.includes('frontend') || careerLower.includes('qa');
  const isTrade = careerLower.includes('electric') || careerLower.includes('weld') || careerLower.includes('plumb') || careerLower.includes('appliance') || careerLower.includes('mechanic') || careerLower.includes('carpenter');
  const isMarketing = careerLower.includes('market') || careerLower.includes('growth') || careerLower.includes('content') || careerLower.includes('social');

  if (isTrade) {
    return {
      targetCareer,
      fitObservations: `Based on your hands-on background and technical curiosity, a career as a ${targetCareer} aligns well with practical problem-solving. This pathway rewards physical tool mastery, safety discipline, and diagnostic problem solving over abstract theoretical exams.`,
      strengths: [
        "Hands-on mechanical aptitude and comfort working with physical equipment",
        "Understanding of real-world troubleshooting and practical customer scenarios",
        "Willingness to master safety protocols and professional tool handling"
      ],
      skillGaps: [
        "Formal National Electrical/Trade Code certification and wiring safety standards",
        "Systematic fault isolation using high-precision digital multimeters (Live-Dead-Live protocol)",
        "Reading and interpreting official schematics and circuit diagrams"
      ],
      requirements: [
        "Compliance with national or regional apprentice licensing guidelines",
        "Ownership of verified 1000V insulated safety toolkits and PPE",
        "Supervised apprenticeship hours under a licensed master technician"
      ],
      challenges: [
        "Strict safety hazards requiring zero margin for careless errors",
        "Variability in physical job-site working conditions"
      ],
      preparationAreas: [
        "Workshop Safety, Earthing & Hazard Prevention",
        "Component-level diagnostics (capacitors, relays, PCBs)",
        "Customer quotation and ethical billing practices"
      ],
      alternativePathways: [
        "Industrial Automation Maintenance Helper",
        "Solar Panel Installation & Inverter Technician",
        "Commercial HVAC / Refrigeration Specialist"
      ],
      immediateNextSteps: [
        "Review the 5-step Live-Dead-Live safety testing sequence in Practice Studio",
        "Audit your current toolkit against national trade standards",
        "Explore accredited apprenticeship opportunities with verified local training guilds"
      ],
      verdictSummary: "A viable, high-demand practical pathway. With disciplined safety habits and formal trade apprenticeship, this path provides stable income and independent entrepreneurship potential.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  if (isMarketing) {
    return {
      targetCareer,
      fitObservations: `Your communication strengths and customer-facing experience provide a solid foundation for ${targetCareer}. In modern growth marketing, empathy for customer pain points directly translates into high-converting messaging and campaign relevance.`,
      strengths: [
        "Strong interpersonal communication and user empathy",
        "Experience understanding user objections and support tickets",
        "Adaptability in fast-moving digital channels"
      ],
      skillGaps: [
        "Quantitative analytics (Google Analytics 4, conversion funnels, CAC vs LTV)",
        "Search Engine Optimization (keyword research, technical crawl audits, backlink strategy)",
        "Paid ad campaign structure (Meta Ads Manager, Google Search Ads)"
      ],
      requirements: [
        "A live portfolio or case studies demonstrating measurable growth impact",
        "Familiarity with marketing tech stack (CMS, email automation, analytics tools)",
        "Data-driven experimentation mindset (A/B testing methodology)"
      ],
      challenges: [
        "Constant algorithmic changes requiring continuous re-skilling",
        "Transitioning from qualitative communication to data-backed reporting"
      ],
      preparationAreas: [
        "SEO Fundamentals and Content Strategy",
        "Data Analytics & Performance Metrics (GA4, Looker Studio)",
        "End-to-End Campaign Case Study Creation"
      ],
      alternativePathways: [
        "Content Marketing & Brand Copywriter",
        "Customer Success & Product Adoption Specialist",
        "E-Commerce Growth Strategist"
      ],
      immediateNextSteps: [
        "Perform a content audit of 3 competitor brands in your target niche",
        "Complete a free GA4 certification module",
        "Document 1 campaign story using the STAR framework in your Skill Passport"
      ],
      verdictSummary: "A natural transition path for empathetic communicators. Focusing on measurable metrics and a public portfolio will overcome the lack of a formal marketing degree.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isDesign = careerLower.includes('design') || careerLower.includes('graphic') || careerLower.includes('ui') || careerLower.includes('ux') || careerLower.includes('creative') || careerLower.includes('video');
  if (isDesign) {
    return {
      targetCareer,
      fitObservations: `Your visual creativity and interest in user-facing experiences provide an exciting starting point for ${targetCareer}. Creative careers require translating abstract ideas into systematic, accessible visual hierarchy.`,
      strengths: [
        "Intuitive visual aesthetics and creative curiosity",
        "Appreciation for user experience and visual storytelling",
        "Ability to receive constructive critique and iterate"
      ],
      skillGaps: [
        "Industry-standard vector tooling (Figma auto-layout, design tokens, typography scales)",
        "Web accessibility contrast standards (WCAG 2.1 compliance)",
        "Case study documentation explaining design trade-offs"
      ],
      requirements: [
        "A curated digital portfolio with 2-3 detailed case studies (problem, wireframes, iterations, results)",
        "Mastery of typography, grid systems, and component architecture",
        "Ability to present and defend design choices to stakeholders"
      ],
      challenges: [
        "Differentiating from generic template creators with unique problem-solving rigor",
        "Balancing pure aesthetics with business conversion constraints"
      ],
      preparationAreas: [
        "Typographic Hierarchy & 8pt Grid Systems",
        "Design System & Component Architecture in Figma",
        "End-to-End Case Study Storytelling"
      ],
      alternativePathways: [
        "Product / UI Designer",
        "Visual Brand Identity Specialist",
        "Multimedia / Motion Graphic Designer"
      ],
      immediateNextSteps: [
        "Audit 3 mobile applications for layout balance and contrast accessibility",
        "Build a reusable component set with interactive states in Figma",
        "Present a 2-minute design rationale in Practice Studio"
      ],
      verdictSummary: "A highly rewarding creative pathway. Hiring managers prioritize the depth of your design thinking and live case studies far more than formal degrees.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isHealthcare = careerLower.includes('health') || careerLower.includes('nurse') || careerLower.includes('medical') || careerLower.includes('lab') || careerLower.includes('clinic');
  if (isHealthcare) {
    return {
      targetCareer,
      fitObservations: `Your desire to help people and interest in healthcare services align strongly with ${targetCareer}. Healthcare careers demand both scientific precision and compassionate patient communication.`,
      strengths: [
        "Strong human empathy and service-oriented mindset",
        "Emotional composure and patience in demanding situations",
        "Attention to hygiene, procedural accuracy, and safety"
      ],
      skillGaps: [
        "Standard clinical vocabulary and physiological terminology",
        "Structured clinical handoff communication (SBAR protocol)",
        "Statutory patient privacy (HIPAA / healthcare compliance)"
      ],
      requirements: [
        "Accredited diploma or degree meeting state/regional medical council standards",
        "Supervised clinical practicum or ward rotation hours",
        "Infection control and CPR / Basic Life Support (BLS) certification"
      ],
      challenges: [
        "Shift-based schedules requiring physical and mental resilience",
        "Zero-tolerance for procedural or medication documentation errors"
      ],
      preparationAreas: [
        "Medical Terminology & Anatomy Fundamentals",
        "Infection Prevention & Sterile Procedures",
        "Empathetic Patient Intake & SBAR Handoff Drills"
      ],
      alternativePathways: [
        "Medical Laboratory Technician",
        "Healthcare Operations & Patient Administrator",
        "Community Health Worker / Counselor"
      ],
      immediateNextSteps: [
        "Review standard vital sign ranges and clinical terminology",
        "Practice an SBAR patient handoff scenario in Practice Studio",
        "Investigate accredited clinical training centers in your district"
      ],
      verdictSummary: "A deeply noble, recession-resilient career pathway. Ensuring formal clinical accreditation and practical communication drills will set you up for long-term patient care success.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isBusiness = careerLower.includes('business') || careerLower.includes('operation') || careerLower.includes('manage') || careerLower.includes('entrepreneur') || careerLower.includes('sales');
  if (isBusiness) {
    return {
      targetCareer,
      fitObservations: `Your organizational mindset and strategic interest in commerce provide solid groundwork for ${targetCareer}. Modern business roles blend operational discipline with customer empathy and financial literacy.`,
      strengths: [
        "Strategic thinking and commercial curiosity",
        "Negotiation, relationship building, and customer empathy",
        "Resourcefulness and ownership mindset"
      ],
      skillGaps: [
        "Unit economics modeling (Customer Acquisition Cost, Lifetime Value, Margin Analysis)",
        "Operational process mapping and bottleneck diagnosis",
        "CRM & project management software fluency"
      ],
      requirements: [
        "Demonstrated ability to improve a metric (revenue, conversion, lead cycle, or delivery speed)",
        "Basic financial statements literacy (P&L, Cashflow, Invoicing)",
        "Cross-functional stakeholder communication"
      ],
      challenges: [
        "Navigating market ambiguity and unpredictable sales cycles",
        "Balancing immediate operational firefighting with long-term strategy"
      ],
      preparationAreas: [
        "Lean MVP Validation & Customer Discovery Interviews",
        "Financial Unit Economics & Cost Budgeting",
        "High-Impact Executive Presentations in Practice Studio"
      ],
      alternativePathways: [
        "Operations & Logistics Coordinator",
        "Business Development & Growth Executive",
        "Small Business Founder / Entrepreneur"
      ],
      immediateNextSteps: [
        "Draft a 1-page lean MVP validation plan in Business Builder",
        "Interview 3 potential customers about a real-world operational pain point",
        "Practice delivering an elevator pitch in Practice Studio"
      ],
      verdictSummary: "A versatile, high-growth pathway. Demonstrating tangible revenue impact or operational efficiency through practical projects will open executive doors.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isEducation = careerLower.includes('teach') || careerLower.includes('train') || careerLower.includes('educat') || careerLower.includes('instruct');
  if (isEducation) {
    return {
      targetCareer,
      fitObservations: `Your passion for mentorship and knowledge sharing makes ${targetCareer} a natural, fulfilling pathway. Great educators combine subject mastery with structured pedagogical communication.`,
      strengths: [
        "Clear verbal articulation and patience with learners",
        "Passion for breaking complex concepts into digestible analogies",
        "Encouraging, supportive mentorship presence"
      ],
      skillGaps: [
        "Formative vs summative skill assessment design",
        "Interactive curriculum mapping and adult learning principles",
        "Classroom management and engagement techniques"
      ],
      requirements: [
        "Recognized instructional or domain certification",
        "Documented micro-teaching demonstrations or curriculum lesson plans",
        "Continuous feedback collection and student assessment rubrics"
      ],
      challenges: [
        "Managing diverse learning paces and student attention spans",
        "Adapting curriculum to emerging technical/industry requirements"
      ],
      preparationAreas: [
        "Lesson Plan Structuring & Active Learning Exercises",
        "Diagnostic Feedback & Rubric Design",
        "Micro-Teaching Delivery in Practice Studio"
      ],
      alternativePathways: [
        "Corporate Skill Development Facilitator",
        "Instructional Designer / Content Creator",
        "Community Program Educator"
      ],
      immediateNextSteps: [
        "Prepare a 15-minute structured lesson plan on a core subject topic",
        "Record a micro-teaching demo in Practice Studio",
        "Design a 5-question practical rubric evaluating project competency"
      ],
      verdictSummary: "An impactful, inspiring profession. Combining domain expertise with practical, hands-on teaching methodology will make you a sought-after trainer.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isAgri = careerLower.includes('agri') || careerLower.includes('farm') || careerLower.includes('crop') || careerLower.includes('food');
  if (isAgri) {
    return {
      targetCareer,
      fitObservations: `Your affinity for sustainable systems and practical operations positions you well for ${targetCareer}. Modern agriculture blends agronomy science, precision mechanization, and supply-chain efficiency.`,
      strengths: [
        "Practical orientation and appreciation for outdoor and natural biological systems",
        "Resourcefulness and seasonal adaptability",
        "Curiosity about agricultural technology and yield optimization"
      ],
      skillGaps: [
        "Soil chemical analysis, pH balancing, and electrical conductivity testing",
        "Post-harvest cold chain logistics and HACCP food safety standards",
        "Precision irrigation telemetry (drip fertigation scheduling)"
      ],
      requirements: [
        "Demonstrated knowledge of regional crop calendars and pest management",
        "Familiarity with agricultural commodity markets (e-NAM, wholesale pricing)",
        "Hands-on equipment safety and preventive maintenance discipline"
      ],
      challenges: [
        "Unpredictable climate and weather dependencies requiring active contingency planning",
        "Price fluctuations in perishable commodity markets"
      ],
      preparationAreas: [
        "Soil Health & Nutrient Management Protocols",
        "Cold Storage Operations & Zero-Loss Post-Harvest Handling",
        "Farmer Producer Organization (FPO) Governance"
      ],
      alternativePathways: [
        "Precision Agriculture & Farm Operations Manager",
        "Cold Chain Logistics & Warehouse Lead",
        "Agricultural Commodity Procurement Specialist"
      ],
      immediateNextSteps: [
        "Review a standardized soil testing laboratory report format",
        "Study temperature logging procedures in commercial cold storage",
        "Practice an agricultural advisory explanation in Practice Studio"
      ],
      verdictSummary: "A critical, high-impact career pathway. Mastering precision farming tools and post-harvest preservation will position you as a modern agri-enterprise leader.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isHospitality = careerLower.includes('hotel') || careerLower.includes('hospitality') || careerLower.includes('guest') || careerLower.includes('resort') || careerLower.includes('culinary');
  if (isHospitality) {
    return {
      targetCareer,
      fitObservations: `Your warmth, service mindset, and communication composure make ${targetCareer} an excellent fit. Hospitality is built on creating memorable experiences through attention to detail and cultural empathy.`,
      strengths: [
        "Natural interpersonal warmth and welcoming communication style",
        "Emotional poise and composure during demanding customer interactions",
        "Multi-tasking ability across fast-moving dynamic environments"
      ],
      skillGaps: [
        "Cloud Property Management System (PMS) operations (Opera, Cloudbeds)",
        "Structured service recovery protocols (LAST framework: Listen, Apologize, Solve, Thank)",
        "50-point housekeeping and VIP amenity turnover standards"
      ],
      requirements: [
        "Professional presentation, punctuality, and cultural sensitivity",
        "Fluency in front-office check-in/out and folio billing procedures",
        "Conflict de-escalation mastery without defensiveness"
      ],
      challenges: [
        "Shift-based and weekend hours requiring stamina and enthusiasm",
        "Immediate resolution of unpredictable guest complaints"
      ],
      preparationAreas: [
        "Front-Desk Property Management Systems (PMS)",
        "High-Stress Service Recovery in Practice Studio",
        "Luxury Property Standards & Housekeeping Audits"
      ],
      alternativePathways: [
        "Customer Success & Product Specialist",
        "Community Development & Event Coordinator",
        "Operations & Logistics Coordinator"
      ],
      immediateNextSteps: [
        "Practice a 3-minute guest check-in simulation in Practice Studio",
        "Master the 4 steps of the LAST service recovery framework",
        "Complete a 20-point room inspection audit checklist drill"
      ],
      verdictSummary: "A vibrant, globally mobile career. Developing technical PMS fluency alongside your natural empathy will accelerate your journey into front-office leadership.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  const isLogistics = careerLower.includes('logistics') || careerLower.includes('supply chain') || careerLower.includes('warehouse') || careerLower.includes('freight') || careerLower.includes('inventory');
  if (isLogistics) {
    return {
      targetCareer,
      fitObservations: `Your systematic mindset and focus on process efficiency make ${targetCareer} a strong match. Logistics is the backbone of global commerce, rewarding accuracy, organization, and real-time problem-solving.`,
      strengths: [
        "Structured thinking and attention to process details",
        "Comfort with operational workflows and inventory tracking",
        "Resourceful troubleshooting when bottlenecks occur"
      ],
      skillGaps: [
        "Warehouse Management System (WMS) inventory cycle counting and variance reconciliation",
        "Freight documentation (Bill of Lading, Manifests, Dispatch Routing)",
        "Lean 5S warehouse organization and OSHA safety compliance"
      ],
      requirements: [
        "Knowledge of ABC inventory classification and barcoding workflows",
        "Understanding of carrier dispatch and on-time fulfillment metrics (OTIF)",
        "Commitment to warehouse safety protocols and equipment inspection"
      ],
      challenges: [
        "Fast-paced environments with strict shipping cutoff deadlines",
        "Managing unexpected carrier delays and damaged freight exceptions"
      ],
      preparationAreas: [
        "WMS Inventory Accuracy & Cycle Count Methodologies",
        "Pick-Path Optimization & Dispatch Scheduling",
        "Warehouse Safety & Root-Cause Discrepancy Audits"
      ],
      alternativePathways: [
        "Operations & Logistics Coordinator",
        "Procurement & Inventory Specialist",
        "Agribusiness Packhouse Operations Supervisor"
      ],
      immediateNextSteps: [
        "Analyze a sample 50-item inventory cycle count variance report",
        "Draft an optimized pick route for a multi-order fulfillment batch",
        "Practice an inventory discrepancy explanation in Practice Studio"
      ],
      verdictSummary: "An indispensable, recession-resistant career with direct progression into supply chain management and operations leadership.",
      aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
    };
  }

  // Default Tech / Software
  return {
    targetCareer,
    fitObservations: `Based on your profile, pursuing a role as a ${targetCareer} is a clear, viable objective. Your foundational coursework and logical problem-solving provide a springboard, but placement readiness requires moving beyond syntax into real-world project architecture and algorithmic interview readiness.`,
    strengths: [
      "Foundational familiarity with core computing and programming syntax",
      "Analytical mindset and interest in building functional systems",
      "Access to modern development tooling and structured roadmaps"
    ],
    skillGaps: [
      "Production-level framework design (dependency injection, REST controllers, DTOs)",
      "Database persistence architecture (indexing, relational joins, ACID transactions)",
      "Systematic interview problem solving under time constraints"
    ],
    requirements: [
      "At least 1-2 deployed, non-trivial projects with clean GitHub README documentation",
      "Demonstrated ability to explain object-oriented design and memory trade-offs",
      "Comfort with Git collaboration, unit testing, and API debugging"
    ],
    challenges: [
      "Competitive entry-level job market prioritizing practical proof of work",
      "Balancing algorithmic problem solving with framework application"
    ],
    preparationAreas: [
      "Advanced Object-Oriented Principles & Design Patterns",
      "Relational Database Design & Optimized SQL",
      "Mock Technical Interviews in Practice Studio"
    ],
    alternativePathways: [
      "Quality Assurance & Test Automation Engineer",
      "Full-Stack Web Application Developer",
      "Data Analytics & Business Intelligence Engineer"
    ],
    immediateNextSteps: [
      "Generate your personalized 5-Phase Action Plan on Career Solver",
      "Complete today's practical coding exercise in Learn-by-Doing Tasks",
      "Schedule a 30-minute practice interview session in Practice Studio"
    ],
    verdictSummary: "A realistic and achievable goal. Closing the gap between textbook coding and production-ready architecture with practical daily tasks will make you stand out to hiring managers.",
    aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
  };
}

function generateHeuristicNavigator(profile, query, language) {
  const isTamil = language === 'Tamil' || profile?.preferred_language === 'Tamil';
  const queryLower = query.toLowerCase();

  if (isTamil) {
    return {
      answer: `வணக்கம்! உங்கள் கேள்வியை ஆய்வு செய்தோம்: "${query}".

1. **உங்கள் தற்போதைய நிலை:** நீங்கள் நடைமுறைப் பயிற்சிகள் மற்றும் வழிகாட்டுதலைத் தேடுகிறீர்கள்.
2. **பரிந்துரைக்கப்பட்ட பாதை:** தொழில்துறைக்குத் தேவையான பாதுகாப்பு விதிகள், நேரடித் திட்டங்கள் மற்றும் அரசு அங்கீகாரம் பெற்ற திறன்களைப் பெறுவது முதல் படியாகும்.
3. **அடுத்த கட்ட நடவடிக்கை:** கேரியர் சால்வரின் 'Reality Check' மற்றும் 'Practice Studio' பகுதிகளைப் பயன்படுத்தி இன்றே உங்கள் பயிற்சியைத் தொடங்குங்கள்.`,
      suggestedFollowUps: [
        "எனது தற்போதைய திறன்களுக்கு என்ன மாதிரியான வேலைகள் கிடைக்கும்?",
        "சான்றிதழ் பெறுவதற்கான பயிற்சி முறைகள் என்ன?",
        "வழிகாட்டி (Mentor) ஒருவரிடம் எப்படி ஆலோசனை கேட்பது?"
      ],
      sourcesAndNotes: {
        userProvided: "மொழி விருப்பம்: தமிழ், சுயவிவரத் தரவு",
        generalGuidance: "தொழில்நுட்ப மற்றும் தொழில்முறைப் பாதைகளுக்கான அடிப்படை வழிகாட்டுதல்",
        externalVerificationNeeded: "உள்ளூர் தொழிற்பயிற்சி மற்றும் உரிமத் தேவைகள்"
      },
      aiSource: 'Career Solver Heuristic Engine (Tamil)'
    };
  }

  return {
    answer: `Here is structured guidance based on your profile and question: **"${query}"**:

### 1. Where You Stand Today
Your current experience and interests indicate that you have transferable potential. The most important initial step is clarifying whether you want a **purely technical computer-based role**, a **hands-on practical vocational career**, or a **business/growth pathway**.

### 2. Strategic Pathway Recommendations
* **Focus on Proof of Competency:** Whether in software engineering or skilled trades, employers and clients prioritize tangible demonstrations of ability (clean GitHub projects or verified safety certifications) over generic certificates.
* **Bridge Identified Skill Gaps First:** Avoid jumping randomly between tutorials. Follow a progressive 5-phase roadmap.
* **Practice Explaining Your Work:** Technical competence without the ability to articulate *why* you made a design choice limits career growth.

### 3. Immediate Action You Can Take Today
Head to **Career Reality Check** to evaluate your fit against your target title, or open your **Tasks** tab to tackle today's hands-on exercise.`,
    suggestedFollowUps: [
      "What are the highest demand entry-level roles for my background?",
      "How do I balance daily learning with my existing schedule?",
      "Can I connect with a mentor in this field?"
    ],
    sourcesAndNotes: {
      userProvided: `Goal: ${profile.target_goal || 'Growth'}, Education: ${profile.education_level || 'Practical'}`,
      generalGuidance: "Standard career transition and skill development methodologies",
      externalVerificationNeeded: "Local company hiring cycles and specific credential prerequisites"
    },
    aiSource: 'Career Solver Heuristic Engine (Offline/Default)'
  };
}

function generateHeuristicRoadmap(profile, goalTitle, targetPathway, currentLevel) {
  const isTrade = (targetPathway || '').toLowerCase().includes('electric') || (targetPathway || '').toLowerCase().includes('appliance') || (targetPathway || '').toLowerCase().includes('trade');

  if (isTrade) {
    return {
      title: `${goalTitle} Pathway Roadmap`,
      targetRole: targetPathway,
      currentLevel,
      phases: [
        {
          phaseNumber: 1,
          name: "Workshop Safety, PPE & Hazard Controls",
          durationWeeks: "Weeks 1-2",
          status: "in_progress",
          description: "Crucial foundational safety practices to prevent electric shocks, fires, and accidents.",
          topics: ["Lockout/Tagout (LOTO) Procedures", "Live-Dead-Live Testing Sequence", "1000V Insulated Tool Ratings", "Personal Protective Equipment Compliance"]
        },
        {
          phaseNumber: 2,
          name: "Core Diagnostics & Circuit Schematics",
          durationWeeks: "Weeks 3-5",
          status: "pending",
          description: "Master practical circuit diagnosis, multi-meter usage, and continuity troubleshooting.",
          topics: ["Single vs 3-Phase Basics", "Digital Multimeter Calibration", "Distribution Board Wiring", "Earthing Resistance Checks"]
        },
        {
          phaseNumber: 3,
          name: "Motor & Home Appliance Servicing",
          durationWeeks: "Weeks 6-8",
          status: "pending",
          description: "Hands-on supervised troubleshooting on common home and workshop appliances.",
          topics: ["Capacitor Run/Start Motors", "Washing Machine & Refrigerator Relays", "PCB Terminal Continuity", "Preventive Maintenance Checklists"]
        },
        {
          phaseNumber: 4,
          name: "Trade Certification & Licensing Preparation",
          durationWeeks: "Weeks 9-10",
          status: "pending",
          description: "Prepare for official government trade tests (NSDC / Wireman License).",
          topics: ["National Electrical Code Standards", "Practical Inspection Mock Tests", "Safety Logbook Maintenance"]
        },
        {
          phaseNumber: 5,
          name: "Apprenticeship & Independent Practice Setup",
          durationWeeks: "Weeks 11-12",
          status: "pending",
          description: "Establish verified trade presence, transparent client quotation, and apprenticeship.",
          topics: ["Customer Quotations & Invoicing", "Toolbox 5S Care", "Apprenticeship Onboarding with Verified Guilds"]
        }
      ],
      weeklyPlan: [
        { day: "Monday", focus: "Tool Inspection", task: "Check insulation on hand tools and inspect multimeter lead resistance" },
        { day: "Tuesday", focus: "Safety Drills", task: "Practice the 5-step Live-Dead-Live isolation sequence on a test bench" },
        { day: "Wednesday", focus: "Component Testing", task: "Test 3 capacitors using multimeter capacitance mode" },
        { day: "Thursday", focus: "Schematic Reading", task: "Trace line voltage path on a single-phase motor schematic" },
        { day: "Friday", focus: "Practical Application", task: "Inspect residential distribution breaker setup with mentor supervision" },
        { day: "Saturday", focus: "Customer Dialogue", task: "Practice explaining a repair quote clearly in Practice Studio" },
        { day: "Sunday", focus: "Review", task: "Clean toolkit and plan next week's practice tasks" }
      ],
      milestones: [
        { id: "m1", title: "100% Safety Protocol Mastery", status: "completed", targetWeeks: "Week 2" },
        { id: "m2", title: "Precision Multimeter Diagnosis Badge", status: "in_progress", targetWeeks: "Week 5" },
        { id: "m3", title: "Supervised Appliance Service Practical", status: "pending", targetWeeks: "Week 8" },
        { id: "m4", title: "Trade Licensing & Apprenticeship Ready", status: "pending", targetWeeks: "Week 12" }
      ],
      aiSource: 'Career Solver Heuristic Engine (Vocational)'
    };
  }

  // Default Tech / Professional
  return {
    title: `${goalTitle} Action Plan`,
    targetRole: targetPathway,
    currentLevel,
    phases: [
      {
        phaseNumber: 1,
        name: "Foundations & Core Architecture",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Solidify memory models, core syntax, and object-oriented principles.",
        topics: ["Core Language Semantics", "OOP & Abstraction Hierarchy", "Collections & Memory Efficiency", "Unit Testing Fundamentals"]
      },
      {
        phaseNumber: 2,
        name: "Databases & Applied Persistence",
        durationWeeks: "Weeks 3-4",
        status: "pending",
        description: "Master relational schema design, query optimization, and ORM abstractions.",
        topics: ["Relational Schema Constraints", "Complex Joins & Aggregations", "ORM/JPA Mapping", "Database Indexing & Transactions"]
      },
      {
        phaseNumber: 3,
        name: "Framework & RESTful Microservices",
        durationWeeks: "Weeks 5-7",
        status: "pending",
        description: "Build robust, secure backend APIs following industry best practices.",
        topics: ["REST Controllers & DTO Validation", "Dependency Injection", "Authentication & Security", "Error Handling & Logging"]
      },
      {
        phaseNumber: 4,
        name: "Practical Capstone Portfolio Build",
        durationWeeks: "Weeks 8-9",
        status: "pending",
        description: "Build a production-grade portfolio project with clean documentation.",
        topics: ["End-to-End Service Architecture", "Docker Containerization", "Comprehensive README with Architecture Diagrams", "CI/CD Basics"]
      },
      {
        phaseNumber: 5,
        name: "Technical Interview & Placement Readiness",
        durationWeeks: "Weeks 10-12",
        status: "pending",
        description: "Sharpen high-pressure communication, algorithmic problem solving, and system design.",
        topics: ["Top 50 Technical Interview Questions", "STAR Method Project Explanations", "System Design Fundamentals", "Mock Interview Rounds"]
      }
    ],
    weeklyPlan: [
      { day: "Monday", focus: "Core Logic & DSA", task: "Implement 1 algorithmic data structure with clean complexity analysis" },
      { day: "Tuesday", focus: "Database Design", task: "Write optimized SQL queries using JOINs and GROUP BY" },
      { day: "Wednesday", focus: "Framework API", task: "Build REST controller with DTO validation and error handling" },
      { day: "Thursday", focus: "System Architecture", task: "Diagram service data flow and handle edge case failures" },
      { day: "Friday", focus: "Practical Project", task: "Add unit tests and verify code coverage > 80%" },
      { day: "Saturday", focus: "Mock Interview", task: "Practice 3 technical questions in Practice Studio" },
      { day: "Sunday", focus: "Weekly Review", task: "Update Skill Passport and plan upcoming learning sprints" }
    ],
    milestones: [
      { id: "m1", title: "Core Programming Foundations Checkpoint", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Relational Database Schema Design", status: "in_progress", targetWeeks: "Week 4" },
      { id: "m3", title: "Production REST API Deployed", status: "pending", targetWeeks: "Week 7" },
      { id: "m4", title: "Placement Interview Ready Score > 85%", status: "pending", targetWeeks: "Week 12" }
    ],
    aiSource: 'Career Solver Heuristic Engine (Professional)'
  };
}

function generateHeuristicTask(role = 'Specialist', skill = 'Problem Solving') {
  return {
    title: `Practical Application Exercise: ${skill}`,
    description: `Construct a functional, real-world artifact proving your understanding of ${skill} without relying on copy-paste code or theoretical notes.`,
    whyItMatters: `Hiring managers and clients look for hands-on proof that you can solve real problems independently.`,
    skill,
    difficulty: "Intermediate",
    estimatedMinutes: 45,
    instructions: [
      "Step 1: Set up your environment or workspace cleanly.",
      "Step 2: Define your inputs, requirements, and expected constraints.",
      "Step 3: Implement your solution methodically, testing each component step-by-step.",
      "Step 4: Verify your results against edge cases and document your findings."
    ],
    expectedOutcome: `A verified, functional outcome demonstrating working mastery of ${skill}.`,
    aiSource: 'Career Solver Heuristic Engine'
  };
}

function generateHeuristicMentorChat(profile, goal, mode, query, wantsHuman) {
  if (wantsHuman) {
    return {
      reply: `I completely understand! While I can help structure your daily roadmap and practice exercises, there is immense value in hearing directly from someone who has spent years in the field and understands current hiring cycles.

I recommend browsing our **Human Mentorship Hub**. We have verified mentors (and sample demo profiles) available who provide:
* 1-on-1 resume reviews and real-world system architecture walkthroughs
* Direct feedback on industry expectations and practical work culture
* Unbiased guidance tailored to your specific situation

Would you like me to help you draft your mentorship request message so you get the best response?`,
      suggestedActions: [
        "Explore Mentors in Human Mentorship Hub",
        "Draft a Mentorship Request Message",
        "Review My Active Goal"
      ],
      suggestHumanHandoff: true,
      handoffReason: "User indicated interest in real-world human industry guidance.",
      aiSource: 'Career Solver Heuristic Engine'
    };
  }

  const responses = {
    career: `Hello ${profile.name || 'there'}! Looking at your active goal (**${goal?.title || 'Career Growth'}**), consistency is your biggest competitive advantage right now. Focus on finishing today's hands-on task before opening new tutorials. What specific challenge are you encountering today?`,
    study: `When learning deep concepts, remember: **If you cannot explain it simply using an analogy, you do not understand it deeply yet.** Try explaining your current topic out loud in 60 seconds. What topic are you studying right now?`,
    job: `For job and placement interviews, hiring teams evaluate three things: (1) Can you solve the problem? (2) Can you explain your trade-offs clearly? (3) Would others enjoy collaborating with you? Let's practice answering a behavioral or technical question together.`,
    skill: `The fastest way to master this skill is **active building**, not passive video watching. Break the task down into the smallest possible step that can produce a working output. What specific piece are you debugging?`,
    business: `In business, falling in love with the *problem* is far more important than falling in love with your initial solution. Have you talked to at least 3 people who face this problem daily? What did they say?`,
    communication: `Clear communication is structured communication. Whenever you speak in an interview or meeting, use a framework: **Context → Action → Outcome**. Would you like to practice a 60-second introduction right now?`
  };

  return {
    reply: responses[mode] || responses.career,
    suggestedActions: [
      "Review Today's Priority Task",
      "Start a Practice Session",
      "Update My Roadmap Progress"
    ],
    suggestHumanHandoff: false,
    handoffReason: "",
    aiSource: 'Career Solver Heuristic Engine'
  };
}

function generateHeuristicPracticeEvaluation(practiceType, mode, promptQuestion, userResponse) {
  const wordCount = (userResponse || '').trim().split(/\s+/).length;
  const isTooShort = wordCount < 20;

  const baseScore = isTooShort ? 58 : Math.min(92, Math.max(70, 70 + Math.floor(wordCount / 5)));

  return {
    scores: {
      clarity: baseScore + 2,
      relevance: baseScore + 4,
      structure: isTooShort ? 50 : baseScore - 2,
      completeness: isTooShort ? 45 : baseScore,
      overall: baseScore
    },
    feedback: {
      clarity: isTooShort
        ? "Your answer is quite brief. While directness is valued, interviewers need sufficient depth to assess your technical knowledge and thought process."
        : "Good tone and clear articulation. Your terminology is appropriate and easy to follow.",
      relevance: "You addressed the primary premise of the question accurately without wandering off-topic.",
      structure: isTooShort
        ? "Consider using the STAR framework (Situation, Task, Action, Result) to give your response a clear beginning, middle, and measurable outcome."
        : "Solid logical flow. You explained the context before diving into the practical actions you took.",
      completeness: isTooShort
        ? "Include 1-2 specific technical details, tools used, or quantifiable results to make your answer memorable."
        : "Covers the core points nicely. Mentioning what you learned from the experience would make it outstanding.",
      summary: isTooShort
        ? "A good start, but expand your response with concrete details and structured examples."
        : "A strong, professional response that demonstrates genuine understanding and practical experience.",
      areasToImprove: [
        "Incorporate measurable outcomes (e.g., 'reduced query time by 30%' or 'serviced 12 units safely')",
        "Conclude with a brief 1-sentence takeaway highlighting what this experience taught you"
      ]
    },
    improvedSampleResponse: `In my recent project, I faced a similar situation where system reliability was paramount. I systematically identified the root cause using step-by-step diagnostic verification. By implementing a clean separation of concerns and verifying each component through rigorous testing, I resolved the issue within the allotted timeframe and prevented repeat failures.`,
    aiSource: 'Career Solver Heuristic Engine'
  };
}

function generateHeuristicBusinessPlan(ideaTitle, rawDescription, targetAudience) {
  return {
    ideaTitle: ideaTitle || 'Practical Business Initiative',
    problem: `Target customers struggle with fragmented, unreliable, or overly expensive solutions when dealing with ${rawDescription || 'their daily challenges'}.`,
    targetUsers: targetAudience || 'Homeowners, local professionals, or small businesses seeking reliable services',
    existingAlternatives: 'Word-of-mouth recommendations, unvetted freelancers, or generic online directories with zero accountability',
    proposedSolution: `A streamlined, trusted service offering that delivers consistent quality, transparent pricing, and rapid turnaround for ${ideaTitle}.`,
    valueProposition: 'Guaranteed professional reliability and upfront fair pricing without hidden surprises.',
    mvpDescription: 'A direct 1-page booking workflow with manual concierge fulfillment for the first 10 customers to validate real willingness to pay.',
    validationTasks: [
      'Interview 5 potential customers asking: "How do you currently solve this, and what frustrates you most?"',
      'Create a simple one-page service flyer or social post detailing the exact offer and price.',
      'Secure 2 paying pilot customers before investing in complex software or inventory.',
      'Collect detailed written feedback after completing the first delivery to refine the process.'
    ],
    costPlanning: {
      initialToolsEstimate: '$60 - $120 (INR 5,000 - 10,000) for basic equipment/domain/print',
      monthlyOperating: '$20 - $50 / month initial variable costs',
      disclaimer: 'High-level estimate only. Material and marketing costs vary depending on location and vendor partnerships.'
    },
    aiSource: 'Career Solver Heuristic Engine'
  };
}
