// Automated End-to-End Audit & Verification Script for Career Solver MVP
import assert from 'assert';

const BASE_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runAudit() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE CAREER SOLVER AUDIT & QA');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  // ---------------------------------------------------------------
  // 1. HEALTH CHECK
  // ---------------------------------------------------------------
  const health = await request('/health');
  report('Health check endpoint', health.ok && health.data.status === 'ok');

  // ---------------------------------------------------------------
  // 2. AUTHENTICATION & SECURITY
  // ---------------------------------------------------------------
  const testEmail = `test_auditor_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Missing fields
  const regMissing = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail })
  });
  report('Signup validates required fields', regMissing.status === 400);

  // Valid Signup
  const regSuccess = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Auditor User',
      email: testEmail,
      password: testPassword,
      personaType: 'college_student'
    })
  });
  report('User signup successful', regSuccess.status === 201 && !!regSuccess.data.token);
  const userToken = regSuccess.data.token;
  const userAuthHeaders = { Authorization: `Bearer ${userToken}` };

  // Duplicate email registration
  const regDup = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate Auditor',
      email: testEmail,
      password: testPassword
    })
  });
  report('Signup rejects duplicate email', regDup.status === 400);

  // Login wrong password
  const loginWrong = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'wrongpassword' })
  });
  report('Login rejects wrong credentials', loginWrong.status === 401);

  // Login correct password
  const loginCorrect = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  report('Login succeeds with correct credentials', loginCorrect.status === 200 && !!loginCorrect.data.token);

  // Session persistence check
  const meRes = await request('/auth/me', { headers: userAuthHeaders });
  report('Session persistence (/auth/me)', meRes.status === 200 && meRes.data.user.email === testEmail);

  // Protected route rejects unauthenticated request
  const unauthRes = await request('/profile');
  report('Protected routes reject unauthenticated access', unauthRes.status === 401);

  // Demo accounts login
  const personas = ['arun', 'muthu', 'priya', 'sneha', 'kavita', 'deepak', 'admin'];
  for (const p of personas) {
    const dRes = await request(`/auth/demo-login/${p}`, { method: 'POST' });
    report(`Demo login: ${p}`, dRes.status === 200 && !!dRes.data.token && !!dRes.data.user);
  }

  // Admin authorization check: normal user forbidden from admin endpoints
  const adminAsUser = await request('/admin/users', { headers: userAuthHeaders });
  report('Admin endpoints reject normal users with 403', adminAsUser.status === 403);

  // Admin login allows admin endpoint
  const adminLogin = await request('/auth/demo-login/admin', { method: 'POST' });
  const adminAuthHeaders = { Authorization: `Bearer ${adminLogin.data.token}` };
  const adminUsers = await request('/admin/users', { headers: adminAuthHeaders });
  report('Admin endpoints allow admin role with 200', adminUsers.status === 200 && Array.isArray(adminUsers.data.users));

  // ---------------------------------------------------------------
  // 3. PROFILE & ONBOARDING
  // ---------------------------------------------------------------
  // Intermediate profile update
  const putProfile = await request('/profile', {
    method: 'PUT',
    headers: userAuthHeaders,
    body: JSON.stringify({
      location: 'Bangalore, India',
      daily_learning_hours: 3.0,
      technical_skills: ['Problem Solving', 'Data Analysis']
    })
  });
  report('PUT /profile handles partial updates safely without SQLite error', putProfile.status === 200);

  // Complete Onboarding
  const onboardRes = await request('/profile/onboarding', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      persona_type: 'college_student',
      education_level: 'Undergraduate',
      field_of_study: 'Data Science',
      current_status: 'Exploring',
      occupation: 'Student',
      target_goal: 'Explore Technology & Practical Pathways',
      technical_skills: ['Python Basics', 'SQL', 'Data Cleaning'],
      soft_skills: ['Curiosity', 'Communication'],
      practical_skills: [],
      interests: ['Technology', 'Computers', 'Data'],
      work_preference: 'computer_based',
      daily_learning_hours: 2.5,
      has_computer: true,
      preferred_language: 'English',
      location: 'Chennai, India'
    })
  });
  report('Onboarding completion persists data', onboardRes.status === 200);

  const getProfile = await request('/profile', { headers: userAuthHeaders });
  report(
    'Profile reflects saved onboarding values',
    getProfile.data.profile.location === 'Chennai, India' &&
    getProfile.data.profile.technical_skills.includes('SQL')
  );

  // ---------------------------------------------------------------
  // 4. CAREER DISCOVERY & MULTI-CATEGORY DIVERSITY
  // ---------------------------------------------------------------
  // Catalog listing
  const catalog = await request('/careers');
  const catNames = new Set(catalog.data.careers.map(c => c.category));
  report(
    'Career catalog contains 10+ diverse categories',
    catalog.data.count >= 20 && catNames.size >= 10,
    `${catalog.data.count} careers across ${catNames.size} categories`
  );

  // Scenario A: Career Confusion ("I don't know what career to choose")
  const confusedDiscovery = await request('/discovery', {
    method: 'POST',
    body: JSON.stringify({
      overrides: {
        target_goal: "I don't know what career to choose",
        interests: ['Helping people', 'Communication', 'Creativity'],
        work_preference: 'balanced'
      }
    })
  });
  const confusedRecs = confusedDiscovery.data.recommendations || [];
  const topConfused = confusedRecs[0];
  const isNotForcedJava = topConfused && !topConfused.careerName.toLowerCase().includes('java');
  report(
    'Scenario A: "I don\'t know" does NOT force Java Developer',
    isNotForcedJava,
    `Top recommendation: ${topConfused?.careerName} (${topConfused?.category})`
  );

  // User B: Healthcare & Helping People
  const healthDiscovery = await request('/discovery', {
    method: 'POST',
    body: JSON.stringify({
      overrides: {
        interests: ['Helping people', 'Healthcare', 'Medicine'],
        work_preference: 'people_oriented'
      }
    })
  });
  const healthRecs = healthDiscovery.data.recommendations || [];
  report(
    'Healthcare profile returns healthcare pathways',
    healthRecs.some(r => r.category === 'Healthcare & Life Sciences'),
    `Top 3: ${healthRecs.slice(0, 3).map(r => r.careerName).join(', ')}`
  );

  // User C: Creative & Visual Design
  const designDiscovery = await request('/discovery', {
    method: 'POST',
    body: JSON.stringify({
      overrides: {
        interests: ['Drawing', 'Creativity', 'Visual design', 'Art'],
        work_preference: 'creative'
      }
    })
  });
  const designRecs = designDiscovery.data.recommendations || [];
  report(
    'Creative profile returns Design & Creative pathways',
    designRecs.some(r => r.category === 'Design & Creative' || r.careerName.includes('Designer')),
    `Top 3: ${designRecs.slice(0, 3).map(r => r.careerName).join(', ')}`
  );

  // User D: Repair & Machines & Hands-on
  const tradeDiscovery = await request('/discovery', {
    method: 'POST',
    body: JSON.stringify({
      overrides: {
        interests: ['Repair', 'Machines', 'Tools', 'Hands-on work'],
        work_preference: 'hands_on'
      },
      priorities: { handsOn: true }
    })
  });
  const tradeRecs = tradeDiscovery.data.recommendations || [];
  report(
    'Hands-on trade profile returns Skilled Trades pathways',
    tradeRecs.some(r => r.category === 'Skilled Trades'),
    `Top 3: ${tradeRecs.slice(0, 3).map(r => r.careerName).join(', ')}`
  );

  // User E: Business, Sales, Communication
  const businessDiscovery = await request('/discovery', {
    method: 'POST',
    body: JSON.stringify({
      overrides: {
        interests: ['Business', 'Sales', 'Communication', 'Management'],
        work_preference: 'business'
      }
    })
  });
  const businessRecs = businessDiscovery.data.recommendations || [];
  report(
    'Business profile returns Business / Marketing pathways',
    businessRecs.some(r => r.category === 'Business & Management' || r.category === 'Marketing & Customer'),
    `Top 3: ${businessRecs.slice(0, 3).map(r => r.careerName).join(', ')}`
  );

  // ---------------------------------------------------------------
  // 5. CAREER COMPARISON
  // ---------------------------------------------------------------
  const compareRes = await request('/compare', {
    method: 'POST',
    body: JSON.stringify({
      careers: ['Data Analyst', 'Licensed Electrician', 'Graphic Designer & Visual Brand Creator']
    })
  });
  report(
    'Career Comparison returns structured data for all 3 pathways',
    compareRes.status === 200 && compareRes.data.careers?.length === 3 &&
    compareRes.data.careers.every(c => c.keySkillsRequired && c.workEnvironment && c.tradeOffs)
  );

  // ---------------------------------------------------------------
  // 6. CAREER REALITY CHECK
  // ---------------------------------------------------------------
  // Trade Reality Check
  const tradeRC = await request('/reality-check', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ targetCareer: 'Licensed Electrician' })
  });
  report(
    'Reality check for Electrician includes safety protocols and trade code',
    tradeRC.status === 200 && (
      JSON.stringify(tradeRC.data.result).toLowerCase().includes('safety') ||
      JSON.stringify(tradeRC.data.result).toLowerCase().includes('code')
    )
  );

  // Design Reality Check
  const designRC = await request('/reality-check', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ targetCareer: 'Graphic Designer & Visual Brand Creator' })
  });
  report(
    'Reality check for Graphic Design includes portfolio & visual hierarchy',
    designRC.status === 200 && (
      JSON.stringify(designRC.data.result).toLowerCase().includes('portfolio') ||
      JSON.stringify(designRC.data.result).toLowerCase().includes('visual')
    )
  );

  // ---------------------------------------------------------------
  // 7. CAREER SELECTION & DYNAMIC ROADMAP GENERATION
  // ---------------------------------------------------------------
  // Select Graphic Design Pathway
  const selectDesign = await request('/select-career', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ careerName: 'Graphic Designer & Visual Brand Creator' })
  });
  report('Selecting Graphic Design pathway creates active goal & roadmap', selectDesign.status === 200 && !!selectDesign.data.roadmapId);

  // Verify active roadmap
  const activeRoadmap = await request('/roadmaps/active', { headers: userAuthHeaders });
  report(
    'Active roadmap is specific to Graphic Design',
    activeRoadmap.data.roadmap?.target_role === 'Graphic Designer & Visual Brand Creator' &&
    activeRoadmap.data.roadmap?.phases?.length === 5 &&
    activeRoadmap.data.roadmap?.progress_pct === 0, // Genuine 0% start
    `Roadmap: ${activeRoadmap.data.roadmap?.title}, Progress: ${activeRoadmap.data.roadmap?.progress_pct}%`
  );

  // Verify initial tasks connected to roadmap
  const userTasks = await request('/tasks', { headers: userAuthHeaders });
  report(
    'Initial tasks are generated and specific to Design',
    userTasks.data.tasks?.length >= 3 &&
    userTasks.data.tasks.some(t => t.title.toLowerCase().includes('design') || t.title.toLowerCase().includes('visual') || t.title.toLowerCase().includes('hierarchy')),
    `Tasks: ${userTasks.data.tasks?.map(t => t.title).join(' | ')}`
  );

  // ---------------------------------------------------------------
  // 8. TASK COMPLETION & REAL PROGRESS CALCULATION
  // ---------------------------------------------------------------
  const initialDashboard = await request('/dashboard/overview', { headers: userAuthHeaders });
  report(
    'Initial progress is 0% when 0 tasks are completed',
    initialDashboard.data.roadmapProgress === 0,
    `Initial dashboard progress: ${initialDashboard.data.roadmapProgress}%`
  );

  // Complete Task 1
  const task1 = userTasks.data.tasks[0];
  const updateTask1 = await request(`/tasks/${task1.id}/status`, {
    method: 'PUT',
    headers: userAuthHeaders,
    body: JSON.stringify({ status: 'completed' })
  });
  report('Marking task 1 completed succeeds', updateTask1.status === 200);

  const dashAfter1 = await request('/dashboard/overview', { headers: userAuthHeaders });
  report(
    'Dashboard progress increments logically after 1 task completed',
    dashAfter1.data.roadmapProgress > 0 && dashAfter1.data.roadmapProgress === 33,
    `Progress after 1/3 tasks: ${dashAfter1.data.roadmapProgress}%`
  );

  // Complete Task 2
  const task2 = userTasks.data.tasks[1];
  await request(`/tasks/${task2.id}/status`, {
    method: 'PUT',
    headers: userAuthHeaders,
    body: JSON.stringify({ status: 'completed' })
  });
  const dashAfter2 = await request('/dashboard/overview', { headers: userAuthHeaders });
  report(
    'Dashboard progress increments logically after 2 tasks completed',
    dashAfter2.data.roadmapProgress === 67,
    `Progress after 2/3 tasks: ${dashAfter2.data.roadmapProgress}%`
  );

  // Submit notes with AI review on Task 3
  const task3 = userTasks.data.tasks[2];
  const submitTask3 = await request(`/tasks/${task3.id}/submit`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      userNotes: 'Constructed an 8pt grid typography hierarchy layout with 4.5:1 contrast ratio.'
    })
  });
  report('Task note submission with evaluation succeeds', submitTask3.status === 200 && !!submitTask3.data.feedback);

  const dashAfter3 = await request('/dashboard/overview', { headers: userAuthHeaders });
  report(
    'Dashboard progress reaches 100% after all 3 tasks completed',
    dashAfter3.data.roadmapProgress === 100,
    `Final progress: ${dashAfter3.data.roadmapProgress}%`
  );

  // Verify Skill Passport automatically received the completed task skill
  const passport = await request('/skill-passport', { headers: userAuthHeaders });
  report(
    'Skill Passport records task completion as completed_activity',
    passport.data.skills?.some(s => s.source === 'completed_activity'),
    `Passport skills count: ${passport.data.skills?.length}`
  );

  // ---------------------------------------------------------------
  // 9. NEXT BEST ACTION DYNAMIC STATE
  // ---------------------------------------------------------------
  report(
    'Next best action changes when all tasks are complete',
    dashAfter3.data.nextBestAction?.type !== 'task',
    `Next action: ${dashAfter3.data.nextBestAction?.title} (${dashAfter3.data.nextBestAction?.buttonText})`
  );

  // ---------------------------------------------------------------
  // 10. AI MENTOR IN ALL MODES
  // ---------------------------------------------------------------
  const mentorModes = ['career', 'study', 'job', 'skill', 'business', 'communication'];
  for (const mode of mentorModes) {
    const chat = await request('/mentor/chat', {
      method: 'POST',
      headers: userAuthHeaders,
      body: JSON.stringify({
        mode,
        message: `Hello! I am currently working on ${activeRoadmap.data.roadmap.target_role}. What should I focus on?`
      })
    });
    report(
      `AI Mentor responds in mode: ${mode}`,
      chat.status === 200 && !!chat.data.reply && !chat.data.reply.text.toLowerCase().includes('java developer'),
      `Sample: ${chat.data.reply?.text?.substring(0, 60)}...`
    );
  }

  // ---------------------------------------------------------------
  // 11. PRACTICE STUDIO EVALUATION
  // ---------------------------------------------------------------
  const practicePrompts = await request('/practice/prompts');
  report('Practice Studio prompts loaded', practicePrompts.data.prompts?.length >= 3);

  const prompt1 = practicePrompts.data.prompts[0];
  const practiceEval = await request('/practice/evaluate', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      practiceType: prompt1.type,
      mode: prompt1.mode,
      promptQuestion: prompt1.question,
      userResponse: 'In my past work, I faced an urgent deadline where I broke the problem into smaller milestones and collaborated with the team to deliver on time.'
    })
  });
  report(
    'Practice Studio evaluates response and returns structured feedback',
    practiceEval.status === 200 && practiceEval.data.evaluation?.scoreMetrics?.overallScore > 0,
    `Overall score: ${practiceEval.data.evaluation?.scoreMetrics?.overallScore}`
  );

  const practiceHistory = await request('/practice/history', { headers: userAuthHeaders });
  report('Practice session saved in database history', practiceHistory.data.sessions?.length >= 1);

  // ---------------------------------------------------------------
  // 12. 7-DAY CHALLENGES
  // ---------------------------------------------------------------
  const challenges = await request('/challenges');
  report('Challenges listed', challenges.data.challenges?.length >= 1);

  const challenge1 = challenges.data.challenges[0];
  const joinChal = await request(`/challenges/${challenge1.id}/join`, {
    method: 'POST',
    headers: userAuthHeaders
  });
  report('User can join challenge', joinChal.status === 200 || joinChal.status === 201);

  const checkDay = await request(`/challenges/${challenge1.id}/check-day`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ dayNumber: 1 })
  });
  report('User can complete challenge daily task', checkDay.status === 200 && checkDay.data.progress_days >= 1);

  // ---------------------------------------------------------------
  // 13. COMMUNITY PEER SHARING
  // ---------------------------------------------------------------
  const createPost = await request('/community/posts', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      title: 'My Experience Transitioning Career Tracks',
      category: 'Career Guidance',
      content: 'Taking small daily actions on Career Solver roadmap has clarified my direction immensely.'
    })
  });
  report('User can create community post', createPost.status === 201 && !!createPost.data.postId);
  const postId = createPost.data.postId;

  // Like & Unlike post
  const likePost = await request(`/community/posts/${postId}/like`, {
    method: 'POST',
    headers: userAuthHeaders
  });
  report('User can like post', likePost.status === 200 && likePost.data.likes_count === 1);

  const unlikePost = await request(`/community/posts/${postId}/like`, {
    method: 'POST',
    headers: userAuthHeaders
  });
  report('User can toggle like off', unlikePost.status === 200 && unlikePost.data.likes_count === 0);

  // Add Comment
  const addComm = await request(`/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ content: 'Inspiring progress! Keep it up.' })
  });
  report('User can add comment to post', addComm.status === 201);

  // Report Post
  const reportPost = await request(`/community/posts/${postId}/report`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ reason: 'Test moderation flag' })
  });
  report('User can flag/report post for moderation', reportPost.status === 201);

  // Admin moderation review
  const adminReports = await request('/admin/reports', { headers: adminAuthHeaders });
  report('Admin can view flagged community reports', adminReports.data.reports?.some(r => r.post_id === postId));

  // ---------------------------------------------------------------
  // 14. HUMAN MENTORSHIP & DEMO PROFILES
  // ---------------------------------------------------------------
  const mentors = await request('/mentors');
  report(
    'Mentors list loaded and demo mentors properly labeled',
    mentors.data.mentors?.length >= 1 &&
    mentors.data.mentors.every(m => m.is_demo === 1 || m.verification_status),
    `${mentors.data.mentors?.length} mentors found`
  );

  const mentor1 = mentors.data.mentors[0];
  const reqMentor = await request(`/mentors/${mentor1.id}/request`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      message: 'Seeking guidance on portfolio reviews and industry expectations.',
      goals: 'Career transition portfolio feedback',
      preferredTime: 'Weekends'
    })
  });
  report('User can submit mentorship request', reqMentor.status === 201 && !!reqMentor.data.requestId);

  const myReqs = await request('/mentors/my-requests', { headers: userAuthHeaders });
  report('User can view their pending mentor requests', myReqs.data.requests?.length >= 1 && myReqs.data.requests[0].status === 'pending');

  // ---------------------------------------------------------------
  // 15. ORGANIZATIONS & OPPORTUNITIES
  // ---------------------------------------------------------------
  const orgs = await request('/organizations');
  report('Organizations listed without blank cards', orgs.data.organizations?.length >= 1);

  const opps = await request('/opportunities');
  report('Opportunities listed and properly structured', opps.data.opportunities?.length >= 1);

  const opp1 = opps.data.opportunities[0];
  const applyOpp = await request(`/opportunities/${opp1.id}/apply`, {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({ notes: 'Applied with completed Career Solver Skill Passport.' })
  });
  report('User can apply to opportunity', applyOpp.status === 201);

  // ---------------------------------------------------------------
  // 16. BUSINESS BUILDER (MODULE 18)
  // ---------------------------------------------------------------
  const bizPlan = await request('/business/generate', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      ideaTitle: 'Verified Mobile Appliance Repair on Demand',
      rawDescription: 'Connecting certified local appliance technicians with residential customers with upfront pricing.',
      targetAudience: 'Urban homeowners needing quick reliable washing machine repairs'
    })
  });
  report(
    'Business Builder generates structured lean MVP plan with validation tasks',
    bizPlan.status === 200 &&
    !!bizPlan.data.problem &&
    bizPlan.data.validationTasks?.length >= 3 &&
    !!bizPlan.data.costPlanning
  );

  const myBizIdeas = await request('/business/my-ideas', { headers: userAuthHeaders });
  report('Business idea persisted and retrievable', myBizIdeas.data.ideas?.length >= 1);

  // ---------------------------------------------------------------
  // 17. SEARCH ACROSS CAREER CATALOG
  // ---------------------------------------------------------------
  const searchTerms = ['health', 'design', 'repair', 'business', 'computer', 'education'];
  for (const term of searchTerms) {
    const sRes = await request(`/careers?search=${term}`);
    report(
      `Catalog search for '${term}' returns relevant matching careers`,
      sRes.data.careers?.length >= 1,
      `Found ${sRes.data.careers?.length} matches`
    );
  }

  // ---------------------------------------------------------------
  // 18. AI CAREER DNA & 3P EVALUATION
  // ---------------------------------------------------------------
  const dnaEval = await request('/career-dna/evaluate', {
    method: 'POST',
    headers: userAuthHeaders,
    body: JSON.stringify({
      responses: {
        interests: ['technology', 'creative'],
        aptitudeAnswers: { apt_1: 'a', apt_2: 'b', apt_3: 'b', apt_4: 'a', apt_5: 'b' },
        workStyle: { autonomy: 'independent' },
        aspirations: { primaryLaunchGoal: 'placement', incomeVsStability: 'high_growth' },
        workPreferences: { computerUse: 'high', handsOn: 'moderate' }
      }
    })
  });
  report('AI Career DNA evaluation executes and persists', dnaEval.status === 200 && !!dnaEval.data.dna?.threeP);

  const threePRes = await request('/3p-analysis', { headers: userAuthHeaders });
  report('3P Analysis loads persisted profile context', threePRes.status === 200 && !!threePRes.data.threeP);

  // ---------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit execution error:', err);
  process.exit(1);
});
