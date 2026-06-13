const candidateCVs = {
  AT: {
    name: 'Alex Tan Wei Ming',
    meta: 'alex.tan@email.com · +65 9123 4567 · GitHub: github.com/alextanwm · Singapore',
    edu: 'Bachelor of Computer Science — National University of Singapore · 2020–2024 · CGPA 3.8',
    exp: [
      { title: 'Junior Software Engineer — Vortex Systems', meta: 'Jan 2024 – Present · 1.5 yrs · Singapore', bullets: [
        'Built and maintained REST APIs handling 50,000+ daily requests using Node.js and Express, with p95 latency under 120ms.',
        'Led PostgreSQL query optimisation initiative, reducing average query load by 40% through indexing strategy and query refactoring.',
        'Shipped 3 new product features end-to-end (backend + basic React frontend) in a 2-person squad.'
      ]},
      { title: 'Engineering Intern — Shopee', meta: 'Jun 2023 – Dec 2023 · 6 mo · Singapore', bullets: [
        'Contributed to recommendation engine data pipeline using Python & SQL, processing 10M+ daily events.',
        'Automated data quality checks, reducing data incidents by 35% in production.'
      ]}
    ],
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS S3/EC2', 'REST APIs', 'Git', 'Python', 'SQL', 'Docker (basic)'],
    achievements: ['Dean\'s List AY2023/24', 'NUS Hack & Roll 2023 — Top 10 Finalist']
  },
  PS: {
    name: 'Priya Sharma',
    meta: 'priya.sharma@email.com · +60 11-2345 6789 · LinkedIn: linkedin.com/in/priyasharmadev · Kuala Lumpur',
    edu: 'Bachelor of Software Engineering — Universiti Malaya · 2017–2021 · CGPA 3.6',
    exp: [
      { title: 'Full Stack Developer — FinEdge Sdn Bhd', meta: 'Jul 2021 – Present · 3 yrs · Kuala Lumpur', bullets: [
        'Designed and owned the API layer for 5 microservices serving 80,000+ active users across Malaysia and Singapore.',
        'Led a 2-person frontend team building React dashboards for B2B clients, improving load time by 45% through code-splitting.',
        'Served as PostgreSQL schema owner, designing and migrating 3 major schema versions with zero downtime.',
        'Integrated Redis caching layer, reducing DB read load by 60% for high-traffic endpoints.'
      ]}
    ],
    skills: ['React', 'PostgreSQL', 'Node.js', 'TypeScript', 'Docker', 'Redis', 'REST APIs', 'AWS RDS', 'Git'],
    achievements: ['FinEdge Employee of the Quarter Q3 2023', 'Speaker — KL Tech Meetup 2023 (PostgreSQL performance)']
  },
  JC: {
    name: 'James Chen Jia Wei',
    meta: 'james.chen@email.com · +65 8765 4321 · GitHub: github.com/jamescjw · Singapore',
    edu: 'Bachelor of Computer Engineering — Nanyang Technological University · 2012–2016',
    exp: [
      { title: 'Senior Systems Engineer — Grab', meta: 'Jan 2020 – Present · 4 yrs · Singapore', bullets: [
        'Architected a distributed event-sourcing system handling 2M+ daily transactions with 99.98% uptime SLA.',
        'Mentored 3 junior engineers through structured learning plans; 2 promoted to mid-level within 18 months.',
        'Led migration from monolith to microservices for the payments domain, reducing deployment cycle from 2 weeks to daily.',
        'Designed Kafka-based async messaging layer processing 500k events/hour with sub-50ms consumer lag.'
      ]}
    ],
    skills: ['Node.js', 'PostgreSQL', 'System Design', 'Kafka', 'Kubernetes', 'Go', 'AWS', 'Distributed Systems', 'Microservices'],
    achievements: ['Grab Engineering Excellence Award 2022', 'Speaker — Singapore Node.js Meetup 2021 & 2023']
  }
};

// ══ app-portal.js — Portal switching, employer nav, candidate data, candidate nav ══
// ── Portal switcher ──
function switchPortal(mode) {
  document.getElementById('portal-candidate').style.display = mode === 'candidate' ? 'flex' : 'none';
  document.getElementById('portal-employer').style.display  = mode === 'employer'  ? 'flex' : 'none';
  document.getElementById('switch-candidate').classList.toggle('active', mode === 'candidate');
  document.getElementById('switch-employer').classList.toggle('active',  mode === 'employer');
}

