// ══ app-portal.js — Portal switching, employer nav, candidate data, candidate nav ══
// ── Portal switcher ──
function switchPortal(mode) {
  document.getElementById('portal-candidate').style.display = mode === 'candidate' ? 'flex' : 'none';
  document.getElementById('portal-employer').style.display  = mode === 'employer'  ? 'flex' : 'none';
  document.getElementById('switch-candidate').classList.toggle('active', mode === 'candidate');
  document.getElementById('switch-employer').classList.toggle('active',  mode === 'employer');
}

// ── Employer nav ──
function eNav(id) {
  document.querySelectorAll('#portal-employer .page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#portal-employer .nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('epage-' + id).classList.add('active');
  document.getElementById('enav-'  + id).classList.add('active');
  if (id === 'applied') renderAppliedCandidates();
}

function runMatch() {
  const btn = document.getElementById('match-btn');
  btn.disabled = true;
  btn.textContent = 'Scanning…';
  document.getElementById('match-done').style.display = 'none';
  const spinner = document.getElementById('match-running');
  spinner.classList.add('show');
  setTimeout(() => {
    spinner.classList.remove('show');
    document.getElementById('match-done').style.display = 'block';
    btn.disabled  = false;
    btn.innerHTML = '<i class="ti ti-bolt"></i>Find Matching CVs';
  }, 1900);
}

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
      ]},
      { title: 'Backend Engineer — Carousell', meta: 'Aug 2016 – Dec 2019 · 3+ yrs · Singapore', bullets: [
        'Built search ranking service in Go, improving P95 latency from 800ms to 120ms.',
        'Owned PostgreSQL schema for the listings domain (50M+ records), implemented sharding strategy.'
      ]}
    ],
    skills: ['Node.js', 'PostgreSQL', 'System Design', 'Kafka', 'Kubernetes', 'Go', 'AWS', 'Distributed Systems', 'Microservices'],
    achievements: ['Grab Engineering Excellence Award 2022', 'Speaker — Singapore Node.js Meetup 2021 & 2023']
  }
};

function showCandidateCV(initials) {
  const data = candidateCVs[initials];
  if (!data) return;
  document.getElementById('cand-modal-name').textContent = data.name.split(' ').slice(0, 2).join(' ');

  let html = `<div class="cv-doc">
    <div class="cv-doc-name">${data.name}</div>
    <div class="cv-doc-meta">${data.meta}</div>
    <hr class="cv-doc-hr">
    <div class="cv-doc-section"><div class="cv-doc-section-title">Education</div>
      <div class="cv-doc-job-title" style="font-size:12px">${data.edu}</div></div>
    <div class="cv-doc-section"><div class="cv-doc-section-title">Experience</div>`;

  data.exp.forEach(e => {
    html += `<div style="margin-bottom:12px"><div class="cv-doc-job-title">${e.title}</div>
      <div class="cv-doc-job-meta">${e.meta}</div>`;
    e.bullets.forEach(b => { html += `<div class="cv-doc-bullet">${b}</div>`; });
    html += `</div>`;
  });

  html += `</div><div class="cv-doc-section"><div class="cv-doc-section-title">Achievements</div>`;
  data.achievements.forEach(a => { html += `<div class="cv-doc-bullet">${a}</div>`; });
  html += `</div><div class="cv-doc-section"><div class="cv-doc-section-title">Skills</div>
    <div class="cv-doc-skills-wrap">${data.skills.map(s => `<span class="cv-doc-skill">${s}</span>`).join('')}</div></div></div>`;

  document.getElementById('cand-modal-body').innerHTML = html;
  document.getElementById('cand-cv-modal').classList.add('open');
}

function closeCandModal() {
  document.getElementById('cand-cv-modal').classList.remove('open');
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
  if (id === 'saved') renderSavedJobs();
  if (id === 'timeline' && cvUploaded && !timelineData) generateTimeline();
  if (id === 'enhance') initEnhancePage();
  if (id === 'upskill') initUpskillPage();
  if (id === 'settings') {
    document.getElementById('api-key-input').value = AIService.getApiKey();
    updateApiKeyStatus();
  }
}

