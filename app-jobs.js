// ══ app-jobs.js — Jobs, applications, employer candidates, field fit ══
// ── Jobs & applications ──
const APPLICATIONS_KEY = 'careeros_applications';

function getSavedJobIds() {
  const session = Auth.getSession();
  if (!session) return [];
  try {
    return JSON.parse(localStorage.getItem('careeros_saved_' + session.userId) || '[]');
  } catch { return []; }
}

function getAppliedJobIds() {
  const session = Auth.getSession();
  if (!session) return [];
  try {
    return JSON.parse(localStorage.getItem('careeros_applied_' + session.userId) || '[]');
  } catch { return []; }
}

function getAllApplications() {
  try {
    return JSON.parse(localStorage.getItem(APPLICATIONS_KEY) || '[]');
  } catch { return []; }
}

function saveApplications(apps) {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
}

function jobCardOpts() {
  const saved = getSavedJobIds();
  const applied = getAppliedJobIds();
  return { mode: 'list', saved, applied };
}

function filterJobs() {
  const query = document.getElementById('job-search')?.value || '';
  const location = document.getElementById('job-filter-location')?.value || '';
  const type = document.getElementById('job-filter-type')?.value || '';
  const results = searchJobs(query, { location, type });
  const saved = getSavedJobIds();
  const applied = getAppliedJobIds();
  const el = document.getElementById('job-list');
  if (!el) return;
  if (!results.length) {
    el.innerHTML = '<div class="empty-state"><i class="ti ti-search-off"></i><p>No jobs match your search. Try different keywords.</p></div>';
  } else {
    el.innerHTML = results.map(j => renderJobCard(j, {
      mode: 'list',
      saved: saved.includes(j.id),
      applied: applied.includes(j.id)
    })).join('');
  }
  const countEl = document.getElementById('job-results-count');
  if (countEl) countEl.textContent = `${results.length} job${results.length !== 1 ? 's' : ''} found`;
}

function saveJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  const session = Auth.getSession();
  if (!session) return;
  const key = 'careeros_saved_' + session.userId;
  const saved = getSavedJobIds();
  if (!saved.includes(jobId)) saved.push(jobId);
  localStorage.setItem(key, JSON.stringify(saved));
  updateJobBadges();
  filterJobs();
  showToast(`Saved "${job.title}" at ${job.company}`);
}

function unsaveJob(jobId) {
  const session = Auth.getSession();
  if (!session) return;
  const saved = getSavedJobIds().filter(id => id !== jobId);
  localStorage.setItem('careeros_saved_' + session.userId, JSON.stringify(saved));
  updateJobBadges();
  renderSavedJobs();
  filterJobs();
}

