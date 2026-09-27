import { db, initDatabase } from './connection.js';
import crypto from 'crypto';

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'career-solver-salt').digest('hex');
}

export function seedDatabase() {
  initDatabase();

  // Check if all personas are seeded
  const check = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (check && check.count >= 7) {
    console.log(`Database already has ${check.count} users. Updating seed data if necessary.`);
    return;
  }

  console.log('Seeding initial data for Career Solver MVP...');

  const now = new Date().toISOString();

  // 1. SEED USERS & PERSONAS
  // Persona 1: Arun Kumar (College Student - Tech & Data Exploration)
  const arunId = 'usr_arun_college';
  const arunPass = hashPassword('arun123');

  // Persona 2: Muthu Vel (Vocational / Practical Experience - Electrical & Appliance Repair)
  const muthuId = 'usr_muthu_vocational';
  const muthuPass = hashPassword('muthu123');

  // Persona 3: Priya Sharma (Working Professional Career Switcher - Support to Growth Marketing)
  const priyaId = 'usr_priya_switcher';
  const priyaPass = hashPassword('priya123');

  // Persona 4: Sneha Roy (School Student - Exploring Science vs Design vs Tech)
  const snehaId = 'usr_sneha_school';
  const snehaPass = hashPassword('sneha123');

  // Persona 5: Kavita Patel (Entrepreneur - Local Verified Repair Service)
  const kavitaId = 'usr_kavita_entrepreneur';
  const kavitaPass = hashPassword('kavita123');

  // Persona 6: Deepak Nair (Higher Studies Seeker - Research & Post-Grad Profile)
  const deepakId = 'usr_deepak_higherstudies';
  const deepakPass = hashPassword('deepak123');

  // Admin User
  const adminId = 'usr_admin';
  const adminPass = hashPassword('admin123');

  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, name, email, password_hash, role, avatar, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(arunId, 'Arun Kumar', 'arun@example.com', arunPass, 'user', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', now);
  insertUser.run(muthuId, 'Muthu Vel', 'muthu@example.com', muthuPass, 'user', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', now);
  insertUser.run(priyaId, 'Priya Sharma', 'priya@example.com', priyaPass, 'user', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', now);
  insertUser.run(snehaId, 'Sneha Roy', 'sneha@example.com', snehaPass, 'user', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', now);
  insertUser.run(kavitaId, 'Kavita Patel', 'kavita@example.com', kavitaPass, 'user', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', now);
  insertUser.run(deepakId, 'Deepak Nair', 'deepak@example.com', deepakPass, 'user', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', now);
  insertUser.run(adminId, 'Career Solver Admin', 'admin@careersolver.ai', adminPass, 'admin', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', now);

  // 2. SEED USER PROFILES
  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO user_profiles (
      user_id, persona_type, education_level, field_of_study, current_status, occupation,
      target_goal, experience_level, technical_skills, soft_skills, practical_skills,
      interests, work_preference, collaboration_preference, employment_preference,
      daily_learning_hours, budget_constraint, has_smartphone, has_computer,
      internet_access, preferred_language, location, bio, completion_pct
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Arun: College Student Profile (Tech & Data Exploration)
  insertProfile.run(
    arunId,
    'college_student',
    'Undergraduate (B.Tech / B.E.)',
    'Computer Science & Engineering (Final Year)',
    'College Student',
    'Student',
    'Explore Technology, Data & Engineering Pathways',
    'Intermediate',
    JSON.stringify(['HTML/CSS', 'Python & SQL Basics', 'Problem Solving', 'Git', 'Data Structures']),
    JSON.stringify(['Problem Solving', 'Teamwork', 'Communication']),
    JSON.stringify([]),
    JSON.stringify(['Technology', 'Computers', 'Data', 'Engineering']),
    'computer_based',
    'balanced',
    'full_time',
    2.5,
    'low',
    1, 1, 'high_speed',
    'English',
    'Chennai, India',
    'Final-year engineering student evaluating whether to specialize in Data Analytics, Software Engineering, or Product Design. Looking for practical tasks and mentorship.',
    85
  );

  // Muthu: Vocational / Practical Experience Profile
  insertProfile.run(
    muthuId,
    'vocational_practical',
    'Practical experience / Non-traditional educational background',
    'Vocational Trade (Appliance Repair & Wiring)',
    'Practical Work',
    'Assistant Appliance Service Helper',
    'Certified Electrical & Appliance Service Technician',
    'Intermediate',
    JSON.stringify(['Basic Circuit Troubleshooting', 'Multimeter usage', 'Soldering']),
    JSON.stringify(['Customer Courtesy', 'Patience', 'Honesty']),
    JSON.stringify(['Wiring Installation', 'Appliance Dismantling', 'Basic Soldering', 'Tool Handling']),
    JSON.stringify(['Skilled trades', 'Engineering', 'Small business']),
    'hands_on',
    'individual',
    'apprenticeship',
    2.0,
    'limited',
    1, 0, 'mobile_data',
    'Tamil',
    'Coimbatore, India',
    '3 years of practical experience assisting senior technicians with home appliance servicing. Seeking structured electrical safety certification and an independent technician pathway.',
    80
  );

  // Priya: Career Switcher Profile
  insertProfile.run(
    priyaId,
    'professional',
    'Bachelor of Arts (English Literature)',
    'Humanities',
    'Employed',
    'Senior Customer Support Specialist (3 Years)',
    'Transition to Digital Marketing & Growth Specialist',
    'Beginner',
    JSON.stringify(['Google Analytics basics', 'Social Media Management', 'CRM Tools']),
    JSON.stringify(['Empathetic Communication', 'Customer Retention', 'Conflict Resolution', 'Copywriting']),
    JSON.stringify([]),
    JSON.stringify(['Marketing', 'Business', 'Communication']),
    'computer_based',
    'team',
    'full_time',
    1.5,
    'moderate',
    1, 1, 'high_speed',
    'English',
    'Bengaluru, India',
    '3 years in SaaS customer support. Passionate about transitioning into content strategy, performance marketing, and digital growth.',
    78
  );

  // Sneha: School Student Profile
  insertProfile.run(
    snehaId,
    'school_student',
    'High School (Senior Secondary - Science Stream)',
    'Physics, Chemistry, Math & Computer Science',
    'School Student',
    '12th Grade Student',
    'Explore Creative Design vs Science vs Engineering Pathways',
    'Beginner',
    JSON.stringify(['Basic Python', 'Digital Art', 'Figma basics']),
    JSON.stringify(['Creativity', 'Curiosity', 'Visual Storytelling']),
    JSON.stringify(['Sketching', 'Photography']),
    JSON.stringify(['Design', 'Creativity', 'Science', 'Technology']),
    'creative',
    'balanced',
    'higher_studies',
    1.5,
    'moderate',
    1, 1, 'high_speed',
    'English',
    'Kolkata, India',
    'Senior secondary student exploring whether to pursue UI/UX design, architecture, or computing.',
    82
  );

  // Kavita: Entrepreneur Profile
  insertProfile.run(
    kavitaId,
    'entrepreneur',
    'Bachelor of Commerce',
    'Accounting & Business',
    'Entrepreneur',
    'Founder & Operator',
    'Scale an On-Demand Home Appliance Repair & Electrical Service',
    'Intermediate',
    JSON.stringify(['QuickBooks', 'Social Media Ads', 'Excel Modeling']),
    JSON.stringify(['Vendor Negotiation', 'Customer Discovery', 'Team Leadership']),
    JSON.stringify(['Cost Estimation', 'Logistics Planning']),
    JSON.stringify(['Business', 'Entrepreneurship', 'Skilled trades', 'Helping people']),
    'hands_on',
    'team',
    'self_employed',
    2.0,
    'moderate',
    1, 1, 'high_speed',
    'English',
    'Ahmedabad, India',
    'Commercial graduate running a verified local home repair service. Testing customer willingness to pay and building a lean MVP booking flow.',
    85
  );

  // Deepak: Higher Studies Seeker Profile
  insertProfile.run(
    deepakId,
    'higher_studies',
    'Bachelor of Science (Physics)',
    'Physical Sciences & Applied Mathematics',
    'Looking for work / Academic Research',
    'Graduate Researcher',
    'Profile Building for Master of Science / Direct Ph.D. Applications',
    'Intermediate',
    JSON.stringify(['Python Data Analysis', 'LaTeX Documentation', 'Statistical Modeling']),
    JSON.stringify(['Academic Writing', 'Literature Review', 'Analytical Reasoning']),
    JSON.stringify(['Lab Equipment Operation']),
    JSON.stringify(['Research', 'Science', 'Mathematics', 'Technology']),
    'analytical',
    'individual',
    'higher_studies',
    3.0,
    'low',
    1, 1, 'high_speed',
    'English',
    'Kochi, India',
    'Physics graduate preparing application portfolios for funded international postgraduate and research fellowships.',
    80
  );

  // 3. SEED CAREER GOALS
  const insertGoal = db.prepare(`
    INSERT OR REPLACE INTO career_goals (id, user_id, title, target_pathway, description, status, target_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const arunGoalId = 'goal_arun_1';
  insertGoal.run(
    arunGoalId,
    arunId,
    'Explore Technology & Data Careers',
    'Technology & Data Systems',
    'Explore Software Engineering, Data Analytics, and Product Design through practical tasks and mentorship.',
    'active',
    '2026-11-30'
  );

  const muthuGoalId = 'goal_muthu_1';
  insertGoal.run(
    muthuGoalId,
    muthuId,
    'Appliance Repair Technician Pathway',
    'Skilled Trades',
    'Master electrical safety protocols, get formal trade certification, and establish trusted independent service client base.',
    'active',
    '2026-12-15'
  );

  const priyaGoalId = 'goal_priya_1';
  insertGoal.run(
    priyaGoalId,
    priyaId,
    'Digital Growth Marketer Pathway',
    'Marketing & Customer Growth',
    'Leverage customer empathy and communication skills into SEO, data-driven campaign management, and content marketing.',
    'active',
    '2026-10-31'
  );

  const snehaGoalId = 'goal_sneha_1';
  insertGoal.run(
    snehaGoalId,
    snehaId,
    'UI/UX & Creative Design Exploration',
    'Design & Creative',
    'Build a visual portfolio, explore design thinking, and prepare for creative bachelor programs.',
    'active',
    '2027-04-30'
  );

  const kavitaGoalId = 'goal_kavita_1';
  insertGoal.run(
    kavitaGoalId,
    kavitaId,
    'Home Services Marketplace MVP',
    'Small Business & Entrepreneurship',
    'Validate customer demand, design standard pricing, and acquire the first 25 paying households.',
    'active',
    '2026-11-15'
  );

  const deepakGoalId = 'goal_deepak_1';
  insertGoal.run(
    deepakGoalId,
    deepakId,
    'Funded MS / Ph.D. Research Admissions',
    'Higher Studies & Research',
    'Publish academic literature reviews, master research python, and draft statements of purpose.',
    'active',
    '2027-01-15'
  );

  // 4. SEED ROADMAP FOR ARUN
  const arunRoadmapId = 'rdm_arun_java';
  const arunPhases = [
    {
      phaseNumber: 1,
      name: 'Foundation & Object-Oriented Principles',
      durationWeeks: 'Weeks 1-2',
      status: 'completed',
      topics: ['Java 17+ Fundamentals', 'OOP Principles (Inheritance, Polymorphism, Abstraction)', 'Exception Handling', 'Collections Framework'],
      description: 'Solidify core Java memory models and OOP architectural principles.'
    },
    {
      phaseNumber: 2,
      name: 'Databases & Persistence Engineering',
      durationWeeks: 'Weeks 3-4',
      status: 'in_progress',
      topics: ['Relational Database Modeling', 'Complex SQL Queries & Indexing', 'JDBC & Hibernate / JPA', 'Transaction Management'],
      description: 'Design robust schemas and write optimized queries with persistence frameworks.'
    },
    {
      phaseNumber: 3,
      name: 'Spring Boot & RESTful Microservices',
      durationWeeks: 'Weeks 5-7',
      status: 'pending',
      topics: ['Spring Boot Starter architecture', 'REST Controller & DTOs', 'Spring Data JPA', 'Security & JWT Auth'],
      description: 'Build production-ready backend services with dependency injection.'
    },
    {
      phaseNumber: 4,
      name: 'Practical Portfolio Project Build',
      durationWeeks: 'Weeks 8-9',
      status: 'pending',
      topics: ['End-to-End E-Commerce or Logistics Backend', 'Unit Testing with JUnit & Mockito', 'Docker Containerization', 'GitHub Documentation'],
      description: 'Create a showcase GitHub repository solving a real-world business workflow.'
    },
    {
      phaseNumber: 5,
      name: 'Technical Interview & Placement Readiness',
      durationWeeks: 'Weeks 10-12',
      status: 'pending',
      topics: ['Top 50 Java Concurrency & System Questions', 'DSA on Trees & Graphs', 'Mock Technical Rounds', 'STAR Project Explanations'],
      description: 'Practice high-pressure interview communication and system explanation.'
    }
  ];

  const arunWeeklyPlan = [
    { day: 'Monday', focus: 'Core Java & Data Structures', task: 'Implement custom generic LRU cache using LinkedHashMap' },
    { day: 'Tuesday', focus: 'SQL & Database Optimization', task: 'Write analytical SQL queries with JOINs, GROUP BY, and indexing' },
    { day: 'Wednesday', focus: 'Spring Boot REST API', task: 'Create CRUD endpoints with DTO validation and GlobalExceptionHandler' },
    { day: 'Thursday', focus: 'System Design Basics', task: 'Draw high-level architecture diagram for a URL shortener backend' },
    { day: 'Friday', focus: 'Practical Project Sprints', task: 'Implement JWT authentication filter in Spring Security 6' },
    { day: 'Saturday', focus: 'Mock Interview Practice', task: 'Answer 5 high-frequency technical questions in Practice Studio' },
    { day: 'Sunday', focus: 'Weekly Review & Community Challenge', task: 'Review progress, submit challenge daily step, and plan next week' }
  ];

  const arunMilestones = [
    { id: 'm1', title: 'Core Java Mastery Checkpoint', status: 'completed', date: '2026-08-15' },
    { id: 'm2', title: 'SQL Database Schema Design', status: 'completed', date: '2026-09-02' },
    { id: 'm3', title: 'REST API Service Deployed', status: 'in_progress', date: '2026-10-01' },
    { id: 'm4', title: 'Full Stack Capstone Portfolio', status: 'pending', date: '2026-10-20' },
    { id: 'm5', title: 'Placement Mock Interview Score > 85%', status: 'pending', date: '2026-11-15' }
  ];

  db.prepare(`
    INSERT INTO roadmaps (
      id, user_id, goal_id, title, target_role, current_level,
      phases_json, weekly_plan_json, milestones_json, status, current_phase_index, progress_pct, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    arunRoadmapId,
    arunId,
    arunGoalId,
    'Java Backend Developer Placement Roadmap',
    'Java Backend Developer',
    'Intermediate',
    JSON.stringify(arunPhases),
    JSON.stringify(arunWeeklyPlan),
    JSON.stringify(arunMilestones),
    'active',
    1,
    42,
    now
  );

  // 5. SEED LEARN-BY-DOING TASKS FOR ARUN
  const insertTask = db.prepare(`
    INSERT INTO tasks (
      id, roadmap_id, user_id, title, description, why_it_matters, skill,
      difficulty, estimated_minutes, instructions_json, expected_outcome, status,
      user_notes, ai_feedback, due_day, order_index, is_daily_task, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTask.run(
    'tsk_arun_1',
    arunRoadmapId,
    arunId,
    'Design an SQL Student-Course Enrollment Schema with Constraints',
    'Create an SQL schema handling Many-to-Many relationships between Students and Courses with Foreign Key constraints and write analytical queries.',
    'Backend placement interviews test your database fundamentals directly. A developer must know how to prevent data anomalies and join tables efficiently.',
    'SQL & Relational Databases',
    'Intermediate',
    45,
    JSON.stringify([
      'Define a table `students` (id, name, email, enroll_date).',
      'Define a table `courses` (id, code, title, credits).',
      'Create a junction table `enrollments` with compound primary key (student_id, course_id) and ON DELETE CASCADE.',
      'Insert 4 sample students, 3 courses, and 6 enrollment records.',
      'Write a query to find all students enrolled in more than 2 courses using GROUP BY and HAVING.'
    ]),
    'A working SQL script with valid foreign key constraints and a working analytical aggregation query.',
    'completed',
    'Created schema in SQLite with composite primary keys and wrote the HAVING query. Verified with 5 rows.',
    'Excellent work! Your composite key ensures idempotency and avoids duplicate enrollments. As a bonus tip for your interviews, remember to mention indexing foreign key columns for fast join lookups.',
    'Yesterday',
    1,
    0,
    '2026-09-23T14:30:00Z'
  );

  insertTask.run(
    'tsk_arun_2',
    arunRoadmapId,
    arunId,
    'Build a REST Controller with DTO Validation in Spring Boot',
    'Create a `/api/v1/orders` endpoint that receives an OrderRequestDTO, validates non-null items and positive amounts, and returns clean HTTP 201 Created with JSON response.',
    'Writing clean REST controllers with Bean Validation (@Valid, @NotNull, @Min) is standard for all enterprise backend jobs.',
    'Spring Boot & REST APIs',
    'Intermediate',
    60,
    JSON.stringify([
      'Create an `OrderRequestDTO` class with fields: customerId, orderItems, totalAmount.',
      'Add Jakarta validation annotations: @NotBlank, @NotEmpty, and @Positive.',
      'Create a `@RestController` annotated with `@RequestMapping("/api/v1/orders")`.',
      'Implement a `@PostMapping` handler that validates the payload and returns `ResponseEntity<OrderResponseDTO>`.',
      'Write a simple `@ControllerAdvice` global exception handler to return clean error JSON when validation fails.'
    ]),
    'A clean, compiling Spring Boot controller returning appropriate HTTP status codes and validation messages.',
    'in_progress',
    'Started setting up the DTO and validation annotations. Working on the @ControllerAdvice next.',
    null,
    'Today',
    2,
    1,
    null
  );

  insertTask.run(
    'tsk_arun_3',
    arunRoadmapId,
    arunId,
    'Explain Java Garbage Collection & Generics in STAR Format',
    'Formulate a 90-second clear verbal or typed technical explanation of how the JVM Garbage Collector identifies unreachable objects (Mark-and-Sweep, Young vs Old Gen) and why Type Erasure exists.',
    'Interviewers look for conceptual depth, not just syntax recall. Explaining memory concepts clearly separates strong candidates from average coders.',
    'Java Core Concepts & Communication',
    'Beginner',
    30,
    JSON.stringify([
      'Structure response into: What problem does it solve -> How it works internally -> Trade-offs.',
      'Contrast Young Generation (Eden, Survivor) vs Tenured Generation.',
      'Clarify that JVM Generics enforce compile-time safety and undergo Type Erasure for backwards compatibility.',
      'Practice saying it out loud in 90 seconds or type your answer in the submission field.'
    ]),
    'A concise, technically accurate 2-paragraph explanation ready for interview recall.',
    'not_started',
    null,
    null,
    'Tomorrow',
    3,
    0,
    null
  );

  // 6. SEED TASKS FOR MUTHU (Vocational / Practical Experience)
  const muthuRoadmapId = 'rdm_muthu_elec';
  const muthuPhases = [
    {
      phaseNumber: 1,
      name: 'Workshop Safety, PPE & Electrical Hazard Protocols',
      durationWeeks: 'Weeks 1-2',
      status: 'in_progress',
      topics: ['Lockout/Tagout (LOTO) Procedures', 'Safe Multimeter Diagnostics', 'Insulated Tool Ratings (1000V)', 'Fire Safety & Earth Leakage (ELCB/RCCB)'],
      description: 'Crucial foundational safety practices to prevent electric shocks and accidents.'
    },
    {
      phaseNumber: 2,
      name: 'Domestic Wiring & Circuit Diagnostics',
      durationWeeks: 'Weeks 3-5',
      status: 'pending',
      topics: ['Single Phase vs Three Phase Supply', 'Distribution Board (DB) Wiring', 'Earthing Resistance Verification', 'Fault Tracing with Continuity Tester'],
      description: 'Master practical house wiring and distribution board troubleshooting.'
    },
    {
      phaseNumber: 3,
      name: 'Motor & Home Appliance Servicing',
      durationWeeks: 'Weeks 6-8',
      status: 'pending',
      topics: ['Induction Motors (Capacitor Run)', 'Washing Machine Drainage & PCB Faults', 'Refrigerator Compressor Relay Testing', 'Microwave Safety High-Voltage Warnings'],
      description: 'Supervised diagnostics for common household electrical appliances.'
    },
    {
      phaseNumber: 4,
      name: 'Government Skill Certification & Apprenticeship',
      durationWeeks: 'Weeks 9-12',
      status: 'pending',
      topics: ['NSDC / ITI Wireman Licensing', 'Apprenticeship Placement with Authorized Service Center', 'Customer Quotation & Service Invoicing'],
      description: 'Acquiring formal license and recognized apprenticeship credentials.'
    }
  ];

  db.prepare(`
    INSERT INTO roadmaps (
      id, user_id, goal_id, title, target_role, current_level,
      phases_json, weekly_plan_json, milestones_json, status, current_phase_index, progress_pct, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    muthuRoadmapId,
    muthuId,
    muthuGoalId,
    'Electrical & Appliance Service Technician Pathway',
    'Certified Electrical & Appliance Technician',
    'Intermediate',
    JSON.stringify(muthuPhases),
    JSON.stringify([
      { day: 'Monday', focus: 'Tool & Safety Inspection', task: 'Check insulation wear on all screwdrivers and test multimeter lead resistance' },
      { day: 'Tuesday', focus: 'Circuit Diagnostics Practice', task: 'Test RCCB trip sensitivity using test button and verify neutral-earth voltage' },
      { day: 'Wednesday', focus: 'Motor Testing', task: 'Measure start and run winding resistance of single-phase ceiling fan/pump motor' },
      { day: 'Thursday', focus: 'Trade Regulation Review', task: 'Review national electrical wiring code rules for domestic wire gauges' },
      { day: 'Friday', focus: 'Apprentice Practical Work', task: 'Assist senior supervisor on residential circuit breaker upgrade' },
      { day: 'Saturday', focus: 'Customer Communication & Estimating', task: 'Practice itemizing repair parts and labor costs clearly to customers' },
      { day: 'Sunday', focus: 'Safety Review', task: 'Inspect fire extinguisher types (CO2 vs Dry Powder) and complete weekly log' }
    ]),
    JSON.stringify([
      { id: 'mm1', title: '100% Workshop Safety Protocol Sign-Off', status: 'completed', date: '2026-09-01' },
      { id: 'mm2', title: 'Multi-Meter Calibration & Testing Badge', status: 'in_progress', date: '2026-09-28' },
      { id: 'mm3', title: 'Domestic DB Board Wiring Practical Exam', status: 'pending', date: '2026-10-30' },
      { id: 'mm4', title: 'Government Recognized Wireman Certification', status: 'pending', date: '2026-12-01' }
    ]),
    'active',
    0,
    30,
    now
  );

  insertTask.run(
    'tsk_muthu_1',
    muthuRoadmapId,
    muthuId,
    'Conduct a 5-Step Electrical Safety & Multimeter Verification',
    'Follow proper Lockout/Tagout steps and verify zero voltage using a calibrated multimeter before touching any electrical terminal.',
    'Safety is the #1 priority in practical electrical trades. Always prove dead before touching wires.',
    'Electrical Safety & Multimeter Handling',
    'Beginner',
    35,
    JSON.stringify([
      'Step 1: Disconnect power at the main MCB/isolator and affix tag.',
      'Step 2: Inspect multimeter leads for cracked insulation or exposed copper.',
      'Step 3: Test multimeter on a known live source to verify the meter is working.',
      'Step 4: Measure voltage across Phase-Neutral, Phase-Earth, and Neutral-Earth on the test equipment.',
      'Step 5: Test the meter on the known live source again to confirm meter did not fail during measurement (Live-Dead-Live rule).'
    ]),
    'Confirmed 0.0V reading following the Live-Dead-Live protocol safely with proper insulated gloves.',
    'completed',
    'Followed the Live-Dead-Live check on the training panel. Meter showed 230V live, then 0V after isolator pulled, then 230V verified on live wall socket.',
    'Outstanding discipline! The Live-Dead-Live sequence is the gold standard used by certified industrial electricians worldwide. This safety habit will protect you throughout your career.',
    'Yesterday',
    1,
    0,
    '2026-09-23T11:00:00Z'
  );

  insertTask.run(
    'tsk_muthu_2',
    muthuRoadmapId,
    muthuId,
    'Diagnose Capacitor Failure in a Washing Machine / Fan Motor',
    'Use multimeter capacitance mode (or discharge bulb test) to inspect whether a motor start capacitor is blown, leaking, or degraded.',
    '80% of motor startup failures in ceiling fans and washing machines are caused by degraded run/start capacitors. Fast, accurate diagnosis saves customers money and earns trust.',
    'Motor Diagnostics & Component Testing',
    'Intermediate',
    40,
    JSON.stringify([
      'Ensure power is fully cut off and safe.',
      'Discharge the capacitor across a 100W light bulb or high-watt resistor. NEVER short with a metal screwdriver directly.',
      'Disconnect at least one terminal from the circuit.',
      'Set multimeter to Capacitance (μF) mode and read the value.',
      'Compare against the rated value on the capacitor label (e.g., 2.5μF ± 5%). If lower by > 10%, mark for replacement.'
    ]),
    'Accurate capacitance reading recorded and clear decision made on whether replacement is required.',
    'not_started',
    null,
    null,
    'Today',
    2,
    1,
    null
  );

  // 7. SEED CHALLENGES
  const insertChallenge = db.prepare(`
    INSERT INTO challenges (
      id, title, description, skill, duration_days, difficulty,
      participants_count, daily_tasks_json, badge_icon, category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertChallenge.run(
    'ch_comm_7',
    '7-Day Communication & Speaking Challenge',
    'Build unstoppable speaking confidence and concise professional articulation in just 7 days.',
    'Professional Communication & Speaking',
    7,
    'Beginner',
    342,
    JSON.stringify([
      { day: 1, title: '60-Second Crisp Self-Introduction', prompt: 'Introduce who you are, your core passion, and what value you bring in under 60 seconds without filler words.' },
      { day: 2, title: 'Explain a Technical Concept to a 10-Year-Old', prompt: 'Pick one concept (like an API, a circuit breaker, or SEO) and explain it using everyday analogies.' },
      { day: 3, title: 'The STAR Method Project Story', prompt: 'Structure your proudest project using Situation, Task, Action, and Result.' },
      { day: 4, title: 'Handling an Uncomfortable HR Question', prompt: 'Answer: "Tell me about a time you made a major mistake and what you learned from it."' },
      { day: 5, title: 'Disagreeing Respectfully in a Team Meeting', prompt: 'Practice wording a respectful counter-proposal when someone suggests an inefficient approach.' },
      { day: 6, title: 'The 2-Minute Solution Pitch', prompt: 'Pitch an improvement to a product or service you use every day in 120 seconds.' },
      { day: 7, title: 'Final Presentation & Self-Evaluation', prompt: 'Record or write your complete career goal story and reflect on your growth over the week.' }
    ]),
    'Mic',
    'Communication'
  );

  insertChallenge.run(
    'ch_java_7',
    '7-Day Java Backend Code Sprint',
    'From zero to building resilient backend services and clean OOP code structure.',
    'Java Core & Architecture',
    7,
    'Intermediate',
    518,
    JSON.stringify([
      { day: 1, title: 'Polymorphism & Interface Design', prompt: 'Build a NotificationService interface with Email, SMS, and Push implementations using Strategy pattern.' },
      { day: 2, title: 'Immutable Value Objects with Java Records', prompt: 'Refactor mutable DTOs into Java 17+ record classes with validation constructors.' },
      { day: 3, title: 'Custom Exception Hierarchy', prompt: 'Create ResourceNotFoundException and InvalidInputException with clean HTTP status mappings.' },
      { day: 4, title: 'High-Performance Streams & Filters', prompt: 'Filter and summarize an in-memory list of 1,000 transactions using Java Streams API.' },
      { day: 5, title: 'Concurrency with CompletableFuture', prompt: 'Execute two simulated asynchronous API calls concurrently and combine their results.' },
      { day: 6, title: 'Unit Testing with JUnit 5 & AssertJ', prompt: 'Write 4 robust unit tests covering happy path and edge-case boundary conditions.' },
      { day: 7, title: 'Mini REST Service Deployment', prompt: 'Wrap your logic into a Spring Boot starter and query it via curl or Postman.' }
    ]),
    'Code',
    'Technical'
  );

  insertChallenge.run(
    'ch_vocational_7',
    '7-Day Practical Trades Safety & Tool Mastery',
    'Master professional workshop hygiene, safety protocols, and precision diagnostic tools.',
    'Vocational & Practical Trades',
    7,
    'Beginner',
    189,
    JSON.stringify([
      { day: 1, title: 'Personal Protective Equipment (PPE) Audit', prompt: 'Audit eye protection, rated insulated gloves, and safety footwear for compliance.' },
      { day: 2, title: 'The Live-Dead-Live Protocol', prompt: 'Document the 3-step verification process before testing any electrical junction.' },
      { day: 3, title: 'Precision Measurement & Tool Calibration', prompt: 'Measure dimensions with vernier calipers or electrical continuity with a zero-checked meter.' },
      { day: 4, title: 'Wire Splicing & Heat Shrink Insulation', prompt: 'Perform a clean Western Union or rat-tail splice and insulate using heat-shrink tubing.' },
      { day: 5, title: 'Hazard Spotting in Residential Installations', prompt: 'Identify 5 common unsafe electrical practices (overloaded sockets, ungrounded metal bodies).' },
      { day: 6, title: 'Customer Communication on Practical Repairs', prompt: 'Explain why a safety component tripped to a customer without causing panic.' },
      { day: 7, title: 'Toolbox Organization & Care Protocol', prompt: 'Clean, lubricate, and organize your trade toolkit according to 5S principles.' }
    ]),
    'Wrench',
    'Vocational'
  );

  insertChallenge.run(
    'ch_resume_7',
    '7-Day Impact Resume & Portfolio Overhaul',
    'Transform weak job descriptions into outcome-driven bullet points that get recruiter callbacks.',
    'Career Preparation',
    7,
    'Beginner',
    420,
    JSON.stringify([
      { day: 1, title: 'De-clutter & Formatting Polish', prompt: 'Remove outdated objectives and replace with a punchy 3-line professional profile summary.' },
      { day: 2, title: 'Convert Tasks to Accomplishments (XYZ Formula)', prompt: 'Rewrite 3 bullet points using "Accomplished [X] as measured by [Y] by doing [Z]".' },
      { day: 3, title: 'Skill Section Categorization', prompt: 'Group skills into Languages, Frameworks, Tools, and Methodologies instead of a flat comma list.' },
      { day: 4, title: 'Showcase Top GitHub / Practical Project', prompt: 'Write a comprehensive README with Problem, Architecture diagram, Tech stack, and Live demo link.' },
      { day: 5, title: 'LinkedIn Profile Synchronization', prompt: 'Ensure your LinkedIn headline communicates your target value proposition clearly.' },
      { day: 6, title: 'Tailoring for ATS (Applicant Tracking Systems)', prompt: 'Compare your resume against a target job description and align relevant keywords.' },
      { day: 7, title: 'Peer Review & Final Polish', prompt: 'Share your updated resume in the Career Solver Community for peer critique.' }
    ]),
    'FileText',
    'Career Prep'
  );

  // Enroll Arun in Communication Challenge (Day 3)
  db.prepare(`
    INSERT INTO challenge_participants (id, user_id, challenge_id, progress_days, completed_days_json, status, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cp_arun_1',
    arunId,
    'ch_comm_7',
    3,
    JSON.stringify([1, 2]),
    'active',
    '2026-09-21T09:00:00Z'
  );

  // Enroll Muthu in Vocational Safety Challenge (Day 2)
  db.prepare(`
    INSERT INTO challenge_participants (id, user_id, challenge_id, progress_days, completed_days_json, status, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cp_muthu_1',
    muthuId,
    'ch_vocational_7',
    2,
    JSON.stringify([1]),
    'active',
    '2026-09-22T08:30:00Z'
  );

  // 8. SEED DEMO MENTORS (Clearly marked "Demo Mentor")
  const insertMentor = db.prepare(`
    INSERT INTO mentors (
      id, name, professional_area, current_title, company_or_field,
      experience_years, skills_json, languages_json, availability, bio,
      mentoring_areas_json, avatar, rating, reviews_count, participation_type, verification_status, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMentor.run(
    'mnt_1',
    'Karthik Sundaram (Demo Mentor)',
    'Software Engineering & Cloud Architecture',
    'Principal Backend Architect',
    'CloudScale Systems (Demo Profile)',
    12,
    JSON.stringify(['Java', 'Spring Boot', 'Distributed Systems', 'PostgreSQL', 'Microservices', 'System Design']),
    JSON.stringify(['English', 'Tamil']),
    '2 hours / week (Weekends)',
    '12+ years designing large-scale high-throughput financial and logistics platforms. Passionate about helping students bridge the gap between textbook coding and production engineering.',
    JSON.stringify(['Placement Interview Preparation', 'System Design Walkthroughs', 'Resume & Code Review']),
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    4.95,
    38,
    'Volunteer / Alumni Mentor',
    'Verified Mentor',
    1
  );

  insertMentor.run(
    'mnt_2',
    'Ramesh Natarajan (Demo Mentor)',
    'Electrical & Industrial Automation',
    'Senior Electrical Master Trainer & Contractor',
    'ElectroCraft Engineering (Demo Profile)',
    16,
    JSON.stringify(['Industrial Wiring', 'HVAC Controls', 'Safety Regulations', 'Appliance Servicing', 'NSDC Standards']),
    JSON.stringify(['Tamil', 'English']),
    '3 hours / week (Evenings)',
    'Master licensed electrician with 16 years in residential, commercial, and solar wiring. Dedicated to helping practical learners get certified, earn fair wages, and build thriving trade businesses.',
    JSON.stringify(['Workshop Safety Standards', 'Apprenticeship Guidance', 'Independent Contractor Setup']),
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    4.90,
    45,
    'Vocational Trainer',
    'Verified Mentor',
    1
  );

  insertMentor.run(
    'mnt_3',
    'Ananya Iyer (Demo Mentor)',
    'Digital Marketing & Brand Strategy',
    'Head of Growth & Performance Marketing',
    'HyperGrowth Agency (Demo Profile)',
    9,
    JSON.stringify(['SEO Strategy', 'Content Marketing', 'Google Analytics 4', 'Customer Acquisition', 'Copywriting']),
    JSON.stringify(['English', 'Hindi']),
    '2 hours / week (Flexible)',
    'Transitioned from non-tech operations into digital marketing 8 years ago. Specializes in helping career switchers rebrand their experience and land impactful marketing roles.',
    JSON.stringify(['Career Switching Strategy', 'Portfolio Creation', 'Campaign Case Studies']),
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    4.88,
    29,
    'Professional Mentor',
    'Verified Mentor',
    1
  );

  insertMentor.run(
    'mnt_4',
    'Dr. Vikram Sen (Demo Mentor)',
    'Higher Studies & Research Pathways',
    'Admissions Advisor & Former Adjunct Faculty',
    'Global Education Initiative (Demo Profile)',
    14,
    JSON.stringify(['Statement of Purpose (SOP)', 'Research Proposals', 'Scholarship Strategy', 'Academic CV']),
    JSON.stringify(['English', 'Bengali']),
    '1 hour / week (Sunday mornings)',
    'Helped over 150 students navigate post-graduate applications, thesis proposals, and research internships. Objective guidance on realistic higher education programs.',
    JSON.stringify(['SOP Review', 'Academic Profile Building', 'Selecting Right Fit Universities']),
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    4.92,
    51,
    'Institutional Partner',
    'Verified Mentor',
    1
  );

  // Seed sample mentor request for Arun
  db.prepare(`
    INSERT INTO mentor_requests (
      id, user_id, mentor_id, message, goals, preferred_time, status, response_notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'mr_arun_1',
    arunId,
    'mnt_1',
    'Hello Karthik sir, I am a final-year student working on Java backend. I would love feedback on my REST API architecture and tips for placement interviews.',
    'Review my GitHub project and give 1 mock technical interview.',
    'Saturday afternoon after 3 PM',
    'accepted',
    'Glad to connect, Arun! Let us schedule 30 minutes this Saturday to review your REST controller DTO design and discuss concurrency questions.',
    '2026-09-22T16:00:00Z'
  );

  // 9. SEED DEMO ORGANIZATIONS & OPPORTUNITIES (Clearly marked "Demo Organization" & "Demo / Sample listing")
  const insertOrg = db.prepare(`
    INSERT INTO organizations (
      id, name, org_type, industry, description, location, website, skills_json, services_json, verification_status, logo, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrg.run(
    'org_1',
    'CloudMatrix Technologies (Demo Organization)',
    'Employer',
    'Information Technology & Software Services',
    'A high-growth enterprise software firm providing enterprise cloud backends and distributed data solutions for global fintech clients.',
    'Chennai / Bengaluru (Hybrid)',
    'https://example.com/cloudmatrix-demo',
    JSON.stringify(['Java', 'Spring Boot', 'SQL', 'Docker', 'AWS']),
    JSON.stringify(['Backend Development', 'Cloud Migration', 'Campus Hiring']),
    'Verified Partner (Demo)',
    'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=150',
    1
  );

  insertOrg.run(
    'org_2',
    'National Skill & Trades Guild (Demo Organization)',
    'Skill Development Org',
    'Vocational Training & Apprenticeships',
    'An accredited skill development collective connecting certified electricians, plumbers, and mechanics with structured paid apprenticeships.',
    'Tamil Nadu (Regional Centres)',
    'https://example.com/trades-guild-demo',
    JSON.stringify(['Electrical Safety', 'Appliance Diagnostics', 'HVAC Basics', 'Customer Service']),
    JSON.stringify(['Apprenticeships', 'Government Trade Certification Support', 'Tool Kits']),
    'Verified Partner (Demo)',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150',
    1
  );

  insertOrg.run(
    'org_3',
    'Pulse Growth Digital (Demo Organization)',
    'Employer',
    'Digital Marketing & Growth Marketing',
    'Performance marketing agency helping modern direct-to-consumer and SaaS brands scale customer acquisition through organic SEO and paid social.',
    'Remote / Hybrid (India)',
    'https://example.com/pulsegrowth-demo',
    JSON.stringify(['SEO', 'Google Ads', 'Content Strategy', 'Data Analytics', 'Copywriting']),
    JSON.stringify(['Digital Growth Strategy', 'Marketing Internships', 'Client Workshops']),
    'Verified Partner (Demo)',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=150',
    1
  );

  const insertOpp = db.prepare(`
    INSERT INTO opportunities (
      id, organization_id, title, opp_type, skills_json, location, duration, description, eligibility, application_info, status, deadline, is_demo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOpp.run(
    'opp_1',
    'org_1',
    'Junior Backend Engineering Intern (Demo / Sample listing)',
    'Internship',
    JSON.stringify(['Java', 'Spring Boot', 'SQL Basics', 'REST APIs', 'Git']),
    'Chennai / Hybrid',
    '6 Months (Stipend Provided)',
    'Work alongside senior backend engineers to build and test scalable RESTful microservices. Includes weekly 1:1 mentorship and practical code reviews.',
    'Final-year college students or recent graduates with good grasp of OOP and basic SQL. Passion for building clean code.',
    'Submit resume and GitHub project link. 2 rounds: Technical code review + cultural conversation.',
    'Open',
    '2026-10-31',
    1
  );

  insertOpp.run(
    'opp_2',
    'org_2',
    'Certified Electrical Service Apprentice (Demo / Sample listing)',
    'Apprenticeship',
    JSON.stringify(['Domestic Wiring', 'Multimeter Testing', 'Safety Protocols', 'Appliance Repair']),
    'Coimbatore & Tiruppur Hubs',
    '1 Year Paid Practical Apprenticeship',
    'Hands-on supervised apprenticeship with certified master electricians. Learn commercial wiring, meter calibration, and customer service with full PPE gear provided.',
    'Open to individuals with practical trade experience or ITI/Vocational coursework. Commitment to workshop safety is mandatory.',
    'Walk-in diagnostic skills assessment at nearest district trade center or apply via Career Solver.',
    'Open',
    '2026-11-15',
    1
  );

  insertOpp.run(
    'opp_3',
    'org_3',
    'Growth & Content Strategy Associate (Demo / Sample listing)',
    'Entry-Level Job',
    JSON.stringify(['Copywriting', 'SEO Basics', 'Social Media Analytics', 'Communication']),
    'Remote (India)',
    'Full-Time Role',
    'Drive organic community engagement, write compelling customer stories, and analyze campaign metrics across multiple client accounts.',
    'Strong English writing skills, empathy for customer journeys, and curiosity for performance data. Career switchers warmly welcomed.',
    'Submit a 300-word breakdown of your favorite marketing campaign and your Career Solver profile.',
    'Open',
    '2026-10-25',
    1
  );

  // 10. SEED COMMUNITY POSTS
  const insertPost = db.prepare(`
    INSERT INTO community_posts (
      id, user_id, author_name, author_role, category, title, content, likes_count, comments_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPost.run(
    'pst_1',
    arunId,
    'Arun Kumar',
    'College Student',
    'Technical Learning',
    'How I finally understood the difference between JPA and Hibernate',
    'For weeks I was confused about whether JPA and Hibernate are the same thing. Then my mentor explained: JPA is the contract (the interface), and Hibernate is the actual worker implementing that contract! Today I wrote my first @Entity and @Repository without relying on boilerplate copy-paste. If you are learning Spring Boot, do not rush into annotations before understanding the SQL it generates under the hood.',
    14,
    3,
    '2026-09-23T10:15:00Z'
  );

  insertPost.run(
    'pst_2',
    muthuId,
    'Muthu Vel',
    'Practical Trades',
    'Vocational Skills',
    'Why the Live-Dead-Live rule saved my safety today',
    'In appliance servicing, you never assume a switch or breaker is off just because someone told you so. Today during a motor inspection, a secondary feed was back-feeding current into the neutral line! If I had not checked with my multimeter following the Live-Dead-Live rule, I would have received a 230V shock. Practical brothers and sisters in trades: never skip your multimeter check, no matter how rushed you are.',
    28,
    6,
    '2026-09-22T18:40:00Z'
  );

  insertPost.run(
    'pst_3',
    priyaId,
    'Priya Sharma',
    'Career Switcher',
    'Career Guidance',
    'Switching careers at 27: Your old experience is NOT wasted',
    'When I decided to switch from Customer Support to Growth Marketing, I felt like I was starting at zero. But when I analyzed my transferable skills on Career Solver, I realized: 3 years of talking to frustrated customers taught me deep empathy, pain-point analysis, and conversion psychology. Marketers spend thousands trying to understand what support reps hear every single day. If you are switching careers, list your transferable skills first!',
    35,
    9,
    '2026-09-21T12:00:00Z'
  );

  // Seed sample comment
  db.prepare(`
    INSERT INTO post_comments (id, post_id, user_id, author_name, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    'cmt_1',
    'pst_1',
    priyaId,
    'Priya Sharma',
    'Great explanation Arun! Having clear mental models makes learning so much faster.',
    '2026-09-23T11:00:00Z'
  );

  // 11. SEED SKILL PASSPORT FOR ARUN
  const insertSkill = db.prepare(`
    INSERT INTO user_skills (id, user_id, skill_name, category, level, source, verified_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertSkill.run('sk_1', arunId, 'Java Object-Oriented Design', 'technical', 'Intermediate', 'completed_activity', '2026-09-15T10:00:00Z');
  insertSkill.run('sk_2', arunId, 'Relational SQL & Schema Design', 'technical', 'Intermediate', 'completed_activity', '2026-09-23T14:30:00Z');
  insertSkill.run('sk_3', arunId, 'HTML & CSS Fundamentals', 'technical', 'Proficient', 'user_reported', null);
  insertSkill.run('sk_4', arunId, 'STAR Method Project Presentation', 'soft', 'Intermediate', 'completed_activity', '2026-09-22T09:00:00Z');
  insertSkill.run('sk_5', arunId, 'Academic Coursework in Data Structures', 'technical', 'Proficient', 'verified', '2026-06-30T00:00:00Z');

  // Muthu Skills
  insertSkill.run('sk_m1', muthuId, 'Electrical Safety & Live-Dead-Live Protocol', 'practical', 'Proficient', 'completed_activity', '2026-09-23T11:00:00Z');
  insertSkill.run('sk_m2', muthuId, 'Digital Multimeter Calibration & Testing', 'practical', 'Intermediate', 'completed_activity', '2026-09-22T08:30:00Z');
  insertSkill.run('sk_m3', muthuId, 'Domestic Appliance Repair Assistance', 'practical', 'Intermediate', 'user_reported', null);
  insertSkill.run('sk_m4', muthuId, 'Customer Service Courtesy & Honesty', 'soft', 'Proficient', 'user_reported', null);

  // 12. SEED NOTIFICATIONS FOR ARUN
  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotif.run('ntf_1', arunId, 'Today Task Ready', 'Build a REST Controller with DTO Validation in Spring Boot is scheduled for today.', '/tasks', 0, now);
  insertNotif.run('ntf_2', arunId, 'Mentor Request Accepted!', 'Karthik Sundaram accepted your mentorship request. Check your schedule.', '/mentors', 0, now);
  insertNotif.run('ntf_3', arunId, 'Communication Challenge Day 3', 'Day 3 STAR method task is waiting for you.', '/challenges', 1, now);

  // Muthu Notifications
  insertNotif.run('ntf_m1', muthuId, 'Apprenticeship Available', 'Apex Power & Industrial posted a Practical Electrical Apprenticeship.', '/organizations', 0, now);
  insertNotif.run('ntf_m2', muthuId, 'Safety Practice Ready', 'High-voltage Live-Dead-Live verification exercise ready.', '/practice', 0, now);

  // Priya Notifications
  insertNotif.run('ntf_p1', priyaId, 'Marketing Action Plan Ready', 'Week 1 Content Strategy and Keyword Gap analysis is waiting.', '/tasks', 0, now);
  insertNotif.run('ntf_p2', priyaId, 'Mentor Suggested', 'Connect with Vandana Rao for career-switch guidance into SEO/Product Marketing.', '/mentors', 0, now);

  // Admin Notifications
  insertNotif.run('ntf_adm1', adminId, 'Moderation Alert', 'Community moderation queue active. Review flagged reports.', '/admin', 0, now);
  insertNotif.run('ntf_adm2', adminId, 'System Operational', 'Gemini AI neural provider & deterministic fallback engine active.', '/admin', 0, now);

  // 13. SEED INITIAL SYSTEM SETTINGS
  const insertSetting = db.prepare(`
    INSERT OR REPLACE INTO system_settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('ai_provider', 'gemini', now);
  insertSetting.run('ai_model', 'gemini-3.8-flash', now);
  insertSetting.run('heuristic_fallback_enabled', 'true', now);
  insertSetting.run('app_initialized', 'true', now);

  console.log('Database seeded successfully with realistic demo personas, roadmaps, tasks, challenges, and mentors!');
}

// Run standalone if executed directly
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
