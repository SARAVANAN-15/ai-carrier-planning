// Extended Modules QA for Career Solver
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

async function runExtendedTests() {
  console.log('\n========================================');
  console.log('🔬 TESTING EXTENDED CAREER SOLVER MODULES');
  console.log('========================================\n');

  // Authenticate as test user
  const loginRes = await req('/auth/demo-login/arun', { method: 'POST' });
  assert(loginRes.status === 200, 'Authenticated as demo user Arun');
  const token = loginRes.data?.token;
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Career DNA & 3P Analysis
  console.log('\n--- 1. Career DNA & 3P Analysis ---');
  const dnaQuestions = await req('/career-dna/questions', { headers });
  assert(dnaQuestions.status === 200 && dnaQuestions.data?.aptitudeQuestions?.length > 0, 'Career DNA questions retrieved');

  const dnaEval = await req('/career-dna/evaluate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      aptitudeAnswers: { q1: 1, q2: 2, q3: 0, q4: 1, q5: 2 },
      selectedInterests: ['technology', 'data'],
      workStyleDimensions: { autonomy: 'team_oriented', pace: 'moderate' }
    })
  });
  assert(dnaEval.status === 200 && dnaEval.data?.profile?.threePAnalysis, 'Career DNA evaluation generates 3P Analysis');

  const threeP = await req('/3p-analysis', { headers });
  assert(threeP.status === 200 && threeP.data?.threePAnalysis, '3P Analysis accessible');

  // 2. Skill Gap Analysis & Readiness
  console.log('\n--- 2. Skill Gap Analysis & Readiness Score ---');
  const skillGaps = await req('/skill-gaps/car_software_developer', { headers });
  assert(skillGaps.status === 200 && Array.isArray(skillGaps.data?.missingSkills), 'Skill gaps computed for career');

  const readiness = await req('/readiness/score', { headers });
  assert(readiness.status === 200 && typeof readiness.data?.overallScore === 'number', `Readiness score computed: ${readiness.data?.overallScore}/100`);

  // 3. Projects Catalog & Submission
  console.log('\n--- 3. Projects Portfolio ---');
  const projects = await req('/projects', { headers });
  assert(projects.status === 200 && projects.data?.catalog?.length > 0, `Project catalog has ${projects.data?.catalog?.length} practical projects`);

  const firstProj = projects.data?.catalog[0];
  const submitProj = await req('/projects/submit', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      projectId: firstProj.id,
      title: firstProj.title,
      repositoryUrl: 'https://github.com/example/my-project',
      liveDemoUrl: 'https://example-demo.app',
      reflectionNotes: 'Built a responsive prototype with clean state management.'
    })
  });
  assert(submitProj.status === 200 && submitProj.data?.deliverable, 'Project deliverable submitted and recorded');

  // 4. Industry Exposure & Practical Log
  console.log('\n--- 4. Industry Exposure ---');
  const industry = await req('/industry-exposure', { headers });
  assert(industry.status === 200 && industry.data?.catalog?.length > 0, 'Industry exposure catalog retrieved');

  const firstAct = industry.data?.catalog[0];
  const logAct = await req('/industry-exposure/log', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      activityId: firstAct.id,
      activityType: firstAct.type,
      title: firstAct.title,
      notes: 'Attended local tech meetup and shadowed frontend architecture session.'
    })
  });
  assert(logAct.status === 200 && logAct.data?.activity, 'Industry exposure activity logged');

  // 5. Career Launch Plan
  console.log('\n--- 5. Career Launch Plan ---');
  const launchTemplates = await req('/career-launch', { headers });
  assert(launchTemplates.status === 200, 'Career launch templates retrieved');

  const selectLaunch = await req('/career-launch/select', {
    method: 'POST',
    headers,
    body: JSON.stringify({ templateId: 'launch_it_fresher' })
  });
  assert(selectLaunch.status === 200 && selectLaunch.data?.plan, 'Career launch plan activated');

  // 6. AI Career Navigator
  console.log('\n--- 6. AI Career Navigator ---');
  const navChat = await req('/navigator/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query: 'What is the real difference between a Data Analyst and a Software Developer day-to-day?',
      history: []
    })
  });
  assert(navChat.status === 200 && navChat.data?.result?.answer, 'Career Navigator provided detailed answer');

  // 7. Business Builder
  console.log('\n--- 7. Business Builder ---');
  const bizPlan = await req('/business/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ideaTitle: 'Solar Maintenance & EV Charging Helper',
      rawDescription: 'On-demand diagnostic and maintenance for residential solar panels and EV home chargers.',
      targetAudience: 'Eco-conscious homeowners and EV drivers'
    })
  });
  assert(bizPlan.status === 200 && bizPlan.data?.plan, 'Business plan generated with MVP roadmap');

  // 8. Community & Networking
  console.log('\n--- 8. Community Posts & Interactions ---');
  const posts = await req('/community/posts', { headers });
  assert(posts.status === 200 && Array.isArray(posts.data?.posts), 'Community posts feed loaded');

  const newPost = await req('/community/posts', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Completed my first 5-phase practical milestone!',
      content: 'Finished the diagnostic safety checklist today in Practice Studio. Highly recommend practicing the Live-Dead-Live sequence!',
      category: 'wins'
    })
  });
  assert(newPost.status === 201 && newPost.data?.post?.id, 'New community post created');
  const postId = newPost.data?.post?.id;

  const likeRes = await req(`/community/posts/${postId}/like`, {
    method: 'POST',
    headers
  });
  assert(likeRes.status === 200, 'Liked community post');

  // 9. Mentors & Organizations
  console.log('\n--- 9. Mentors & Organizations Directory ---');
  const mentors = await req('/mentors', { headers });
  assert(mentors.status === 200 && mentors.data?.mentors?.length > 0, `Mentors directory contains ${mentors.data?.mentors?.length} verified mentors`);

  const orgs = await req('/organizations', { headers });
  assert(orgs.status === 200 && orgs.data?.organizations?.length > 0, `Organizations directory contains ${orgs.data?.organizations?.length} hiring partners`);

  const opps = await req('/opportunities', { headers });
  assert(opps.status === 200 && opps.data?.opportunities?.length > 0, `Opportunities job board contains ${opps.data?.opportunities?.length} active listings`);

  // 10. Summary
  console.log('\n========================================');
  console.log(`EXTENDED QA RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runExtendedTests().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
