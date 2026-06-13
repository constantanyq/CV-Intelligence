// ══ app-jobs.js — Jobs, applications, employer candidates, field fit ══
// ── Jobs & applications ──
const APPLICATIONS_KEY = 'careeros_applications';

function calculateFitScore(roleSkills) {
  if (!roleSkills || !roleSkills.length) return 75;
  const candSkills = cvData?.skills || ['Python', 'SQL', 'Data analysis'];
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
  const job = getActiveJobsList().find(j => j.id === jobId);
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
  const job = getActiveJobsList().find(j => j.id === jobId);
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
  } else {
    if (empty) empty.style.display = 'none';
    const jobs = savedIds.map(id => getActiveJobsList().find(j => j.id === id)).filter(Boolean);
    list.innerHTML = jobs.map(j => renderJobCard(j, {
      mode: 'saved',
      saved: true,
      applied: applied.includes(j.id)
    })).join('');
  }
}

function renderPotentialJobs() {
  const session = Auth.getSession();
  if (!session) return;
  
  const container = document.getElementById('potential-jobs-list');
  const section = document.getElementById('potential-jobs-section');
  if (!container || !section) return;
  
  let interests = [];
  try {
    interests = JSON.parse(localStorage.getItem('careeros_recruiting_interests') || '[]');
  } catch {
    interests = [];
  }
  
  const currentCandidateName = (typeof cvData !== 'undefined' && cvData?.name || session.name || '').toLowerCase().trim();
  const myInvites = interests.filter(i => {
    if (i.status !== 'invited') return false;
    
    // Direct ID match
    if (i.candidateUserId === session.userId || i.candidateUserId === 'ME_' + session.userId) {
      return true;
    }
    
    // Name-based match for mock candidates ('AT', 'PS', 'JC')
    if (currentCandidateName) {
      if (i.candidateUserId === 'AT' && (currentCandidateName.includes('alex tan') || currentCandidateName.includes('wei ming'))) {
        return true;
      }
      if (i.candidateUserId === 'PS' && (currentCandidateName.includes('priya') || currentCandidateName.includes('sharma'))) {
        return true;
      }
      if (i.candidateUserId === 'JC' && (currentCandidateName.includes('james') || currentCandidateName.includes('chen'))) {
        return true;
      }
      
      // Generic name-based match
      if (i.candidateName) {
        const inviteName = i.candidateName.toLowerCase().trim();
        if (inviteName.includes(currentCandidateName) || currentCandidateName.includes(inviteName)) {
          return true;
        }
      }
    }
    
    return false;
  });
  
  section.style.display = 'block';
  
  if (!myInvites.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 1rem; border: 1.5px dashed var(--border); border-radius: var(--radius-sm); background: var(--bg2);">
        <i class="ti ti-mail-opened" style="font-size: 28px; margin-bottom: 8px; color: var(--text3);"></i>
        <p style="margin-bottom: 0; font-size: 12px; color: var(--text2);">No interview invitations received yet. When employers invite you, they will appear here.</p>
      </div>`;
    return;
  }
  
  section.style.display = 'block';
  container.innerHTML = myInvites.map(inv => {
    const activeJobs = getActiveJobsList();
    const job = activeJobs.find(j => j.id === inv.roleId);
    if (!job) return '';
    
    const fitClass = job.fit >= 85 ? 'fit-high' : job.fit >= 70 ? 'fit-med' : 'fit-low';
    
    return `
      <div class="job-card" data-id="${job.id}" style="border: 1px solid var(--green-mid); background: rgba(16,185,129,0.02)">
        <div style="background: var(--green-light); color: var(--green-dark); font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; align-self: start">
          <i class="ti ti-calendar-event"></i><span>Interview Invitation Received</span>
        </div>
        <div class="job-card-header">
          <div class="job-card-icon" style="background: var(--green-light); color: var(--green-dark)"><i class="ti ti-briefcase"></i></div>
          <div class="job-card-info">
            <div class="job-card-title">${escapeHtml(job.title)}</div>
            <div class="job-card-meta">${escapeHtml(job.company)} · ${escapeHtml(job.location)} · ${escapeHtml(job.type)}</div>
          </div>
          <div class="job-fit-badge ${fitClass}">${job.fit}% fit</div>
        </div>
        <div class="job-card-salary"><i class="ti ti-currency-dollar"></i> ${escapeHtml(job.salary)}</div>
        <div class="job-card-desc">${escapeHtml(job.desc)}</div>
        <div class="job-card-skills">
          ${job.skills.map(s => `<span class="job-skill-chip">${escapeHtml(s)}</span>`).join('')}
        </div>
        <div class="job-card-footer">
          <span class="job-posted">${escapeHtml(job.posted)}</span>
          <div class="job-card-actions">
            <button class="btn sm" onclick="declinePotentialJob('${inv.id}')"><i class="ti ti-x"></i> Decline</button>
            <button class="btn sm primary" onclick="applyToPotentialJob('${inv.id}', '${job.id}')"><i class="ti ti-check"></i> Accept & Apply</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function declinePotentialJob(inviteId) {
  if (!confirm('Are you sure you want to decline this invitation?')) return;
  try {
    let interests = JSON.parse(localStorage.getItem('careeros_recruiting_interests') || '[]');
    interests = interests.map(i => {
      if (i.id === inviteId) {
        return { ...i, status: 'declined' };
      }
      return i;
    });
    localStorage.setItem('careeros_recruiting_interests', JSON.stringify(interests));
    renderPotentialJobs();
    showToast('Invitation declined.');
  } catch (e) {
    console.error(e);
  }
}

function applyToPotentialJob(inviteId, jobId) {
  applyToJob(jobId);
  try {
    let interests = JSON.parse(localStorage.getItem('careeros_recruiting_interests') || '[]');
    interests = interests.map(i => {
      if (i.id === inviteId) {
        return { ...i, status: 'applied' };
      }
      return i;
    });
    localStorage.setItem('careeros_recruiting_interests', JSON.stringify(interests));
    renderPotentialJobs();
  } catch (e) {
    console.error(e);
  }
}

function renderAppliedCandidates() {
  const container = document.getElementById('applied-candidates-list');
  const empty = document.getElementById('applied-candidates-empty');
  if (!container) return;

  const roles = typeof getEmployerPostedRoles === 'function' ? getEmployerPostedRoles() : [];
  if (!roles.length) {
    container.innerHTML = '';
    if (empty) empty.style.display = 'none';
    return;
  }

  const roleId = typeof selectedAppliedRoleId !== 'undefined' && selectedAppliedRoleId ? selectedAppliedRoleId : roles[0].id;

  const apps = getAllApplications()
    .filter(a => a.jobId === roleId)
    .sort((a, b) => b.fit - a.fit);

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
      const matched = getActiveJobsList().find(j => j.id === app.jobId)?.skills.some(js =>
        s.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(s.toLowerCase())
      );
      return `<span class="${matched ? 'skill-match' : 'skill-neutral'}">${escapeHtml(s)}</span>`;
    }).join('');

    // Fetch hiring statuses and check for 'interview_invited'
    const hiringStatuses = typeof getHiringStatuses === 'function' ? getHiringStatuses() : [];
    const hired = hiringStatuses.some(h => {
      const cleanH = h.candId.startsWith('ME_') ? h.candId.slice(3) : h.candId;
      const cleanC = app.candidateUserId.startsWith('ME_') ? app.candidateUserId.slice(3) : app.candidateUserId;
      return cleanH === cleanC && h.roleId === roleId && h.status === 'interview_invited';
    });
    const hiredBadge = hired ? '<span class="conf-badge conf-high" style="margin-left:8px"><i class="ti ti-calendar-event"></i> Interview Invited</span>' : '';
    const hireBtnText = hired ? '<i class="ti ti-calendar-check"></i>Hired / Interview Invited' : '<i class="ti ti-gift"></i>Interested in Hiring';

    return `
      <div class="cand-cv-card applied-cand">
        <div class="cand-cv-header">
          <div class="cand-rank-badge">${rankLabel}</div>
          <div class="cand-avatar">${initials}</div>
          <div>
            <div class="cand-name" style="display:flex;align-items:center">${escapeHtml(app.candidateName)} ${hiredBadge}</div>
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
          <div class="cand-cv-footer-top" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div class="match-reason" style="flex:1"><strong>Why this rank:</strong> ${escapeHtml(app.reason)}</div>
            <div style="display:flex;gap:6px">
              <button class="btn sm primary" onclick="showApplicantCV('${app.id}')"><i class="ti ti-file-text"></i>View application</button>
              <button class="btn sm" onclick="interestedInHiring('${app.candidateUserId}', '${roleId}')" ${hired ? 'disabled' : ''} style="background:var(--green-light);color:var(--green-dark);border-color:var(--green-mid)">${hireBtnText}</button>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');
}

function showApplicantCV(appId) {
  const app = getAllApplications().find(a => a.id === appId);
  if (!app) return;
  document.getElementById('cand-modal-name').textContent = app.candidateName;

  const job = getActiveJobsList().find(j => j.id === app.jobId);
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

function loadUpskillProgressDirect() {
  try { return JSON.parse(localStorage.getItem('careeros_upskill_progress') || '{}'); } catch { return {}; }
}

function updateFieldsInPlace() {
  const progress = loadUpskillProgressDirect();
  fields.forEach(f => {
    if (f.baseScore === undefined) {
      f.baseScore = f.score;
    }
    const fieldProgress = progress[f.name] || {};
    const completedCount = Object.values(fieldProgress).filter(Boolean).length;
    f.score = Math.min(100, f.baseScore + completedCount * 4);
    
    if (f.score >= 85) {
      f.tag = 'Top match';
      f.tagClass = 'tag-top';
      f.fillClass = '';
      f.top = true;
    } else if (f.score >= 70) {
      f.tag = 'Good fit';
      f.tagClass = 'tag-good';
      f.fillClass = 'fill-blue';
      f.top = false;
    } else if (f.score >= 50) {
      f.tag = 'Moderate';
      f.tagClass = 'tag-mid';
      f.fillClass = 'fill-amber';
      f.top = false;
    } else {
      f.tag = 'Low signal';
      f.tagClass = 'tag-low';
      f.fillClass = 'fill-red';
      f.top = false;
    }
  });
  fields.sort((a, b) => b.score - a.score);
}

function renderFieldList() {
  updateFieldsInPlace();
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