let selectedRoleId = null;
let selectedAppliedRoleId = null;

function getEmployerPostedRoles() {
  const session = Auth.getSession();
  if (!session) return [];
  try {
    return JSON.parse(localStorage.getItem('careeros_posted_roles_' + session.userId) || '[]');
  } catch { return []; }
}

function saveEmployerPostedRoles(roles) {
  const session = Auth.getSession();
  if (!session) return;
  localStorage.setItem('careeros_posted_roles_' + session.userId, JSON.stringify(roles));
}

function renderPostedRoles() {
  const listEl = document.getElementById('posted-roles-list');
  if (!listEl) return;
  const roles = getEmployerPostedRoles();
  if (!roles.length) {
    listEl.innerHTML = '<div class="info-note"><i class="ti ti-info-circle"></i>You have not posted any roles yet. Use the form above to post one.</div>';
    return;
  }
  
  const seniorityMap = { junior: 'Junior (0-2 yrs)', mid: 'Mid-level (2-5 yrs)', senior: 'Senior (5+ yrs)' };
  listEl.innerHTML = roles.map(role => {
    const skillsChips = role.skills.map(s => `<span class="job-skill-chip">${escapeHtml(s)}</span>`).join('');
    const dateStr = new Date(role.postedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <div class="widget" style="padding:1.125rem;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px">
          <div style="flex:1">
            <div style="font-weight:700;font-size:14px;color:var(--text)">${escapeHtml(role.title)}</div>
            <div style="font-size:11.5px;color:var(--text2);margin-top:2px">${escapeHtml(role.company)} · ${seniorityMap[role.seniority] || role.seniority} · Posted ${dateStr}</div>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn sm primary" onclick="viewRoleCandidates('${role.id}')"><i class="ti ti-users"></i>View Matches</button>
            <button class="btn sm" onclick="deletePostedRole('${role.id}')" style="color:var(--red);border-color:rgba(226,75,74,0.3)"><i class="ti ti-trash"></i>Delete</button>
          </div>
        </div>
        <div class="job-card-skills" style="margin-top:10px">${skillsChips}</div>
        ${role.desc ? `<div style="font-size:11.5px;color:var(--text3);margin-top:8px;line-height:1.5">${escapeHtml(role.desc)}</div>` : ''}
      </div>
    `;
  }).join('');
}

function viewRoleCandidates(roleId) {
  selectedRoleId = roleId;
  selectedAppliedRoleId = roleId;
  eNav('potential');
}

function deletePostedRole(roleId) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  let roles = getEmployerPostedRoles();
  roles = roles.filter(r => r.id !== roleId);
  saveEmployerPostedRoles(roles);
  
  if (selectedRoleId === roleId) selectedRoleId = null;
  if (selectedAppliedRoleId === roleId) selectedAppliedRoleId = null;
  
  renderPostedRoles();
  updateRoleSelectors();
  showToast('Role deleted successfully.');
}

function runMatch() {
  const titleVal = document.getElementById('e-title').value.trim();
  const companyVal = document.getElementById('e-company').value.trim();
  const seniorityVal = document.getElementById('e-seniority').value;
  const skillsVal = document.getElementById('e-skills').value.trim();
  const descVal = document.getElementById('e-desc').value.trim();

  if (!titleVal || !companyVal || !skillsVal) {
    alert('Please fill in Job Title, Company Type, and Critical Skills.');
    return;
  }

  const btn = document.getElementById('match-btn');
  btn.disabled = true;
  btn.textContent = 'Posting Role…';
  document.getElementById('match-done').style.display = 'none';
  const spinner = document.getElementById('match-running');
  spinner.classList.add('show');
  
  setTimeout(() => {
    const newRole = {
      id: 'role_' + Date.now(),
      title: titleVal,
      company: companyVal,
      seniority: seniorityVal,
      skills: skillsVal.split(',').map(s => s.trim()).filter(Boolean),
      desc: descVal,
      postedAt: new Date().toISOString()
    };
    
    const roles = getEmployerPostedRoles();
    roles.unshift(newRole);
    saveEmployerPostedRoles(roles);

    // Seed mock applications for this new role
    const getAllApps = window.getAllApplications || (() => { 
      try { return JSON.parse(localStorage.getItem('careeros_applications') || '[]'); } catch { return []; } 
    });
    const saveApps = window.saveApplications || ((apps) => { 
      localStorage.setItem('careeros_applications', JSON.stringify(apps)); 
    });
    
    const apps = getAllApps();
    
    // Priya Sharma
    const psSkills = ['React', 'PostgreSQL', 'Node.js', 'TypeScript', 'Docker', 'Redis', 'REST APIs', 'AWS RDS', 'Git'];
    apps.push({
      id: 'app_ps_' + Date.now(),
      jobId: newRole.id,
      jobTitle: newRole.title,
      company: newRole.company,
      candidateUserId: 'PS',
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@email.com',
      fit: calculateFitScoreForCandidate(psSkills, newRole.skills),
      skills: psSkills,
      headline: 'Full Stack Developer · 3 yrs experience',
      appliedAt: new Date(Date.now() - 3600000).toISOString(),
      reason: 'Strong alignment with core technologies (React, Node.js, PostgreSQL). Exp in microservices and team leadership.'
    });

    // James Chen
    const jcSkills = ['Node.js', 'PostgreSQL', 'System Design', 'Kafka', 'Kubernetes', 'Go', 'AWS', 'Distributed Systems', 'Microservices'];
    apps.push({
      id: 'app_jc_' + Date.now(),
      jobId: newRole.id,
      jobTitle: newRole.title,
      company: newRole.company,
      candidateUserId: 'JC',
      candidateName: 'James Chen',
      candidateEmail: 'james.chen@email.com',
      fit: calculateFitScoreForCandidate(jcSkills, newRole.skills),
      skills: jcSkills,
      headline: 'Senior Systems Engineer · 6 yrs experience',
      appliedAt: new Date(Date.now() - 7200000).toISOString(),
      reason: 'Senior backend architect. Extensive distributed systems & microservices background. Solid NTU/Grab profile.'
    });
    
    saveApps(apps);
    
    document.getElementById('e-title').value = '';
    document.getElementById('e-company').value = '';
    document.getElementById('e-seniority').value = 'mid';
    document.getElementById('e-skills').value = '';
    document.getElementById('e-desc').value = '';
    
    const matchesCount = 3 + (cvUploaded && cvData ? 1 : 0);
    document.querySelector('#match-done .success-box .title').textContent = `Role Posted Successfully`;
    document.querySelector('#match-done .success-box .sub').textContent = `${matchesCount} Candidates matched based on CV trajectory fit`;
    
    spinner.classList.remove('show');
    document.getElementById('match-done').style.display = 'block';
    btn.disabled  = false;
    btn.innerHTML = '<i class="ti ti-bolt"></i>Post Role';
    
    selectedRoleId = newRole.id;
    selectedAppliedRoleId = newRole.id;
    
    renderPostedRoles();
    updateRoleSelectors();
  }, 1200);
}

function updateRoleSelectors() {
  const roles = getEmployerPostedRoles();
  
  const potWrap = document.getElementById('potential-role-selector-wrap');
  const potEmpty = document.getElementById('potential-empty-view');
  const potList = document.getElementById('potential-candidates-list');
  const potSel = document.getElementById('potential-role-selector');
  
  const appWrap = document.getElementById('applied-role-selector-wrap');
  const appEmpty = document.getElementById('applied-empty-view');
  const appList = document.getElementById('applied-candidates-list');
  const appEmptyCandidates = document.getElementById('applied-candidates-empty');
  const appSel = document.getElementById('applied-role-selector');
  
  if (!roles.length) {
    if (potWrap) potWrap.style.display = 'none';
    if (potList) potList.style.display = 'none';
    if (potEmpty) potEmpty.style.display = 'block';
    
    if (appWrap) appWrap.style.display = 'none';
    if (appList) appList.style.display = 'none';
    if (appEmptyCandidates) appEmptyCandidates.style.display = 'none';
    if (appEmpty) appEmpty.style.display = 'block';
    
    selectedRoleId = null;
    selectedAppliedRoleId = null;
    return;
  }
  
  if (potWrap) potWrap.style.display = 'block';
  if (potList) potList.style.display = 'block';
  if (potEmpty) potEmpty.style.display = 'none';
  
  if (appWrap) appWrap.style.display = 'block';
  if (appList) appList.style.display = 'block';
  if (appEmpty) appEmpty.style.display = 'none';
  
  if (!selectedRoleId || !roles.some(r => r.id === selectedRoleId)) {
    selectedRoleId = roles[0].id;
  }
  if (!selectedAppliedRoleId || !roles.some(r => r.id === selectedAppliedRoleId)) {
    selectedAppliedRoleId = roles[0].id;
  }
  
  const buildSelectorHtml = (selectedId, onclickFnName) => {
    return roles.map(role => {
      const activeClass = role.id === selectedId ? 'active' : '';
      return `<button class="upskill-field-btn ${activeClass}" onclick="${onclickFnName}('${role.id}')">
        <i class="ti ti-briefcase"></i><span>${escapeHtml(role.title)}</span>
      </button>`;
    }).join('');
  };
  
  if (potSel) potSel.innerHTML = buildSelectorHtml(selectedRoleId, 'selectPotentialRole');
  if (appSel) appSel.innerHTML = buildSelectorHtml(selectedAppliedRoleId, 'selectAppliedRole');
}

function selectPotentialRole(roleId) {
  selectedRoleId = roleId;
  updateRoleSelectors();
  renderPotentialCandidates();
}

function selectAppliedRole(roleId) {
  selectedAppliedRoleId = roleId;
  updateRoleSelectors();
  renderAppliedCandidates();
}

function getPotentialCandidateProfiles(role) {
  const profiles = [];
  
  profiles.push({
    id: 'AT',
    name: 'Alex Tan Wei Ming',
    headline: 'Junior Software Engineer · NUS Computer Science',
    skills: ['React', 'Node.js', 'PostgreSQL', 'AWS S3/EC2', 'REST APIs', 'Git', 'Python', 'SQL', 'Docker (basic)'],
    expSummary: 'Junior SWE – Vortex Systems · 1.5 yrs · Built REST APIs handling 50k daily requests. Led PostgreSQL query optimisation (–40% load).',
    trajectory: 'Heading toward Mid-level SWE / Tech Lead in ~2–3 yrs — NUS grad, 1.5 yrs at Vortex Systems, Shopee-tier internship.',
    scores: { tech: 82, achievements: 88, leadership: 48 },
    cvData: candidateCVs.AT
  });
  
  profiles.push({
    id: 'PS',
    name: 'Priya Sharma',
    headline: 'Full Stack Developer · 3 yrs experience',
    skills: ['React', 'PostgreSQL', 'Node.js', 'TypeScript', 'Docker', 'Redis', 'REST APIs', 'AWS RDS', 'Git'],
    expSummary: 'Full Stack Dev – FinEdge · 3 yrs · Designed API layer for 5 microservices. Led B2B frontend dashboard team.',
    trajectory: 'Heading toward Senior Full Stack / Engineering Lead in ~1–2 yrs — 3 yrs at FinEdge, schema ownership + team lead signals.',
    scores: { tech: 85, achievements: 79, leadership: 65 },
    cvData: candidateCVs.PS
  });
  
  profiles.push({
    id: 'JC',
    name: 'James Chen',
    headline: 'Senior Systems Engineer · 6 yrs experience',
    skills: ['Node.js', 'PostgreSQL', 'System Design', 'Kafka', 'Kubernetes', 'Go', 'AWS', 'Distributed Systems', 'Microservices'],
    expSummary: 'Senior Systems Engineer – Grab · 4 yrs · Architected a distributed event-sourcing system. Monitored Go listings backend.',
    trajectory: 'Heading toward Staff Engineer / Engineering Manager in ~1 yr — Grab-level architecture ownership, NTU grad.',
    scores: { tech: 91, achievements: 85, leadership: 78 },
    cvData: candidateCVs.JC
  });
  
  const currentCandidate = Auth.getCurrentUser();
  const session = Auth.getSession();
  if (cvUploaded && cvData && currentCandidate && session && session.role !== 'employer') {
    profiles.push({
      id: 'ME_' + currentCandidate.id,
      name: cvData.name || currentCandidate.name,
      headline: cvData.summary ? cvData.summary.slice(0, 80) + '…' : (cvData.education || 'Candidate Profile'),
      skills: cvData.skills || [],
      expSummary: cvData.experiences?.length 
        ? `${cvData.experiences[0].title} · ${cvData.experiences[0].bullets[0]}`
        : 'Experiences parsed from uploaded CV.',
      trajectory: timelineData?.whyThisPath || 'Heading toward senior roles based on current trajectory.',
      scores: { tech: 75, achievements: 70, leadership: 55 },
      cvData: cvData
    });
  }
  
  return profiles;
}

function calculateFitScoreForCandidate(candSkills, roleSkills) {
  if (!roleSkills || !roleSkills.length) return 75;
  const candSkillsLower = candSkills.map(s => s.toLowerCase());
  let matches = 0;
  roleSkills.forEach(rs => {
    const rsL = rs.toLowerCase();
    if (candSkillsLower.some(cs => cs.includes(rsL) || rsL.includes(cs))) {
      matches++;
    }
  });
  const pct = Math.round((matches / roleSkills.length) * 45) + 50;
  return Math.min(98, Math.max(40, pct));
}

function renderPotentialCandidates() {
  const container = document.getElementById('potential-candidates-list');
  if (!container) return;
  
  const roles = getEmployerPostedRoles();
  if (!roles.length) {
    container.innerHTML = '';
    return;
  }
  
  const role = roles.find(r => r.id === selectedRoleId) || roles[0];
  const allProfiles = getPotentialCandidateProfiles(role);
  
  const apps = getAllApplications();
  const appliedUserIds = apps.filter(a => a.jobId === role.id).map(a => a.candidateUserId);
  const potentialProfiles = allProfiles.filter(p => {
    const parsedId = p.id.startsWith('ME_') ? p.id.replace('ME_', '') : p.id;
    return !appliedUserIds.includes(p.id) && !appliedUserIds.includes(parsedId);
  });
  
  if (!potentialProfiles.length) {
    container.innerHTML = '<div class="empty-state"><i class="ti ti-users"></i><p>No new potential candidates found for this role.</p></div>';
    return;
  }
  
  potentialProfiles.forEach(p => {
    p.computedFit = calculateFitScoreForCandidate(p.skills, role.skills);
  });
  potentialProfiles.sort((a, b) => b.computedFit - a.computedFit);
  
  const interests = getRecruitingInterests();
  const hiringStatuses = getHiringStatuses();
  
  container.innerHTML = potentialProfiles.map(cand => {
    const initials = cand.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const fitClass = cand.computedFit >= 85 ? 'fit-high' : cand.computedFit >= 70 ? 'fit-med' : 'fit-low';
    
    const hired = hiringStatuses.some(h => {
      const cleanH = h.candId.startsWith('ME_') ? h.candId.slice(3) : h.candId;
      const cleanC = cand.id.startsWith('ME_') ? cand.id.slice(3) : cand.id;
      return cleanH === cleanC && h.roleId === role.id && h.status === 'interview_invited';
    });
    
    const skillChips = cand.skills.map(s => {
      const isMatch = role.skills.some(rs => rs.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(s.toLowerCase()));
      return `<span class="${isMatch ? 'skill-match' : 'skill-neutral'}">${escapeHtml(s)}</span>`;
    }).join('');
    
    const hiredBadge = hired ? '<span class="conf-badge conf-high" style="margin-left:8px"><i class="ti ti-calendar-event"></i> Interview Invited</span>' : '';
    const hireBtnText = hired ? '<i class="ti ti-check"></i>Invitation Sent' : '<i class="ti ti-calendar-event"></i>Invite to Interview';
    
    return `
      <div class="cand-cv-card" style="margin-bottom:1.25rem">
        <div class="cand-cv-header">
          <div class="cand-avatar">${initials}</div>
          <div style="flex:1">
            <div class="cand-name" style="display:flex;align-items:center">${escapeHtml(cand.name)} ${hiredBadge}</div>
            <div class="cand-headline">${escapeHtml(cand.headline)}</div>
          </div>
          <div class="cand-fit-badge ${fitClass}">
            <div class="cand-fit-num">${cand.computedFit}</div>
            <div class="cand-fit-label">CV fit</div>
          </div>
        </div>
        <div class="cand-cv-body">
          <div class="cand-cv-section">
            <div class="cand-cv-section-title">Skills</div>
            <div class="cand-skills-row">${skillChips}</div>
          </div>
          <div class="cand-cv-section">
            <div class="cand-cv-section-title">Experience Summary</div>
            <div class="cand-exp-line">${escapeHtml(cand.expSummary)}</div>
          </div>
        </div>
        <div class="cand-cv-footer">
          <div class="cand-cv-footer-top" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div class="match-reason" style="flex:1"><strong>Why matched:</strong> Fits critical skills. Trajectory matches target path.</div>
            <div style="display:flex;gap:6px">
              <button class="btn sm" onclick="showCandidateDetailsCV('${cand.id}')"><i class="ti ti-file-text"></i>Request CV</button>
              <button class="btn sm primary" onclick="interestedInHiring('${cand.id}', '${role.id}')" ${hired ? 'disabled' : ''}>${hireBtnText}</button>
            </div>
          </div>
          <div class="trajectory-signal" style="margin-top:10px">
            <i class="ti ti-trending-up"></i><strong>Trajectory:</strong> ${escapeHtml(cand.trajectory)}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showCandidateDetailsCV(candId) {
  let data = null;
  if (candId.startsWith('ME_')) {
    data = {
      name: cvData.name || 'Candidate Profile',
      meta: cvData.email || 'Email in profile',
      edu: cvData.education || 'Education details',
      exp: cvData.experiences || [],
      skills: cvData.skills || [],
      achievements: ['CV parsed successfully']
    };
  } else {
    data = getPotentialCandidateProfiles().find(p => p.id === candId)?.cvData || null;
  }
  
  if (!data) return;
  document.getElementById('cand-modal-name').textContent = data.name.split(' ').slice(0, 2).join(' ');

  let html = `<div class="cv-doc">
    <div class="cv-doc-name">${escapeHtml(data.name)}</div>
    <div class="cv-doc-meta">${escapeHtml(data.meta || '')}</div>
    <hr class="cv-doc-hr">
    <div class="cv-doc-section"><div class="cv-doc-section-title">Education</div>
      <div class="cv-doc-job-title" style="font-size:12px">${escapeHtml(data.edu || data.education || '')}</div></div>
    <div class="cv-doc-section"><div class="cv-doc-section-title">Experience</div>`;

  const experiences = data.exp || data.experiences || [];
  experiences.forEach(e => {
    html += `<div style="margin-bottom:12px"><div class="cv-doc-job-title">${escapeHtml(e.title)}</div>
      <div class="cv-doc-job-meta">${escapeHtml(e.meta || '')}</div>`;
    const bullets = e.bullets || [];
    bullets.forEach(b => { html += `<div class="cv-doc-bullet">${escapeHtml(b)}</div>`; });
    html += `</div>`;
  });

  html += `</div>`;
  if (data.achievements?.length) {
    html += `<div class="cv-doc-section"><div class="cv-doc-section-title">Achievements</div>`;
    data.achievements.forEach(a => { html += `<div class="cv-doc-bullet">${escapeHtml(a)}</div>`; });
    html += `</div>`;
  }
  html += `<div class="cv-doc-section"><div class="cv-doc-section-title">Skills</div>
    <div class="cv-doc-skills-wrap">${data.skills.map(s => `<span class="cv-doc-skill">${escapeHtml(s)}</span>`).join('')}</div></div></div>`;

  document.getElementById('cand-modal-body').innerHTML = html;
  document.getElementById('cand-cv-modal').classList.add('open');
}

function showCandidateCV(initials) {
  showCandidateDetailsCV(initials);
}

function getRecruitingInterests() {
  try {
    return JSON.parse(localStorage.getItem('careeros_recruiting_interests') || '[]');
  } catch { return []; }
}

function saveRecruitingInterests(interests) {
  localStorage.setItem('careeros_recruiting_interests', JSON.stringify(interests));
}

function getHiringStatuses() {
  try {
    return JSON.parse(localStorage.getItem('careeros_hiring_status') || '[]');
  } catch { return []; }
}

function saveHiringStatuses(statuses) {
  localStorage.setItem('careeros_hiring_status', JSON.stringify(statuses));
}

function interestedInHiring(candId, roleId) {
  const roles = getEmployerPostedRoles();
  const role = roles.find(r => r.id === roleId);
  if (!role) return;
  
  const cand = profiles.find(p => {
    const cleanP = p.id.startsWith('ME_') ? p.id.slice(3) : p.id;
    const cleanC = candId.startsWith('ME_') ? candId.slice(3) : candId;
    return cleanP === cleanC;
  });
  if (!cand) return;
  
  const statuses = getHiringStatuses();
  const key = `${candId}__${roleId}`;
  
  const alreadyHired = statuses.some(s => {
    const cleanS = s.candId.startsWith('ME_') ? s.candId.slice(3) : s.candId;
    const cleanC = candId.startsWith('ME_') ? candId.slice(3) : candId;
    return cleanS === cleanC && s.roleId === roleId && s.status === 'interview_invited';
  });
  if (alreadyHired) {
    showToast(`Already invited to interview.`);
    return;
  }
  
  statuses.push({
    key: key,
    candId: candId,
    roleId: roleId,
    status: 'interview_invited',
    updatedAt: new Date().toISOString()
  });
  saveHiringStatuses(statuses);
  
  // Also create a corresponding entry in recruiting interests so the candidate receives it
  const interests = getRecruitingInterests();
  const alreadyInvited = interests.some(i => {
    const cleanI = i.candidateUserId.startsWith('ME_') ? i.candidateUserId.slice(3) : i.candidateUserId;
    const cleanC = candId.startsWith('ME_') ? candId.slice(3) : candId;
    return cleanI === cleanC && i.roleId === roleId;
  });
  if (!alreadyInvited) {
    interests.push({
      id: 'invite_' + Date.now(),
      roleId: role.id,
      roleTitle: role.title,
      company: role.company,
      candidateUserId: candId,
      candidateName: cand.name,
      status: 'invited',
      invitedAt: new Date().toISOString()
    });
    saveRecruitingInterests(interests);
  }
  
  showToast(`Interview invitation sent to ${cand.name}!`);
  
  renderPotentialCandidates();
  renderAppliedCandidates();
}

function closeCandModal() {
  document.getElementById('cand-cv-modal').classList.remove('open');
}

// ── Employer nav ──
function eNav(id) {
  document.querySelectorAll('#portal-employer .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#portal-employer .nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('epage-' + id);
  if (page) page.classList.add('active');
  const navEl = document.getElementById('enav-' + id);
  if (navEl) navEl.classList.add('active');
  
  if (id === 'post') {
    renderPostedRoles();
    document.getElementById('match-done').style.display = 'none';
  }
  if (id === 'potential') {
    updateRoleSelectors();
    renderPotentialCandidates();
  }
  if (id === 'applied') {
    updateRoleSelectors();
    renderAppliedCandidates();
  }
}

// ── Candidate nav ──
function cNav(id) {
  if (!cvUploaded && ['timeline', 'enhance'].includes(id)) {
    const z = document.getElementById('upload-paste-panel');
    if (z) {
      z.style.outline = '2px solid var(--red)';
      setTimeout(() => { z.style.outline = ''; }, 1400);
    }
    cNav('upload');
    return;
  }
  document.querySelectorAll('#portal-candidate .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#portal-candidate .nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('cpage-' + id);
  if (!page) return;
  page.classList.add('active');
  const navEl = document.getElementById('cnav-' + id);
  if (navEl) navEl.classList.add('active');

  if (id === 'jobs') filterJobs();
  if (id === 'saved') {
    renderSavedJobs();
    if (typeof renderPotentialJobs !== 'undefined') renderPotentialJobs();
  }
  if (id === 'timeline' && cvUploaded && !timelineData) generateTimeline();
  if (id === 'enhance') initEnhancePage();
  if (id === 'upskill') initUpskillPage();
  if (id === 'profile') renderProfile();
  if (id === 'settings') {
    document.getElementById('api-key-input').value = AIService.getApiKey();
    updateApiKeyStatus();
  }
}