function applyToJob(jobId) {
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return;
  const session = Auth.getSession();
  if (!session) return;

  const applied = getAppliedJobIds();
  if (applied.includes(jobId)) {
    showToast('You have already applied to this role.');
    return;
  }

  const user = Auth.getCurrentUser();
  const skills = cvData?.skills || ['Python', 'SQL', 'Data analysis'];
  const headline = cvData?.summary
    ? cvData.summary.slice(0, 80) + (cvData.summary.length > 80 ? '…' : '')
    : (cvData?.education ? String(cvData.education).slice(0, 60) : 'Early-career candidate');

  const application = {
    id: crypto.randomUUID(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    candidateUserId: session.userId,
    candidateName: user?.name || session.name,
    candidateEmail: user?.email || session.email,
    fit: job.fit,
    skills,
    headline,
    appliedAt: new Date().toISOString(),
    reason: buildApplyReason(job, skills)
  };

  const apps = getAllApplications();
  apps.push(application);
  saveApplications(apps);

  applied.push(jobId);
  localStorage.setItem('careeros_applied_' + session.userId, JSON.stringify(applied));

  const saved = getSavedJobIds();
  if (!saved.includes(jobId)) {
    saved.push(jobId);
    localStorage.setItem('careeros_saved_' + session.userId, JSON.stringify(saved));
  }

  updateJobBadges();
  filterJobs();
  renderSavedJobs();
  showToast(`Applied to "${job.title}" at ${job.company}! Employer can now see your profile.`);
}

function buildApplyReason(job, skills) {
  const overlap = job.skills.filter(s =>
    skills.some(cs => cs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(cs.toLowerCase()))
  );
  const n = overlap.length || Math.min(2, skills.length);
  return `${n}/${job.skills.length} required skills signalled on CV (${overlap.slice(0, 3).join(', ') || skills.slice(0, 2).join(', ')}). Fit score reflects CV pattern vs successful hires in this role.`;
}

function renderSavedJobs() {
  const savedIds = getSavedJobIds();
  const applied = getAppliedJobIds();
  const empty = document.getElementById('saved-jobs-empty');
  const list = document.getElementById('saved-jobs-list');
  if (!list) return;

  if (!savedIds.length) {
    if (empty) empty.style.display = 'block';
    list.innerHTML = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  const jobs = savedIds.map(id => JOBS.find(j => j.id === id)).filter(Boolean);
  list.innerHTML = jobs.map(j => renderJobCard(j, {
    mode: 'saved',
    saved: true,
    applied: applied.includes(j.id)
  })).join('');
}

function renderAppliedCandidates() {
  const container = document.getElementById('applied-candidates-list');
  const empty = document.getElementById('applied-candidates-empty');
  if (!container) return;

  const apps = getAllApplications().sort((a, b) => b.fit - a.fit);

  updateJobBadges();

  if (!apps.length) {
    if (empty) empty.style.display = 'block';
    container.innerHTML = '';
    return;
  }

  if (empty) empty.style.display = 'none';
  container.innerHTML = apps.map((app, i) => {
    const initials = app.candidateName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const fitClass = app.fit >= 85 ? '' : app.fit >= 70 ? 'amber' : 'blue';
    const rankLabel = i === 0 ? 'Top match' : `#${i + 1}`;
    const appliedDate = new Date(app.appliedAt).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
    const skillChips = (app.skills || []).slice(0, 6).map(s => {
      const matched = JOBS.find(j => j.id === app.jobId)?.skills.some(js =>
        s.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(s.toLowerCase())
      );
      return `<span class="${matched ? 'skill-match' : 'skill-neutral'}">${escapeHtml(s)}</span>`;
    }).join('');

    return `
      <div class="cand-cv-card applied-cand">
        <div class="cand-cv-header">
          <div class="cand-rank-badge">${rankLabel}</div>
          <div class="cand-avatar">${initials}</div>
          <div>
            <div class="cand-name">${escapeHtml(app.candidateName)}</div>
            <div class="cand-headline">Applied for <strong>${escapeHtml(app.jobTitle)}</strong> · ${escapeHtml(app.company)}</div>
            <div class="cand-applied-date"><i class="ti ti-calendar"></i> Applied ${appliedDate}</div>
          </div>
          <div class="cand-fit-badge">
            <div class="cand-fit-num">${app.fit}</div>
            <div class="cand-fit-label">Role fit</div>
          </div>
        </div>
        <div class="cand-cv-body">
          <div class="cand-cv-section">
            <div class="cand-cv-section-title">Profile</div>
            <div class="cand-exp-line">${escapeHtml(app.headline)}</div>
          </div>
          <div class="cand-cv-section">
            <div class="cand-cv-section-title">Skills</div>
            <div class="cand-skills-row">${skillChips}</div>
          </div>
          <div class="cand-cv-section">
            <div class="cand-cv-section-title">Fit breakdown</div>
            <div class="cand-score-bars">
              <div class="cand-score-row"><div class="cand-score-lbl">Role fit</div><div class="cand-bar-track"><div class="cand-bar-fill ${fitClass}" style="width:${app.fit}%"></div></div><div class="cand-score-num">${app.fit}</div></div>
            </div>
          </div>
        </div>
        <div class="cand-cv-footer">
          <div class="match-reason"><strong>Why this rank:</strong> ${escapeHtml(app.reason)}</div>
          <button class="btn sm primary" onclick="showApplicantCV('${app.id}')"><i class="ti ti-file-text"></i>View application</button>
        </div>
      </div>`;
  }).join('');
}

function showApplicantCV(appId) {
  const app = getAllApplications().find(a => a.id === appId);
  if (!app) return;
  document.getElementById('cand-modal-name').textContent = app.candidateName;

  const job = JOBS.find(j => j.id === app.jobId);
  let html = `<div class="cv-doc">
    <div class="cv-doc-name">${escapeHtml(app.candidateName)}</div>
    <div class="cv-doc-meta">${escapeHtml(app.candidateEmail)} · Applied ${new Date(app.appliedAt).toLocaleDateString()}</div>
    <hr class="cv-doc-hr">
    <div class="cv-doc-section">
      <div class="cv-doc-section-title">Application</div>
      <div class="cv-doc-job-title">${escapeHtml(app.jobTitle)} — ${escapeHtml(app.company)}</div>
      <div class="cv-doc-job-meta">Role fit: ${app.fit}%</div>
    </div>
    <div class="cv-doc-section">
      <div class="cv-doc-section-title">Profile summary</div>
      <div class="cv-doc-bullet">${escapeHtml(app.headline)}</div>
    </div>
    <div class="cv-doc-section">
      <div class="cv-doc-section-title">Skills</div>
      <div class="cv-doc-skills-wrap">${(app.skills || []).map(s => `<span class="cv-doc-skill">${escapeHtml(s)}</span>`).join('')}</div>
    </div>`;

  if (job) {
    html += `<div class="cv-doc-section">
      <div class="cv-doc-section-title">Role requirements</div>
      <div class="cv-doc-skills-wrap">${job.skills.map(s => `<span class="cv-doc-skill">${escapeHtml(s)}</span>`).join('')}</div>
    </div>`;
  }

  html += `<div class="info-note" style="margin-top:12px"><i class="ti ti-info-circle"></i>${escapeHtml(app.reason)}</div></div>`;
  document.getElementById('cand-modal-body').innerHTML = html;
  document.getElementById('cand-cv-modal').classList.add('open');
}

function updateJobBadges() {
  const savedBadge = document.getElementById('saved-jobs-badge');
  const appliedBadge = document.getElementById('applied-cand-badge');
  const savedCount = getSavedJobIds().length;
  const appliedCount = getAllApplications().length;

  if (savedBadge) {
    savedBadge.textContent = savedCount;
    savedBadge.style.display = savedCount ? 'inline-flex' : 'none';
  }
  if (appliedBadge) {
    appliedBadge.textContent = appliedCount;
    appliedBadge.style.display = appliedCount ? 'inline-flex' : 'none';
  }
}

function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── CV Preview modal ──
function showCVPreview() {
  const body = document.getElementById('cv-modal-body');
  const data = cvData || {};
  const enhanced = enhancedData?.enhanced || [];

  let expHtml = '';
  enhanced.forEach(block => {
    expHtml += `<div class="cv-doc-job-title">${block.title}</div>`;
    block.enhanced.forEach(b => {
      expHtml += `<div class="cv-doc-bullet" style="color:var(--green-deep);font-weight:500">${escapeHtml(b)}</div>`;
    });
  });

  body.innerHTML = `<div class="cv-doc">
    <div class="cv-doc-name">${escapeHtml(data.name || 'Your Name')}</div>
    <div class="cv-doc-meta">${escapeHtml(data.email || '')}</div>
    <hr class="cv-doc-hr">
    <div class="cv-doc-section"><div class="cv-doc-section-title">Education</div><div class="cv-doc-job-meta">${escapeHtml(data.education || '')}</div></div>
    <div class="cv-doc-section"><div class="cv-doc-section-title">Experience</div>${expHtml || '<div class="cv-doc-bullet">No enhanced content yet.</div>'}</div>
    <div class="cv-doc-section"><div class="cv-doc-section-title">Skills</div><div class="cv-doc-skills-wrap">${(data.skills || []).map(s => `<span class="cv-doc-skill">${escapeHtml(s)}</span>`).join('')}</div></div>
    <div style="font-size:10px;color:var(--green-dark);margin-top:8px;font-style:italic">✦ Enhanced by Career OS</div>
  </div>`;
  document.getElementById('cv-modal').classList.add('open');
}

function closeCVModal() {
  document.getElementById('cv-modal').classList.remove('open');
}

function downloadCV() {
  const text = document.getElementById('cv-modal-body')?.innerText || '';
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'enhanced-cv.txt';
  a.click();
}

function copyText(btn, text) {
  navigator.clipboard.writeText(text).catch(() => {});
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="ti ti-check"></i>Copied!';
  btn.style.color = 'var(--green-dark)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1800);
}

// ── Field Fit (kept from original) ──
const fields = [
  { name: 'Data Science', score: 88, fillClass: '', tag: 'Top match', tagClass: 'tag-top', top: true, salary: 'MYR 6–11k/mo', desc: 'Data Scientists extract insights from structured and unstructured data using statistics, machine learning, and domain expertise. Your Python, SQL, and ML exposure are strong entry signals.', skills: ['Python', 'SQL', 'scikit-learn', 'Pandas', 'Statistics', 'Tableau / Power BI', 'A/B testing'] },
  { name: 'ML Engineering', score: 83, fillClass: '', tag: 'Top match', tagClass: 'tag-top', top: true, salary: 'MYR 7–13k/mo', desc: 'ML Engineers bridge research and production. Your technical foundation transfers well; cloud deployment experience would strengthen your signal.', skills: ['Python', 'PyTorch / TensorFlow', 'MLflow', 'Docker', 'Kubernetes', 'Cloud (AWS/GCP)', 'CI/CD'] },
  { name: 'Backend Engineering', score: 72, fillClass: 'fill-blue', tag: 'Good fit', tagClass: 'tag-good', top: false, salary: 'MYR 5–10k/mo', desc: 'Backend Engineers build server-side logic and APIs. Your SQL and Python exposure transfers well, though more REST API experience would help.', skills: ['Node.js / Python / Go', 'REST APIs', 'SQL / NoSQL', 'Docker', 'System design', 'Git'] },
  { name: 'Product Management', score: 67, fillClass: 'fill-blue', tag: 'Good fit', tagClass: 'tag-good', top: false, salary: 'MYR 6–12k/mo', desc: 'Technical PMs with a data background are valued in SEA. Your analytical skills are an asset; stakeholder management is the main gap.', skills: ['Product thinking', 'SQL / analytics', 'User research', 'Roadmapping', 'Communication', 'Agile'] },
  { name: 'Quantitative Finance', score: 58, fillClass: 'fill-amber', tag: 'Moderate', tagClass: 'tag-mid', top: false, salary: 'MYR 7–15k/mo', desc: 'Quant roles demand deep probability theory and financial instruments knowledge beyond your current CV signals.', skills: ['Python / R', 'Statistics / Probability', 'Financial modelling', 'Time-series analysis'] },
  { name: 'UX Research', score: 44, fillClass: 'fill-amber', tag: 'Moderate', tagClass: 'tag-mid', top: false, salary: 'MYR 4–8k/mo', desc: 'Your data analysis skills help with quantitative research, but qualitative methods are a key gap.', skills: ['User interviews', 'Usability testing', 'Survey design', 'Data synthesis'] },
  { name: 'Management Consulting', score: 39, fillClass: 'fill-red', tag: 'Low signal', tagClass: 'tag-low', top: false, salary: 'MYR 5–10k/mo', desc: 'Consulting values structured thinking and leadership signals. Your technical depth is a differentiator, but soft-skill signals are limited.', skills: ['Structured problem-solving', 'Communication', 'Case interview prep', 'Leadership'] },
  { name: 'Marketing / Growth', score: 31, fillClass: 'fill-red', tag: 'Low signal', tagClass: 'tag-low', top: false, salary: 'MYR 4–7k/mo', desc: 'Your data skills help with growth analytics, but marketing campaign experience is not yet signalled on your CV.', skills: ['SQL / analytics', 'Google Analytics', 'A/B testing', 'SEO / SEM'] }
];

function renderFieldList() {
  const container = document.getElementById('field-list');
  if (!container) return;
  container.innerHTML = '';
  fields.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'field-row' + (f.top ? ' top' : '');
    row.innerHTML = `
      <div class="field-rank">${i + 1}</div>
      <div class="field-row-name">${f.name}</div>
      <div class="field-bar-wrap"><div class="field-bar"><div class="field-fill ${f.fillClass}" style="width:${f.score}%"></div></div></div>
      <div class="field-row-score">${f.score}<span style="font-size:10px;font-weight:500;color:var(--text3)">/100</span></div>
      <span class="field-row-tag ${f.tagClass}">${f.tag}</span>`;
    row.addEventListener('click', () => toggleFieldDesc(i, row));
    container.appendChild(row);
  });
}

function toggleFieldDesc(idx, rowEl) {
  const panel = document.getElementById('field-desc-panel');
  const f = fields[idx];
  if (activeFieldIdx === idx) {
    panel.classList.remove('visible');
    rowEl.classList.remove('active-row');
    activeFieldIdx = null;
    return;
  }
  document.querySelectorAll('.field-row').forEach(r => r.classList.remove('active-row'));
  rowEl.classList.add('active-row');
  activeFieldIdx = idx;
  document.getElementById('fdp-title').textContent = f.name;
  document.getElementById('fdp-meta').textContent = `Score: ${f.score} / 100 · ${f.tag} · Typical salary: ${f.salary}`;
  document.getElementById('fdp-body').textContent = f.desc;
  document.getElementById('fdp-skills').innerHTML = f.skills.map(s => `<span class="field-desc-skill-chip">${s}</span>`).join('');
  panel.classList.add('visible');
}

