import { db } from '../db/connection.js';

// Retrieve all careers from catalog
export function getAllCareers() {
  const rows = db.prepare('SELECT * FROM career_catalog ORDER BY category ASC, career_name ASC').all();
  return rows.map(r => ({
    ...r,
    interest_areas: JSON.parse(r.interest_areas || '[]'),
    work_styles: JSON.parse(r.work_styles || '[]'),
    common_skills: JSON.parse(r.common_skills || '[]'),
    transferable_skills: JSON.parse(r.transferable_skills || '[]'),
    education_pathways: JSON.parse(r.education_pathways || '[]'),
    entry_pathways: JSON.parse(r.entry_pathways || '[]'),
    learning_areas: JSON.parse(r.learning_areas || '[]'),
    practical_tasks: JSON.parse(r.practical_tasks || '[]'),
    portfolio_needs: JSON.parse(r.portfolio_needs || '[]'),
    work_environment: JSON.parse(r.work_environment || '[]'),
    related_careers: JSON.parse(r.related_careers || '[]'),
  }));
}

export function getCareerById(id) {
  const row = db.prepare('SELECT * FROM career_catalog WHERE id = ? OR LOWER(career_name) = LOWER(?)').get(id, id);
  if (!row) return null;
  return {
    ...row,
    interest_areas: JSON.parse(row.interest_areas || '[]'),
    work_styles: JSON.parse(row.work_styles || '[]'),
    common_skills: JSON.parse(row.common_skills || '[]'),
    transferable_skills: JSON.parse(row.transferable_skills || '[]'),
    education_pathways: JSON.parse(row.education_pathways || '[]'),
    entry_pathways: JSON.parse(row.entry_pathways || '[]'),
    learning_areas: JSON.parse(row.learning_areas || '[]'),
    practical_tasks: JSON.parse(row.practical_tasks || '[]'),
    portfolio_needs: JSON.parse(row.portfolio_needs || '[]'),
    work_environment: JSON.parse(row.work_environment || '[]'),
    related_careers: JSON.parse(row.related_careers || '[]'),
  };
}

/**
 * Career Discovery Intelligence Engine
 * Computes transparent alignment metrics between user profile, constraints, and priorities
 */
