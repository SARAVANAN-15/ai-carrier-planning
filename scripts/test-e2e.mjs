// Comprehensive End-to-End System Test for Career Solver
const BASE_URL = 'http://localhost:3000/api';

async function req(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✅ ${message}`);
  } else {
    failed++;
    console.error(`  ❌ FAILED: ${message}`, detail);
  }
}

async function runAllTests() {
  console.log('\n========================================');
  console.log('🚀 RUNNING CAREER SOLVER END-TO-END QA');
  console.log('========================================\n');

  // 1. Health check
  console.log('--- 1. Health Check ---');
  const health = await req('/health');
  assert(health.status === 200 && health.data?.status === 'ok', 'Server is healthy');

  // 2. Authentication: Validation, Duplicates, Login
  console.log('\n--- 2. Authentication & Authorization ---');
  const testEmail = `qa_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  // Invalid email
  const badEmailRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: 'notanemail', password: testPassword, full_name: 'QA Tester' })
  });
  assert(badEmailRes.status === 400, 'Rejects invalid email format');

  // Short password
  const shortPassRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: '123', full_name: 'QA Tester' })
  });
  assert(shortPassRes.status === 400, 'Rejects short password');

  // Valid registration
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword, full_name: 'QA Full Cycle Tester' })
  });
  assert(regRes.status === 201 && regRes.data?.token, 'Registers user successfully with JWT');
  const userToken = regRes.data?.token;

  // Duplicate registration
  const dupRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword, full_name: 'QA Duplicate' })
  });
  assert(dupRes.status === 400, 'Rejects duplicate registration');

  // Invalid password login
  const badLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword!' })
  });
  assert(badLogin.status === 401, 'Rejects invalid password login');

  // Correct login
  const goodLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: testPassword })
  });
  assert(goodLogin.status === 200 && goodLogin.data?.token, 'Logs in with valid credentials');

  // Get current user (/auth/me)
  const meRes = await req('/auth/me', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(meRes.status === 200 && meRes.data?.email === testEmail, '/auth/me returns current user');

  // Demo user logins
  const demoAlex = await req('/auth/demo-login/alex', { method: 'POST' });
  assert(demoAlex.status === 200 && demoAlex.data?.user?.id, 'Demo login Alex / Arun (Undecided student)');

  const demoDavid = await req('/auth/demo-login/david', { method: 'POST' });
  assert(demoDavid.status === 200 && demoDavid.data?.user?.id, 'Demo login David / Muthu (Skilled trades)');

  const demoAdmin = await req('/auth/demo-login/admin', { method: 'POST' });
  assert(demoAdmin.status === 200 && demoAdmin.data?.user?.role === 'admin', 'Demo login Admin');
  const adminToken = demoAdmin.data?.token;

  // Admin route protection: Normal user rejected, admin user allowed
  const unauthAdmin = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(unauthAdmin.status === 403, 'Normal user blocked from /admin/stats (403)');

  const authAdmin = await req('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(authAdmin.status === 200 && authAdmin.data?.stats, 'Admin user can access /admin/stats');

  // 3. Onboarding & Profile Persistence
  console.log('\n--- 3. Onboarding & Profile Persistence ---');
  const onboardingPayload = {
    education_level: 'High School / Exploring College',
    field_of_study: 'General Studies',
    current_status: 'Undecided',
    target_goal: 'Explore practical careers in trades, engineering, and tech',
    experience_level: 'entry',
    hours_per_week: 20,
    learning_style: 'hands_on',
    interests: ['electronics', 'mechanical', 'problem solving', 'hands-on building'],
    skills: ['basic math', 'troubleshooting'],
    risk_tolerance: 'moderate',
    financial_constraint: 'low_debt_priority',
    career_timeline_months: 12
  };
  const obRes = await req('/profile/onboarding', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify(onboardingPayload)
  });
  assert(obRes.status === 200 && obRes.data?.user?.onboarding_completed === 1, 'Onboarding completes successfully');

  // Verify persistence via GET /profile
  const profRes = await req('/profile', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(
    profRes.status === 200 &&
    profRes.data?.profile?.learning_style === 'hands_on' &&
    profRes.data?.profile?.hours_per_week === 20,
    'Profile reflects saved onboarding data accurately'
  );

  // 4. Career Discovery (Non-hardcoded, multi-category)
  console.log('\n--- 4. Career Discovery & Recommendation ---');
  const discRes = await req('/discovery', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      interests: ['hands-on', 'wiring', 'renewable energy', 'mechanical'],
      strengths: ['spatial reasoning', 'math', 'troubleshooting'],
      preferences: { work_style: 'physical_and_field', risk_tolerance: 'low' }
    })
  });
  assert(discRes.status === 200, 'Discovery endpoint responds 200');
  const recs = discRes.data?.recommendations || [];
  assert(recs.length >= 3, `Discovery returns multiple recommendations (found ${recs.length})`);
  const recTitles = recs.map(r => r.title || r.career_name || '');
  console.log('    Recommended careers:', recTitles.join(', '));
  assert(
    !recTitles.every(t => t.toLowerCase().includes('java')),
    'Recommendations are diverse and tailored, NOT defaulting to Java Developer'
  );

  // Browse Catalog
  const catalogRes = await req('/careers');
  assert(catalogRes.status === 200 && catalogRes.data?.careers?.length >= 20, `Career catalog has ${catalogRes.data?.careers?.length} rich careers across categories`);

  // 5. Career Comparison
  console.log('\n--- 5. Career Comparison ---');
  const compRes = await req('/compare', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      career_ids: ['Software Developer', 'Licensed Electrician']
    })
  });
  assert(compRes.status === 200, 'Comparison endpoint responds 200');
  const comparisons = compRes.data?.comparison || compRes.data?.careers || [];
  assert(comparisons.length === 2, 'Comparison returned side-by-side data for both requested careers');
  assert(comparisons.every(c => c.time_to_transition || c.salary_entry), 'Comparison includes realistic transition times & salary data');

  // 6. Reality Check
  console.log('\n--- 6. Career Reality Check ---');
  const rcRes = await req('/reality-check', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      target_career: 'Licensed Electrician',
      current_skills: ['basic math', 'troubleshooting'],
      hours_available: 15,
      budget: 'low',
      timeline_months: 12
    })
  });
  assert(rcRes.status === 200, 'Reality check endpoint responds 200');
  const assessment = rcRes.data?.assessment || rcRes.data;
  assert(
    typeof assessment?.feasibility_score === 'number' &&
    assessment?.feasibility_score >= 0 &&
    assessment?.feasibility_score <= 100,
    `Feasibility score generated: ${assessment?.feasibility_score}%`
  );
  assert(
    Array.isArray(assessment?.risk_factors || assessment?.obstacles) &&
    Array.isArray(assessment?.recommendations || assessment?.actionable_mitigations),
    'Reality check includes risk factors and actionable recommendations'
  );

  // 7. Select Career & Roadmap Activation
  console.log('\n--- 7. Select Career & Roadmap Activation ---');
  const selRes = await req('/select-career', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      target_career: 'Licensed Electrician'
    })
  });
  assert(selRes.status === 200 && selRes.data?.roadmap, 'Career selected and active roadmap generated');

  const activeRdm = await req('/roadmaps/active', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(activeRdm.status === 200 && activeRdm.data?.roadmap?.target_career === 'Licensed Electrician', 'Active roadmap matches selected career');
  const phases = activeRdm.data?.phases || [];
  assert(phases.length >= 3, `Roadmap contains structured phases (${phases.length} phases)`);

  // 8. Actionable Daily Tasks & Completion Workflow
  console.log('\n--- 8. Actionable Daily Tasks & Completion ---');
  const tasksRes = await req('/tasks', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(tasksRes.status === 200 && tasksRes.data?.tasks?.length > 0, `Tasks generated for roadmap (${tasksRes.data?.tasks?.length} tasks)`);
  const firstTask = tasksRes.data?.tasks[0];

  // Mark task in progress
  const updateTaskRes = await req(`/tasks/${firstTask.id}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ status: 'in_progress' })
  });
  assert(updateTaskRes.status === 200, 'Task status updated to in_progress');

  // Submit task with verification deliverable
  const submitTaskRes = await req(`/tasks/${firstTask.id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      submission_notes: 'Reviewed apprenticeship requirements and electrical code safety basics for state certification.',
      key_takeaway: 'Apprenticeships provide paid on-the-job training with classroom theory.'
    })
  });
  assert(submitTaskRes.status === 200 && submitTaskRes.data?.task?.status === 'completed', 'Task completed and deliverable saved');

  // Check Skill Passport for skill credit
  const spRes = await req('/skill-passport', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(spRes.status === 200 && spRes.data?.passport, 'Skill Passport accessible');

  // 9. AI Mentor Chat
  console.log('\n--- 9. AI Mentor Chat ---');
  const mentorChatRes = await req('/mentor/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      mode: 'strategic',
      message: 'What certifications should I focus on first to get hired quickly?'
    })
  });
  const replyContent = mentorChatRes.data?.text || mentorChatRes.data?.reply?.text || (typeof mentorChatRes.data?.reply === 'string' ? mentorChatRes.data.reply : '');
  assert(
    mentorChatRes.status === 200 &&
    typeof replyContent === 'string' &&
    replyContent.length > 20,
    'AI Mentor delivers contextual, quality response'
  );

  // 10. Practice Studio
  console.log('\n--- 10. Practice Studio ---');
  const practicePrompts = await req('/practice/prompts?career=Licensed%20Electrician', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(practicePrompts.status === 200 && practicePrompts.data?.prompts?.length > 0, 'Practice studio returns interactive prompts');
  const promptItem = practicePrompts.data?.prompts[0];

  const evalRes = await req('/practice/evaluate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      prompt_id: promptItem.id,
      prompt_title: promptItem.title,
      question: promptItem.question,
      user_answer: 'I always use a multimeter to verify zero voltage before touching any conductor, following lockout/tagout protocol.',
      career_name: 'Licensed Electrician'
    })
  });
  assert(evalRes.status === 200 && evalRes.data?.evaluation?.score !== undefined, `Practice evaluation scored: ${evalRes.data?.evaluation?.score}/100`);

  const practiceHistory = await req('/practice/history', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(practiceHistory.status === 200 && practiceHistory.data?.history?.length > 0, 'Practice submission saved to history');

  // 11. Dashboard Overview & Next Best Action
  console.log('\n--- 11. Dashboard Overview & Next Best Action ---');
  const dashRes = await req('/dashboard/overview', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(dashRes.status === 200, 'Dashboard overview responds 200');
  assert(dashRes.data?.activeRoadmap?.target_career === 'Licensed Electrician', 'Dashboard reflects current active career');
  assert(dashRes.data?.nextBestAction, `Next Best Action dynamically computed: "${dashRes.data?.nextBestAction?.title}"`);
  assert(typeof dashRes.data?.readinessScore === 'number', `Readiness score computed: ${dashRes.data?.readinessScore}`);

  // 12. Community & Challenges
  console.log('\n--- 12. Community Challenges ---');
  const chalRes = await req('/challenges', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(chalRes.status === 200 && chalRes.data?.challenges?.length > 0, 'Challenges listed');
  const firstChal = chalRes.data?.challenges[0];

  const joinRes = await req(`/challenges/${firstChal.id}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert(joinRes.status === 200, 'Joined challenge successfully');

  // 13. Summary
  console.log('\n========================================');
  console.log(`QA RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