export function runCareerDiscovery(profile, priorities = {}, careerDna = null) {
  const catalog = getAllCareers();

  // If user has a saved Career DNA assessment in the database and none was explicitly passed, load it
  if (!careerDna && profile.user_id) {
    try {
      const dnaRow = db.prepare('SELECT * FROM career_dna_assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(profile.user_id);
      if (dnaRow) {
        careerDna = {
          interests: JSON.parse(dnaRow.interests_json || '[]'),
          aptitude: JSON.parse(dnaRow.aptitude_json || '{}'),
          workStyle: JSON.parse(dnaRow.work_style_json || '{}'),
          aspirations: JSON.parse(dnaRow.aspirations_json || '{}'),
          workPreferences: JSON.parse(dnaRow.work_preferences_json || '{}'),
          threeP: JSON.parse(dnaRow.three_p_json || '{}')
        };
      }
    } catch (e) {
      // Continue without DNA if error
    }
  }

  const rawInterests = Array.isArray(profile.interests) 
    ? profile.interests.map(i => i.toLowerCase()) 
    : JSON.parse(profile.interests || '[]').map(i => i.toLowerCase());

  const dnaInterests = (careerDna?.interests || []).map(i => i.toLowerCase());
  const userInterests = Array.from(new Set([...rawInterests, ...dnaInterests]));

  const userTechSkills = Array.isArray(profile.technical_skills)
    ? profile.technical_skills.map(s => s.toLowerCase())
    : JSON.parse(profile.technical_skills || '[]').map(s => s.toLowerCase());

  const userPracticalSkills = Array.isArray(profile.practical_skills)
    ? profile.practical_skills.map(s => s.toLowerCase())
    : JSON.parse(profile.practical_skills || '[]').map(s => s.toLowerCase());

  const userSoftSkills = Array.isArray(profile.soft_skills)
    ? profile.soft_skills.map(s => s.toLowerCase())
    : JSON.parse(profile.soft_skills || '[]').map(s => s.toLowerCase());

  const allUserSkills = [...userTechSkills, ...userPracticalSkills, ...userSoftSkills];

  const workPref = (profile.work_preference || '').toLowerCase();
  const hasComputer = profile.has_computer !== 0 && profile.has_computer !== false;
  const eduLevel = (profile.education_level || '').toLowerCase();
  const personaType = (profile.persona_type || '').toLowerCase();
  const budget = (profile.budget_constraint || 'moderate').toLowerCase();

  // Evaluate each career
  const scoredCareers = catalog.map(career => {
    let matchedInterests = [];
    let matchedSkills = [];
    let matchedStyles = [];

    // 1. Interest Score (0 - 100) with semantic concept clustering
    const interestClusters = {
      'Technology & Data': ['tech', 'technology', 'computer', 'computers', 'coding', 'programming', 'software', 'algorithm', 'algorithms', 'web', 'data', 'developer', 'python', 'java', 'sql', 'system', 'logic'],
      'Skilled Trades': ['repair', 'tool', 'tools', 'machine', 'machines', 'mechanic', 'electric', 'electrical', 'wire', 'plumb', 'plumbing', 'pipe', 'weld', 'welding', 'carpenter', 'carpentry', 'wood', 'hands-on', 'hands on', 'hardware', 'maintenance'],
      'Design & Creative': ['art', 'drawing', 'design', 'visual', 'creative', 'creativity', 'ui', 'ux', 'graphic', 'video', 'multimedia', 'animation', 'illustration', 'sketching'],
      'Healthcare & Life Sciences': ['health', 'healthcare', 'nurse', 'nursing', 'medical', 'clinic', 'hospital', 'patient', 'patients', 'medicine', 'biology', 'pharma', 'laboratory', 'care'],
      'Marketing & Customer': ['marketing', 'market', 'growth', 'sales', 'content', 'copywriting', 'customer', 'seo', 'social media', 'advertising', 'b2b', 'communication'],
      'Business & Management': ['business', 'operation', 'operations', 'management', 'logistics', 'strategy', 'finance', 'project management'],
      'Entrepreneurship / Freelancing': ['entrepreneur', 'entrepreneurship', 'startup', 'founder', 'business idea', 'mvp', 'freelance'],
      'Agriculture & Food': ['agri', 'agriculture', 'farm', 'farming', 'food', 'crop', 'soil', 'harvest', 'agribusiness'],
      'Hospitality & Tourism': ['hotel', 'hospitality', 'guest', 'culinary', 'tourism', 'restaurant', 'resort'],
      'Logistics & Supply Chain': ['logistics', 'supply chain', 'warehouse', 'shipping', 'inventory', 'freight', 'dispatch'],
      'Education & Training': ['education', 'teaching', 'training', 'trainer', 'mentor', 'instruction', 'pedagogy'],
      'Finance & Accounting': ['finance', 'accounting', 'tax', 'audit', 'banking', 'bookkeeping', 'gst']
    };

    let interestMatches = 0;
    career.interest_areas.forEach(ci => {
      const ciLower = ci.toLowerCase();
      if (userInterests.some(ui => ui.includes(ciLower) || ciLower.includes(ui))) {
        interestMatches++;
        matchedInterests.push(ci);
      }
    });

    const categoryKeywords = interestClusters[career.category] || [];
    userInterests.forEach(ui => {
      if (categoryKeywords.some(kw => ui.includes(kw) || kw.includes(ui))) {
        interestMatches++;
        if (!matchedInterests.includes(career.category)) {
          matchedInterests.push(career.category);
        }
      }
    });

    const interestScore = userInterests.length > 0
      ? Math.min(100, Math.round((interestMatches / Math.max(1, Math.min(3, userInterests.length))) * 50))
      : 60;

    // 2. Work Style Score (0 - 100)
    let styleScore = 65;
    career.work_styles.forEach(ws => {
      if (workPref.includes(ws) || ws.includes(workPref)) {
        styleScore += 18;
        matchedStyles.push(ws);
      }
    });
    if (workPref === 'hands_on' && career.hands_on_level === 'High') {
      styleScore += 25;
      matchedStyles.push('Hands-on orientation');
    }
    if (workPref === 'computer_based' && career.computer_use_level === 'High') {
      styleScore += 20;
      matchedStyles.push('Computer-based workflows');
    }
    if (workPref === 'indoor' && career.work_styles.includes('indoor')) {
      styleScore += 10;
      matchedStyles.push('Indoor work environment');
    }
    if (workPref === 'outdoor' && career.work_styles.includes('outdoor')) {
      styleScore += 25;
      matchedStyles.push('Outdoor field presence');
    }
    styleScore = Math.min(100, Math.max(30, styleScore));

    // 3. Skill & Transferable Alignment (0 - 100)
    let skillMatches = 0;
    const missingSkills = [];
    career.common_skills.forEach(cs => {
      const csLower = cs.toLowerCase();
      if (allUserSkills.some(us => us.includes(csLower) || csLower.includes(us))) {
        skillMatches++;
        matchedSkills.push(cs);
      } else {
        missingSkills.push(cs);
      }
    });

    career.transferable_skills.forEach(ts => {
      const tsLower = ts.toLowerCase();
      if (allUserSkills.some(us => us.includes(tsLower) || tsLower.includes(us))) {
        skillMatches++;
        if (!matchedSkills.includes(ts)) matchedSkills.push(ts);
      }
    });

    const skillScore = Math.min(100, Math.max(35, Math.round((skillMatches / Math.max(1, career.common_skills.length)) * 100) + 40));

    // 4. Constraint & Persona Compatibility (0 - 100)
    let constraintScore = 80;
    // If no computer, high computer careers get penalised
    if (!hasComputer && career.computer_use_level === 'High') {
      constraintScore -= 35;
    }
    // If practical/vocational persona, give boost to skilled trades and practical paths
    if ((personaType.includes('vocational') || eduLevel.includes('limited') || eduLevel.includes('practical') || eduLevel.includes('school')) && career.category === 'Skilled Trades') {
      constraintScore += 20;
    }
    // If quick income needed / low budget
    if (budget === 'low' && career.learning_duration.includes('3-6 Months')) {
      constraintScore += 15;
    }
    constraintScore = Math.min(100, Math.max(30, constraintScore));

    // User Priorities Weighting
    // priorities: { interestsWeight, incomeWeight, speedWeight, handsOnWeight, computerWeight }
    let priorityMultiplier = 1.0;
    if (priorities.handsOn && career.hands_on_level === 'High') priorityMultiplier += 0.15;
    if (priorities.computerWork && career.computer_use_level === 'High') priorityMultiplier += 0.15;
    if (priorities.quickEntry && career.learning_duration.includes('3-6 Months')) priorityMultiplier += 0.15;
    if (priorities.highIncome && career.income_potential === 'High') priorityMultiplier += 0.15;

    // Weighted Overall Score
    const rawOverall = Math.round(
      (interestScore * 0.35 + styleScore * 0.25 + skillScore * 0.20 + constraintScore * 0.20) * priorityMultiplier
    );
    const overallScore = Math.min(96, Math.max(42, rawOverall));

    // Fit label
    let fitLabel = 'Strong Alignment';
    if (overallScore < 60) fitLabel = 'Requires Development';
    else if (overallScore < 72) fitLabel = 'Worth Exploring';
    else if (overallScore < 82) fitLabel = 'Moderate Alignment';

    // Analytical Explanations incorporating 3P and Career DNA
    let whyAppeared = '';
    if (careerDna?.threeP?.process?.primary && careerDna?.threeP?.purpose?.primary) {
      whyAppeared = `Aligned with your ${careerDna.threeP.process.primary} process and ${careerDna.threeP.purpose.primary} motivations. Demonstrates strong compatibility with your assessed work style and current skills.`;
    } else if (matchedInterests.length > 0 && matchedStyles.length > 0) {
      whyAppeared = `Appeared because your interest in ${matchedInterests.slice(0, 2).join(' and ')} strongly matches this field, and you prefer ${matchedStyles.slice(0, 2).join(', ')}.`;
    } else if (matchedInterests.length > 0) {
      whyAppeared = `Recommended because your curiosity in ${matchedInterests.join(', ')} provides a natural foundation for this pathway.`;
    } else {
      whyAppeared = `Recommended because this career offers accessible entry pathways aligned with your work preferences and background.`;
    }

    const whatShouldBeInvestigated = [
      `Review typical daily responsibilities in ${career.category}`,
      `Verify local licensing, portfolio, or apprenticeship requirements (${career.entry_pathways[0] || 'Entry role'})`,
      `Test your affinity with a hands-on task in Career Solver`
    ];

    const whatCouldChangeResult = priorities.quickEntry
      ? `If you prioritize shorter 3-month preparation, this pathway fits well.`
      : `Adding 1-2 hours of targeted hands-on practice per day will rapidly increase this pathway's readiness.`;

    return {
      careerId: career.id,
      id: career.id,
      careerName: career.career_name,
      career_name: career.career_name,
      title: career.career_name,
      name: career.career_name,
      category: career.category,
      description: career.description,
      overallScore,
      match_score: overallScore,
      fitLabel,
      fit_label: fitLabel,
      fitIndicators: {
        interestAlignment: interestScore,
        workStyleAlignment: styleScore,
        skillAlignment: skillScore,
        constraintCompatibility: constraintScore
      },
      whyAppeared,
      match_reason: whyAppeared,
      matchedFactors: [...matchedInterests, ...matchedStyles, ...matchedSkills].slice(0, 5),
      skillGaps: missingSkills.slice(0, 4),
      whatShouldBeInvestigated,
      whatCouldChangeResult,
      learningDuration: career.learning_duration,
      incomePotential: career.income_potential,
      handsOnLevel: career.hands_on_level,
      computerUseLevel: career.computer_use_level,
      peopleInteractionLevel: career.people_interaction_level,
      entryPathways: career.entry_pathways,
      practicalTasks: career.practical_tasks
    };
  });

  // Sort descending by overallScore
  scoredCareers.sort((a, b) => b.overallScore - a.overallScore);

  // Guarantee cross-category diversity in top recommendations
  const diverseTopRecommendations = [];
  const seenCategories = new Set();

  for (const item of scoredCareers) {
    if (!seenCategories.has(item.category) || diverseTopRecommendations.length < 4) {
      diverseTopRecommendations.push(item);
      seenCategories.add(item.category);
    }
    if (diverseTopRecommendations.length >= 7) break;
  }

  // Fill up to 6-8 if needed
  for (const item of scoredCareers) {
    if (!diverseTopRecommendations.some(d => d.careerId === item.careerId)) {
      diverseTopRecommendations.push(item);
    }
    if (diverseTopRecommendations.length >= 8) break;
  }

  return {
    profileSnapshot: {
      personaType: profile.persona_type || 'Learner',
      interests: userInterests,
      workPreference: profile.work_preference || 'balanced',
      educationLevel: profile.education_level || 'Practical Experience',
      dailyHours: profile.daily_learning_hours || 2,
      hasComputer,
      budget
    },
    recommendations: diverseTopRecommendations,
    allScored: scoredCareers
  };
}

/**
 * Career Comparison Intelligence Matrix
 * Compare 2 to 4 pathways across dimensions
 */
export function compareCareers(careerIdentifiers, profile) {
  const careers = careerIdentifiers.map(id => getCareerById(id)).filter(Boolean);
  if (careers.length < 2) {
    // If not found, look up by name
    const all = getAllCareers();
    careerIdentifiers.forEach(query => {
      const match = all.find(c => c.career_name.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(c.career_name.toLowerCase()));
      if (match && !careers.some(c => c.id === match.id)) {
        careers.push(match);
      }
    });
  }

  if (careers.length === 0) {
    return { error: 'No matching careers found for comparison.' };
  }

  const comparison = careers.map(c => {
    // Calculate user profile alignment for this career
    const discovery = runCareerDiscovery(profile);
    const scoreData = discovery.allScored.find(s => s.careerId === c.id) || {
      overallScore: 75,
      fitLabel: 'Moderate Alignment',
      fitIndicators: { interestAlignment: 75, workStyleAlignment: 70, skillAlignment: 70, constraintCompatibility: 80 },
      whyAppeared: 'Matches your general background.',
      skillGaps: c.common_skills.slice(0, 3)
    };

    return {
      id: c.id,
      careerName: c.career_name,
      career_name: c.career_name,
      title: c.career_name,
      name: c.career_name,
      category: c.category,
      description: c.description,
      overallScore: scoreData.overallScore,
      fitLabel: scoreData.fitLabel,
      fitIndicators: scoreData.fitIndicators,
      workEnvironment: c.work_environment.join(', '),
      handsOnLevel: c.hands_on_level,
      computerUseLevel: c.computer_use_level,
      peopleInteractionLevel: c.people_interaction_level,
      learningDuration: c.learning_duration,
      incomePotential: c.income_potential,
      time_to_transition: c.learning_duration,
      timeToTransition: c.learning_duration,
      salary_entry: c.income_potential,
      salaryEntry: c.income_potential,
      salary_range: c.income_potential,
      educationPathways: c.education_pathways,
      entryPathways: c.entry_pathways,
      keySkillsRequired: c.common_skills,
      userSkillGaps: scoreData.skillGaps,
      portfolioProofNeeded: c.portfolio_needs,
      whyItFitsYou: scoreData.whyAppeared,
      tradeOffs: c.hands_on_level === 'High' 
        ? 'Requires physical presence and safety compliance; cannot be done fully remote.'
        : 'Requires continuous screen-based learning and self-directed project building.'
    };
  });

  return {
    comparedCount: comparison.length,
    careers: comparison,
    matrix: comparison,
    decisionTakeaways: [
      `If you prioritize practical physical mastery and local client demand, consider: ${comparison.find(c => c.handsOnLevel === 'High')?.careerName || comparison[0].careerName}.`,
      `If you prefer digital flexibility and computer-based work, consider: ${comparison.find(c => c.computerUseLevel === 'High')?.careerName || comparison[comparison.length - 1].careerName}.`,
      `Every pathway has a dedicated 5-Phase Roadmap on Career Solver once you select it.`
    ]
  };
}

/**
 * Dynamic Career-Specific 5-Phase Roadmap Generator
 * Builds realistic, tailored learning phases for ANY career category
 */
export function generateDynamicRoadmap(targetCareerName, profile) {
  const career = getCareerById(targetCareerName);
  const name = career ? career.career_name : targetCareerName;
  const category = career ? career.category : 'General Professional';

  // Category-specific phase blueprints
  let phases = [];
  let weeklyPlan = [];
  let milestones = [];

  if (category === 'Skilled Trades') {
    phases = [
      {
        phaseNumber: 1,
        name: "Workshop Safety, PPE & Hazard Controls",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Zero-compromise foundational safety habits, Lockout/Tagout (LOTO), and protective gear standards.",
        topics: ["Lockout / Tagout (LOTO) Protocols", "Live-Dead-Live 5-step Voltage Verification", "1000V Insulated Tool Maintenance", "PPE Compliance"]
      },
      {
        phaseNumber: 2,
        name: "Core Diagnostics & Circuit Schematics",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Master digital multimeter troubleshooting, wiring diagrams, and continuity diagnosis.",
        topics: ["Multimeter Calibration & Resistance Checks", "Single vs 3-Phase Distribution Basics", "Earthing & Leakage Circuit Breakers", "Reading Technical Schematics"]
      },
      {
        phaseNumber: 3,
        name: "Component Testing & Supervised Servicing",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Hands-on supervised troubleshooting on common equipment and electrical components.",
        topics: ["Motor Starter Relays & Capacitors", "Distribution Board Load Balancing", "Fault Isolation Sequence", "Preventive Maintenance Checklists"]
      },
      {
        phaseNumber: 4,
        name: "Trade Certification & Inspection Preparation",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Prepare for official regional wireman/technician trade tests and competency checks.",
        topics: ["National Code Compliance Standards", "Mock Practical Inspection Drills", "Safety Logbook Maintenance"]
      },
      {
        phaseNumber: 5,
        name: "Apprenticeship & Independent Practice Setup",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Client communication, ethical quotation, and onboarding into a licensed trade apprenticeship.",
        topics: ["Customer Quotes & Transparent Invoicing", "5S Tool Care", "Connecting with Verified Guilds & Contractors"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Tool Inspection", task: "Inspect 1000V insulation on pliers and test lead resistance on multimeter" },
      { day: "Tuesday", focus: "Safety Sequence", task: "Practice 5-step Live-Dead-Live isolation protocol on a de-energized test bench" },
      { day: "Wednesday", focus: "Component Testing", task: "Test 3 capacitors and measure resistance across motor windings" },
      { day: "Thursday", focus: "Schematic Reading", task: "Trace line voltage flow through a single-phase motor control circuit" },
      { day: "Friday", focus: "Practical Application", task: "Inspect a residential breaker panel under licensed mentor supervision" },
      { day: "Saturday", focus: "Customer Dialogue", task: "Practice explaining an honest repair estimate in Practice Studio" },
      { day: "Sunday", focus: "Review & Toolkit Care", task: "Clean toolkit and review safety logbook entries" }
    ];

    milestones = [
      { id: "m1", title: "100% Safety Protocol Mastery", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Precision Multimeter Diagnosis Badge", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Supervised Component Servicing Practical", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Trade Licensing & Apprenticeship Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Healthcare & Life Sciences') {
    phases = [
      {
        phaseNumber: 1,
        name: "Medical Terminology & Patient Safety Protocols",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Foundational clinical vocabulary, infection control standards, and patient confidentiality.",
        topics: ["Anatomy & Clinical Terminology", "Hand Hygiene & Sterilization Standards", "Patient Privacy & Ethics", "Vital Signs Basics"]
      },
      {
        phaseNumber: 2,
        name: "Diagnostic Protocols & Patient Intake",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Accurate clinical documentation, vital sign tracking, and patient communication.",
        topics: ["Accurate Vital Signs Charting", "Clinical Observation & SBAR Handoffs", "Electronic Health Records (EHR)", "Emergency Triage Concepts"]
      },
      {
        phaseNumber: 3,
        name: "Clinical Procedures & Lab Techniques",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Master standard equipment protocols, specimen collection, or sterile procedural prep.",
        topics: ["Aseptic Technique", "Diagnostic Sample Handling", "Medical Equipment Calibration", "Adverse Event Reporting"]
      },
      {
        phaseNumber: 4,
        name: "Licensing & Clinical Competency Review",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Review board examination questions and clinical scenario walkthroughs.",
        topics: ["State Healthcare Board Question Banks", "Scenario-based Patient Crisis Management", "Pharmacology & Dosage Safety Checks"]
      },
      {
        phaseNumber: 5,
        name: "Clinical Practicum & Hospital Placement",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Hospital ward rotations, supervisor endorsements, and clinical placement interviews.",
        topics: ["Clinical Behavioral Interviews", "Hospital Ward Team Dynamics", "Continuous Healthcare Education"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Clinical Vocabulary", task: "Memorize 15 standard medical prefixes and vital sign abbreviations" },
      { day: "Tuesday", focus: "Infection Control", task: "Review sterile glove technique and biohazard disposal categories" },
      { day: "Wednesday", focus: "Patient Intake", task: "Practice conducting a structured medical history intake in Practice Studio" },
      { day: "Thursday", focus: "SBAR Communication", task: "Draft an SBAR clinical handoff note for a worsening patient scenario" },
      { day: "Friday", focus: "Case Study Review", task: "Analyze an ethical dilemma case regarding patient privacy and consent" },
      { day: "Saturday", focus: "Empathy Practice", task: "Deliver comforting, clear instructions to an anxious patient in Practice Studio" },
      { day: "Sunday", focus: "Weekly Review", task: "Review flashcards of normal clinical vital ranges" }
    ];

    milestones = [
      { id: "m1", title: "Patient Safety & Ethics Certification", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Accurate Clinical Intake & Vitals Checkpoint", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Sterile Procedure & Emergency Protocol Review", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Clinical Ward Placement Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Design & Creative') {
    phases = [
      {
        phaseNumber: 1,
        name: "Visual Foundations, Hierarchy & Typography",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Master layout balance, typography scales, contrast, and visual psychology.",
        topics: ["Typographic Hierarchy & Font Pairing", "Color Theory & Contrast Accessibility", "Grid Systems & White Space", "Design Critique Principles"]
      },
      {
        phaseNumber: 2,
        name: "Professional Tooling & Vector Craftsmanship",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Fluency in industry-standard design tools (Figma/Illustrator) and reusable component libraries.",
        topics: ["Vector Pen Tool Precision", "Auto-Layout & Design Tokens in Figma", "Asset Export Formats & Resolution", "Brand Identity Boards"]
      },
      {
        phaseNumber: 3,
        name: "Real-World Projects & Client Briefs",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Build 2 complete, non-trivial client projects from raw brief to final delivered assets.",
        topics: ["Deconstructing Client Creative Briefs", "End-to-End Brand Identity System", "Responsive Web/Mobile UI Screens", "Revising Based on Feedback"]
      },
      {
        phaseNumber: 4,
        name: "Case Study Storytelling & Portfolio Curation",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Structure 3 deep case studies highlighting problem, design decisions, and measurable outcomes.",
        topics: ["Writing Compelling Case Study Narratives", "Before & After Design Demonstrations", "Interactive Web Portfolio Setup"]
      },
      {
        phaseNumber: 5,
        name: "Design Presentation & Client/Agency Readiness",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Practice design critiques, explaining design rationale to stakeholders, and freelance pricing.",
        topics: ["Explaining Trade-offs in Practice Studio", "Design Pricing & Scope Contracts", "Design Team Take-Home Challenges"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Typography & Layout", task: "Redesign a cluttered landing page hero using a strict 8pt grid system" },
      { day: "Tuesday", focus: "Vector Precision", task: "Craft 4 custom vector icons using geometric boolean operations in Figma" },
      { day: "Wednesday", focus: "Color & Accessibility", task: "Audit contrast ratios across a color palette using WebAIM WCAG guidelines" },
      { day: "Thursday", focus: "Component Architecture", task: "Build a reusable button and input component set with interactive states" },
      { day: "Friday", focus: "Client Case Study", task: "Write 300 words documenting the design rationale for this week's project" },
      { day: "Saturday", focus: "Design Critique", task: "Present your design work out loud in Practice Studio" },
      { day: "Sunday", focus: "Inspiration & Moodboard", task: "Collect 10 exceptional design references and analyze their visual hierarchy" }
    ];

    milestones = [
      { id: "m1", title: "Visual Design Foundations Checkpoint", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Design System & Component Fluency", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "2 Complete Case Studies Published", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Portfolio Ready for Studio & Client Review", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Marketing & Customer') {
    phases = [
      {
        phaseNumber: 1,
        name: "Customer Psychology, Funnels & Positioning",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Understand customer journey stages, pain points, and crafting differentiated value propositions.",
        topics: ["Marketing Funnel Architecture (AIDA)", "Customer Persona Creation", "Value Proposition Design", "Competitor Positioning Audits"]
      },
      {
        phaseNumber: 2,
        name: "Channel Strategy & Analytics Mastery",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Master Google Analytics 4, conversion metrics, search intent, and organic content engines.",
        topics: ["Google Analytics 4 & Event Tracking", "Keyword Research & Search Intent", "Conversion Rate Optimization (CRO)", "Email Automation Sequences"]
      },
      {
        phaseNumber: 3,
        name: "Paid Acquisition & Experimentation Engine",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Plan and optimize ad campaigns across search and social channels with controlled budgets.",
        topics: ["Meta & Google Ads Campaign Setup", "A/B Testing Creative Hooks & Copy", "Cost per Acquisition (CAC) vs LTV", "Retargeting Sequences"]
      },
      {
        phaseNumber: 4,
        name: "Live Growth Case Study & Capstone",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Execute a real or simulated end-to-end growth campaign and measure conversion outcomes.",
        topics: ["Full Campaign Brief & Landing Page", "Data Storytelling with Looker Studio", "Documenting Campaign Learnings"]
      },
      {
        phaseNumber: 5,
        name: "Interview Case Walkthroughs & Agency Ready",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Sharpen high-pressure marketing strategy defense, metrics explanation, and client pitching.",
        topics: ["Marketing Strategy Whiteboard Challenges", "Explaining Trade-offs in Practice Studio", "Building a Public Growth Portfolio"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Competitor Audit", task: "Perform a deep teardown of 3 competitor landing pages and note key value props" },
      { day: "Tuesday", focus: "Copywriting", task: "Write 5 high-converting ad copy headlines testing different emotional hooks" },
      { day: "Wednesday", focus: "Analytics & Tracking", task: "Configure custom event goals in GA4 or analyze a sample conversion funnel" },
      { day: "Thursday", focus: "Content Strategy", task: "Outline a 4-week SEO content cluster targeting high-intent buyer keywords" },
      { day: "Friday", focus: "Campaign Budgeting", task: "Draft a $1,000 monthly multi-channel media spend plan with target ROAS" },
      { day: "Saturday", focus: "Pitching & Defense", task: "Explain your campaign strategy in 60 seconds in Practice Studio" },
      { day: "Sunday", focus: "Review & Metrics", task: "Review weekly growth experiments and document findings in Skill Passport" }
    ];

    milestones = [
      { id: "m1", title: "Customer Persona & Positioning Certified", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "GA4 & Organic Search Strategy Checkpoint", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "End-to-End Growth Campaign Case Study Deployed", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Placement & Growth Lead Interview Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Business & Management' || category === 'Entrepreneurship / Freelancing') {
    phases = [
      {
        phaseNumber: 1,
        name: "Problem Identification & Lean Customer Discovery",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Validate acute customer pain points, customer interviews, and unbundling unit economics.",
        topics: ["Customer Discovery Interviews", "Value Proposition Canvas", "Lean Canvas Modeling", "Direct Competitor Teardowns"]
      },
      {
        phaseNumber: 2,
        name: "Operational Workflows & 7-Day MVP Prototyping",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Design low-code operational fulfillment workflows and launch a lean prototype offer.",
        topics: ["No-Code / Low-Code Landing Pages", "Operational Process SOPs", "Payment Gateway Integration", "Early Adopter Onboarding"]
      },
      {
        phaseNumber: 3,
        name: "Financial Unit Economics & Cost Controls",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Master cashflow management, contribution margins, inventory turn, and statutory invoicing.",
        topics: ["Contribution Margin Modeling", "Cashflow Runway Forecasting", "Vendor Negotiation", "Statutory Compliance & GST"]
      },
      {
        phaseNumber: 4,
        name: "Sales Pipeline & Repeat Client Retention",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Build predictable lead generation cadences, referral incentives, and client retention loops.",
        topics: ["B2B Discovery Calls", "Customer Referral Engines", "Churn Reduction Playbooks", "Contract Pricing Structures"]
      },
      {
        phaseNumber: 5,
        name: "Operational Scaling & Executive Pitching",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Standardize team delegations, executive board reporting, and capital raising presentations.",
        topics: ["Standard Operating Procedures (SOPs)", "Pitch Deck Defense in Practice Studio", "Hiring & Delegation Frameworks"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Customer Discovery", task: "Interview 2 potential clients about their most frustrating operational bottleneck" },
      { day: "Tuesday", focus: "Unit Economics", task: "Model unit cost, delivery expense, and gross margin on a simple spreadsheet" },
      { day: "Wednesday", focus: "Process Mapping", task: "Draft a 1-page step-by-step SOP for fulfilling a customer request" },
      { day: "Thursday", focus: "Sales Pitch", task: "Practice a 60-second value proposition pitch in Practice Studio" },
      { day: "Friday", focus: "Vendor Review", task: "Compare pricing and delivery terms from 3 suppliers" },
      { day: "Saturday", focus: "Review & Metrics", task: "Audit weekly inquiries, customer objections, and conversion rates" },
      { day: "Sunday", focus: "Planning", task: "Outline top 3 operational priorities for the upcoming week" }
    ];

    milestones = [
      { id: "m1", title: "Customer Pain Points & MVP Canvas Verified", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "First 5 Paying Clients / Prototype Orders Delivered", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Positive Gross Margin & Unit Economics Locked", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Scalable Operations & Repeat Inbound Model Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Agriculture & Food') {
    phases = [
      {
        phaseNumber: 1,
        name: "Soil Health, Agro-Ecology & Crop Science",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Foundational soil testing, nutrient management, climate adaptation, and crop life-cycles.",
        topics: ["Soil pH & Nutrient Sampling", "Drip Irrigation Architecture", "Organic & Biological Pest Controls", "Weather Forecasting Tools"]
      },
      {
        phaseNumber: 2,
        name: "Precision Farming & Mechanized Operations",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Leverage farm sensors, precision machinery maintenance, and resource tracking.",
        topics: ["Farm Machinery Maintenance & Safety", "Soil Moisture Sensor Telemetry", "Drone / Satellite Crop Scouting", "Fertigation Calibration"]
      },
      {
        phaseNumber: 3,
        name: "Post-Harvest Handling & Cold Chain Storage",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Minimize post-harvest loss, cold room management, and produce sorting standards.",
        topics: ["HACCP Food Safety Standards", "Cold Chain Logistics & Thermologgers", "Quality Grading & Sorting Protocols", "Primary Food Processing"]
      },
      {
        phaseNumber: 4,
        name: "Agri-Market Linkages & FPO Management",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Farmer Producer Organization (FPO) governance, direct-to-retail supply, and commodity pricing.",
        topics: ["Contract Farming Agreement Compliance", "e-NAM & Agricultural Commodity Markets", "Bulk Procurement Negotiation", "Storage Loss Tracking"]
      },
      {
        phaseNumber: 5,
        name: "Agribusiness Certification & Commercial Scaling",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Comply with organic/export certifications and commercial farm business management.",
        topics: ["Organic / Export Traceability Audits", "Farm P&L and Working Capital Cycles", "Agri-Tech Adoption Pitching"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Soil & Water Quality", task: "Perform a soil sampling test and record electrical conductivity readings" },
      { day: "Tuesday", focus: "Equipment Safety", task: "Inspect drip lines and calibrate fertilizer injection venturi" },
      { day: "Wednesday", focus: "Pest Scouting", task: "Scout crop canopy for early insect/fungal infestation and document thresholds" },
      { day: "Thursday", focus: "Post-Harvest Log", task: "Audit temperature logs from perishable storage crates" },
      { day: "Friday", focus: "Market Pricing", task: "Track wholesale mandi prices across 3 neighboring regional markets" },
      { day: "Saturday", focus: "Farmer Advisory", task: "Practice explaining a pest management recommendation in Practice Studio" },
      { day: "Sunday", focus: "Farm Log Review", task: "Update field operation logs and inventory inputs in Skill Passport" }
    ];

    milestones = [
      { id: "m1", title: "Soil Testing & Resource Management Checkpoint", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Precision Irrigation & Crop Protection Verified", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Zero-Loss Post-Harvest Handling Protocol Certified", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Commercial Agribusiness Operations Placement Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Hospitality & Tourism') {
    phases = [
      {
        phaseNumber: 1,
        name: "Guest Service Excellence & Cultural Warmth",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Foundational hospitality etiquette, verbal communication, and guest psychology.",
        topics: ["Guest Greeting & Professional Presence", "Active Listening & Anticipating Needs", "Cultural Awareness & Diversity", "Conflict De-escalation Basics"]
      },
      {
        phaseNumber: 2,
        name: "Front Office & Property Management Systems (PMS)",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Master reservation management, check-in/out workflows, and billing accuracy.",
        topics: ["Cloud PMS Navigation & Bookings", "Cashiering & Night Audit Fundamentals", "Room Inventory Allocation", "Key Card Security & Privacy"]
      },
      {
        phaseNumber: 3,
        name: "Housekeeping & Service Quality Control",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Supervise deep room inspections, hygiene standards, and maintenance logs.",
        topics: ["50-Point Room Turnover Audit", "Chemical Safety & Sanitization Protocols", "Preventive Maintenance Escalation", "VIP Amenity Staging"]
      },
      {
        phaseNumber: 4,
        name: "Service Recovery & Customer Experience Mastery",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Resolve high-pressure guest complaints and turn dissatisfaction into guest loyalty.",
        topics: ["LAST Method (Listen, Apologize, Solve, Thank)", "Handling Overbooking Gracefully", "Online Review Response Management"]
      },
      {
        phaseNumber: 5,
        name: "Hospitality Supervision & Hotel Placement",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Team shift coordination, daily briefings, and luxury brand interview defense.",
        topics: ["Shift Briefings & Delegation", "Hotel Behavioral Scenarios in Practice Studio", "Luxury Property Standards Assessment"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Guest Check-in", task: "Practice a rapid, flawless 3-minute guest check-in simulation" },
      { day: "Tuesday", focus: "Service Recovery", task: "Practice de-escalating a noisy neighbor complaint in Practice Studio" },
      { day: "Wednesday", focus: "PMS Navigation", task: "Process 5 booking modifications and split billing across 2 folios" },
      { day: "Thursday", focus: "Room Inspection", task: "Perform a mock 30-point room turnover quality audit" },
      { day: "Friday", focus: "VIP Staging", task: "Create an itinerary and welcome amenity plan for an anniversary stay" },
      { day: "Saturday", focus: "Guest Review", task: "Draft professional, empathetic responses to 2 critical online guest reviews" },
      { day: "Sunday", focus: "Weekly Review", task: "Review guest feedback scores and update Skill Passport" }
    ];

    milestones = [
      { id: "m1", title: "Hospitality Etiquette & Standards Certified", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "PMS Booking & Cashiering Proficiency", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Advanced Service Recovery & Quality Inspection Badge", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Hotel Operations Lead Placement Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Logistics & Supply Chain') {
    phases = [
      {
        phaseNumber: 1,
        name: "Warehouse Safety, Material Handling & WMS Basics",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Safe warehouse operations, PPE standards, barcode scanning, and receiving docks.",
        topics: ["Warehouse Safety & Hazard Identification", "Inbound Dock Inspection Protocols", "WMS Barcode Scanning Workflows", "Bill of Lading (BOL) Verification"]
      },
      {
        phaseNumber: 2,
        name: "Inventory Accuracy & Cycle Counting",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Maintain 99%+ stock accuracy using ABC inventory classification and systematic audits.",
        topics: ["ABC Inventory Stratification", "Daily Cycle Count Methodologies", "Discrepancy Root Cause Analysis", "Damaged Goods Quarantine"]
      },
      {
        phaseNumber: 3,
        name: "Fulfillment, Picking Paths & Packing Standards",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Optimize order wave picking, packing throughput, and shipping carrier handoffs.",
        topics: ["Batch vs Wave Picking Optimization", "Protective D packaging Standards", "Parcel Carrier Rate Shopping", "Hazardous Material Labeling"]
      },
      {
        phaseNumber: 4,
        name: "Freight Dispatch & Carrier Coordination",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Schedule line-haul trucking, track on-time delivery (OTD), and manage exceptions.",
        topics: ["Freight Carrier Scheduling & Detention Avoidance", "GPS Fleet & Shipment Tracking", "Freight Claim Filing Procedures"]
      },
      {
        phaseNumber: 5,
        name: "Supply Chain Analytics & Leadership Readiness",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Lead daily floor huddles, analyze throughput bottlenecks, and ace supervisory interviews.",
        topics: ["Warehouse KPI Dashboard (OTIF, Cost/Unit)", "Lean 5S Floor Organization", "Supervisory Scenarios in Practice Studio"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Inbound Receiving", task: "Verify a 20-item bill of lading against physical carton labels" },
      { day: "Tuesday", focus: "Cycle Counting", task: "Perform a physical cycle count on 15 high-value SKUs and calculate variance" },
      { day: "Wednesday", focus: "Pick Path Optimization", task: "Design an optimized picking route for a multi-order wave" },
      { day: "Thursday", focus: "Safety & 5S", task: "Conduct a 10-point aisle safety and fire extinguisher clearance inspection" },
      { day: "Friday", focus: "Carrier Dispatch", task: "Draft an urgent carrier escalation note for a delayed line-haul shipment" },
      { day: "Saturday", focus: "Interview Drill", task: "Explain how you resolved an inventory shortage in Practice Studio" },
      { day: "Sunday", focus: "Weekly Review", task: "Review fulfillment metrics and update Skill Passport" }
    ];

    milestones = [
      { id: "m1", title: "Warehouse Safety & Inbound Dock Operations Certified", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "99%+ Cycle Count Accuracy Badge", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Fulfillment Throughput & Carrier Dispatch Mastery", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Logistics Coordinator Placement Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else if (category === 'Education & Training') {
    phases = [
      {
        phaseNumber: 1,
        name: "Pedagogical Foundations & Adult Learning Principles",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: "Understand student engagement, learning styles, active learning pedagogy, and curriculum mapping.",
        topics: ["Bloom's Taxonomy in Practice", "Adult Learning (Andragogy) Concepts", "Curriculum Module Scaffolding", "Creating Safe Learning Environments"]
      },
      {
        phaseNumber: 2,
        name: "Lesson Planning & Interactive Micro-Teaching",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Structure crisp 20-minute lesson plans with live demonstrations, checks for understanding, and exercises.",
        topics: ["Formative Assessment Strategies", "Clear Analogy Construction", "Hands-On Practical Lab Design", "Classroom Engagement Techniques"]
      },
      {
        phaseNumber: 3,
        name: "Diagnostic Feedback & Objective Rubric Design",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Construct transparent skill rubrics, provide encouraging corrective feedback, and remediate gaps.",
        topics: ["Competency-Based Assessment Rubrics", "Constructive Feedback Delivery", "Individualized Remediation Plans", "Peer Review Facilitation"]
      },
      {
        phaseNumber: 4,
        name: "Vocational & Digital Tooling Integration",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Incorporate modern interactive boards, digital LMS platforms, and workshop simulation tools.",
        topics: ["Learning Management Systems (LMS)", "Interactive Quiz & Poll Design", "Workshop Safety Demonstration Drills"]
      },
      {
        phaseNumber: 5,
        name: "Teaching Practicum & Institutional Placement",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Deliver mock classroom lectures, defense of pedagogical decisions, and institution placement interviews.",
        topics: ["Recorded Micro-Teaching in Practice Studio", "Institutional Interview Defense", "Continuous Professional Development Plan"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Lesson Plan", task: "Structure a 30-minute interactive lesson plan with clear learning objectives" },
      { day: "Tuesday", focus: "Analogy Practice", task: "Explain a difficult technical concept using a simple everyday analogy in Practice Studio" },
      { day: "Wednesday", focus: "Rubric Design", task: "Draft a 4-level competency evaluation rubric for a practical project" },
      { day: "Thursday", focus: "Diagnostic Feedback", task: "Write encouraging, actionable feedback on a flawed student submission" },
      { day: "Friday", focus: "Classroom Simulation", task: "Practice re-engaging a distracted student classroom in Practice Studio" },
      { day: "Saturday", focus: "Micro-Teaching", task: "Deliver a 5-minute recorded micro-teaching lecture in Practice Studio" },
      { day: "Sunday", focus: "Review", task: "Reflect on pedagogical improvements and document in Skill Passport" }
    ];

    milestones = [
      { id: "m1", title: "Learning Objectives & Curriculum Architecture Certified", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Micro-Teaching Delivery & Student Engagement Checkpoint", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Competency Assessment & Feedback Mastery", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Instructional Educator & Trainer Placement Ready", status: "pending", targetWeeks: "Week 12" }
    ];
  } else {
    // Default Technology & Professional
    phases = [
      {
        phaseNumber: 1,
        name: "Core Fundamentals & Systems Architecture",
        durationWeeks: "Weeks 1-2",
        status: "in_progress",
        description: `Solidify core foundations and principles required for a professional ${name}.`,
        topics: ["Core Logic & Semantic Syntax", "Problem Decomposition", "Version Control with Git", "Clean Documentation"]
      },
      {
        phaseNumber: 2,
        name: "Applied Tooling, Data & Frameworks",
        durationWeeks: "Weeks 3-5",
        status: "pending",
        description: "Master modern frameworks, database persistence, and industry-standard workflows.",
        topics: ["Database Schemas & Query Optimization", "API Controllers & DTO Validation", "Unit Testing", "Debugging Methodology"]
      },
      {
        phaseNumber: 3,
        name: "Real-World Projects & Problem Solving",
        durationWeeks: "Weeks 6-8",
        status: "pending",
        description: "Construct functional, non-trivial applications solving concrete user needs.",
        topics: ["End-to-End Project Implementation", "State & Persistence Management", "Error Boundaries & Edge Cases", "Clean Code Standards"]
      },
      {
        phaseNumber: 4,
        name: "Portfolio Deployment & Technical Documentation",
        durationWeeks: "Weeks 9-10",
        status: "pending",
        description: "Deploy artifacts publicly with architectural diagrams, clear READMEs, and test suites.",
        topics: ["Production Hosting & CI/CD", "Comprehensive README with Architecture", "Code Coverage Verification"]
      },
      {
        phaseNumber: 5,
        name: "Interview Preparation & Market Placement",
        durationWeeks: "Weeks 11-12",
        status: "pending",
        description: "Master technical questioning, behavioral STAR answers, and system explanations.",
        topics: ["Top Industry Technical Questions", "Explaining Trade-offs in Practice Studio", "Mock Interview Simulations"]
      }
    ];

    weeklyPlan = [
      { day: "Monday", focus: "Core Logic", task: "Implement 1 key data transformation algorithm with step-by-step verification" },
      { day: "Tuesday", focus: "Persistence", task: "Write relational database queries with joins and clean schema constraints" },
      { day: "Wednesday", focus: "Integration", task: "Build a functional endpoint or module with error handling" },
      { day: "Thursday", focus: "Testing", task: "Add unit tests verifying positive and edge cases" },
      { day: "Friday", focus: "Practical Application", task: "Document architecture decisions and trade-offs in GitHub README" },
      { day: "Saturday", focus: "Mock Interview", task: "Practice explaining a technical decision in Practice Studio" },
      { day: "Sunday", focus: "Weekly Review", task: "Update Skill Passport and plan upcoming development sprint" }
    ];

    milestones = [
      { id: "m1", title: "Core Foundations Checkpoint", status: "completed", targetWeeks: "Week 2" },
      { id: "m2", title: "Applied Framework & Data Mastery", status: "in_progress", targetWeeks: "Week 5" },
      { id: "m3", title: "Production Portfolio Project Live", status: "pending", targetWeeks: "Week 8" },
      { id: "m4", title: "Placement Interview Ready Score > 85%", status: "pending", targetWeeks: "Week 12" }
    ];
  }

  return {
    title: `${name} Pathway Action Plan`,
    targetRole: name,
    category,
    currentLevel: profile.experience_level || 'Beginner',
    phases,
    weeklyPlan,
    milestones
  };
}

/**
 * Dynamic Career-Specific Tasks Generator
 * Generates bite-sized, practical hands-on tasks relevant to THAT career
 */
export function generateDynamicTask(targetCareerName, skillFocus) {
  const career = getCareerById(targetCareerName);
  const name = career ? career.career_name : targetCareerName;
  const category = career ? career.category : 'General';

  if (category === 'Skilled Trades') {
    return {
      title: `Hands-on Safety Diagnostic: ${skillFocus || 'Live-Dead-Live Testing'}`,
      description: `Practice the 5-step electrical isolation and multimeter verification sequence on a test bench before touching any terminal.`,
      whyItMatters: `Electrical safety discipline is the #1 requirement for licensed trade apprenticeships and prevents fatal accidents.`,
      skill: skillFocus || 'Workshop Safety & Diagnostics',
      difficulty: 'Intermediate',
      estimatedMinutes: 30,
      instructions: [
        'Step 1: Inspect multimeter leads for cracked insulation or exposed copper.',
        'Step 2: Set multimeter to AC voltage mode and test against a known energized reference point (Live).',
        'Step 3: Test the de-energized target equipment across all conductors (Dead).',
        'Step 4: Re-test against the known energized reference point to confirm meter functionality (Live).',
        'Step 5: Apply Lockout/Tagout (LOTO) padlock and document your reading in notes.'
      ],
      expectedOutcome: 'A verified, zero-risk de-energized equipment state confirmed by the 3-point test protocol.'
    };
  }

  if (category === 'Healthcare & Life Sciences') {
    return {
      title: `Clinical Simulation: ${skillFocus || 'SBAR Patient Handoff'}`,
      description: `Draft an SBAR (Situation, Background, Assessment, Recommendation) clinical handoff note for a simulated patient exhibiting abnormal vital signs.`,
      whyItMatters: `SBAR is the global clinical standard for preventing medical errors during shift transitions and physician escalations.`,
      skill: skillFocus || 'Clinical Communication',
      difficulty: 'Beginner',
      estimatedMinutes: 25,
      instructions: [
        'Step 1: Situation — State your name, ward, patient name, and immediate critical change.',
        'Step 2: Background — Note admission diagnosis, current medications, and baseline vitals.',
        'Step 3: Assessment — Detail current vitals (pulse, BP, SpO2) and clinical observations.',
        'Step 4: Recommendation — Suggest immediate action needed (e.g. ECG, physician bedside visit).'
      ],
      expectedOutcome: 'A concise, professional 1-paragraph clinical handoff note following strict SBAR structure.'
    };
  }

  if (category === 'Design & Creative') {
    return {
      title: `Design Exercise: ${skillFocus || 'Visual Hierarchy & Grid Layout'}`,
      description: `Take a dense, text-heavy product description and redesign it into an accessible, beautifully balanced hero layout using an 8pt grid.`,
      whyItMatters: `Clients and art directors look for designers who can create visual order out of chaos without visual clutter.`,
      skill: skillFocus || 'Typography & Layout',
      difficulty: 'Intermediate',
      estimatedMinutes: 45,
      instructions: [
        'Step 1: Identify the primary user action and give it clear visual prominence.',
        'Step 2: Establish a 3-tier typographic scale (H1: 32px, H2: 20px, Body: 15px).',
        'Step 3: Ensure minimum 4.5:1 color contrast ratio for all body text.',
        'Step 4: Align all elements to an 8px vertical baseline grid and export your work.'
      ],
      expectedOutcome: 'A clean, high-contrast visual design layout with balanced white space and clear visual hierarchy.'
    };
  }

  if (category === 'Marketing & Customer') {
    return {
      title: `Growth Experiment: ${skillFocus || 'Competitor Value Proposition Audit'}`,
      description: `Audit 3 competitor websites in your target sector. Deconstruct their primary headline, proof elements, and call-to-action hooks.`,
      whyItMatters: `Marketing success starts with identifying market gaps and positioning your product with clear, differentiated messaging.`,
      skill: skillFocus || 'Market Positioning',
      difficulty: 'Beginner',
      estimatedMinutes: 35,
      instructions: [
        'Step 1: Select 3 active competitors serving similar customer segments.',
        'Step 2: Record their exact H1 hero headline and primary CTA button text.',
        'Step 3: Identify what customer anxiety each headline is attempting to solve.',
        'Step 4: Draft 2 differentiated positioning angles that highlight unmet customer needs.'
      ],
      expectedOutcome: 'A 1-page structured comparison table documenting competitor messaging and your proposed differentiator.'
    };
  }

  if (category === 'Business & Management' || category === 'Entrepreneurship / Freelancing') {
    return {
      title: `Customer Discovery & MVP Drill: ${skillFocus || 'Customer Problem Interview'}`,
      description: `Conduct a structured 15-minute customer discovery interview to validate genuine willingness to pay before investing time or capital.`,
      whyItMatters: `The #1 reason ventures fail is building something nobody actually wants. Customer validation eliminates guesswork.`,
      skill: skillFocus || 'Customer Validation & Discovery',
      difficulty: 'Intermediate',
      estimatedMinutes: 40,
      instructions: [
        'Step 1: Write 3 non-leading open questions focusing on past customer behavior rather than hypothetical futures.',
        'Step 2: Interview 1 prospective customer and document the exact phrases they use to describe their pain.',
        'Step 3: Ask what they currently spend (time or money) trying to solve or tolerate this issue.',
        'Step 4: Synthesize whether the pain is severe enough to justify a paid solution.'
      ],
      expectedOutcome: 'A customer discovery field log with verbatim quotes and a clear validation score.'
    };
  }

  if (category === 'Agriculture & Food') {
    return {
      title: `Agri-Operations Field Exercise: ${skillFocus || 'Soil Health & Nutrient Sampling'}`,
      description: `Collect a representative composite soil sample across a test plot and evaluate moisture levels and nutrient requirements.`,
      whyItMatters: `Precision nutrient management prevents fertilizer waste, reduces input costs, and boosts crop yield resilience.`,
      skill: skillFocus || 'Soil & Crop Diagnostics',
      difficulty: 'Intermediate',
      estimatedMinutes: 35,
      instructions: [
        'Step 1: Sample topsoil at 15cm depth from 5 zigzag locations across the plot.',
        'Step 2: Mix thoroughly in a clean container to form an unbiased composite sample.',
        'Step 3: Test moisture retention and record pH/electrical conductivity using field test kit.',
        'Step 4: Formulate a calibrated micro-nutrient recommendation tailored to the current crop cycle.'
      ],
      expectedOutcome: 'A completed soil diagnostic test sheet with targeted fertigation adjustments.'
    };
  }

  if (category === 'Hospitality & Tourism') {
    return {
      title: `Guest Service Recovery Drill: ${skillFocus || 'High-Stress Guest De-escalation'}`,
      description: `Apply the LAST protocol (Listen, Apologize, Solve, Thank) to resolve a simulated dissatisfied hotel guest complaint.`,
      whyItMatters: `Superior hospitality leaders turn service failures into lifetime loyalty through swift, empathetic resolution.`,
      skill: skillFocus || 'Guest Relations & Service Recovery',
      difficulty: 'Intermediate',
      estimatedMinutes: 30,
      instructions: [
        'Step 1: Listen without interrupting while taking brief, attentive written notes.',
        'Step 2: Express sincere empathy without becoming defensive or blaming other departments.',
        'Step 3: Propose two concrete immediate solutions and confirm the guest is satisfied.',
        'Step 4: Log the incident in the property management system and follow up with a personalized gesture.'
      ],
      expectedOutcome: 'A recorded, empathetic service recovery dialogue demonstrating professional composure.'
    };
  }

  if (category === 'Logistics & Supply Chain') {
    return {
      title: `Warehouse Accuracy Drill: ${skillFocus || 'Inventory Cycle Count & Discrepancy Reconciliation'}`,
      description: `Perform a 10-SKU physical cycle count and isolate root causes for any variance between physical stock and WMS records.`,
      whyItMatters: `High inventory accuracy prevents stockouts, reduces fulfillment delays, and protects customer trust.`,
      skill: skillFocus || 'Inventory Control & WMS Accuracy',
      difficulty: 'Intermediate',
      estimatedMinutes: 35,
      instructions: [
        'Step 1: Print or pull the blind cycle count sheet for the target warehouse bin location.',
        'Step 2: Physically verify unit count, lot numbers, and expiration dates without checking system quantities first.',
        'Step 3: Compare physical tally against WMS stock balances and flag discrepancies.',
        'Step 4: Trace transactions from the past 7 days to identify the mispick or unrecorded scrap root cause.'
      ],
      expectedOutcome: 'A completed inventory variance report with root-cause identification and inventory adjustment log.'
    };
  }

  if (category === 'Education & Training') {
    return {
      title: `Instructional Design Drill: ${skillFocus || 'Micro-Teaching & Analogy Demonstration'}`,
      description: `Design and present a 5-minute micro-teaching explanation of a challenging concept using an intuitive real-world analogy.`,
      whyItMatters: `Master educators make complex subjects instantly accessible by connecting new ideas to familiar concepts.`,
      skill: skillFocus || 'Pedagogy & Knowledge Transfer',
      difficulty: 'Intermediate',
      estimatedMinutes: 30,
      instructions: [
        'Step 1: Select 1 core topic and identify the single most common student misconception.',
        'Step 2: Create a physical or narrative analogy that simplifies the core mechanism.',
        'Step 3: Present your explanation aloud in Practice Studio with a clear check-for-understanding question.',
        'Step 4: Write a 2-question exit ticket evaluating whether the learner grasped the principle.'
      ],
      expectedOutcome: 'A 5-minute micro-lesson structure with analogy, check-for-understanding, and exit rubric.'
    };
  }

  // Default Technology / Data / Engineering
  return {
    title: `Practical Artifact Exercise: ${skillFocus || 'Data Query & Transformation'}`,
    description: `Construct a functional real-world implementation demonstrating working competency in ${skillFocus || 'core problem solving'}.`,
    whyItMatters: `Hiring managers and clients prioritize concrete demonstrations of problem-solving ability over theoretical quiz scores.`,
    skill: skillFocus || 'Applied Technical Skills',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    instructions: [
      'Step 1: Define your input specifications, expected outputs, and constraints cleanly.',
      'Step 2: Implement your solution step-by-step, verifying intermediate outputs.',
      'Step 3: Test against boundary conditions and edge cases.',
      'Step 4: Document your trade-offs and submit your solution notes.'
    ],
    expectedOutcome: `A verified, functional artifact demonstrating independent mastery of ${skillFocus || 'practical tools'}.`
  };
}
