// ══ app-cv.js — CV upload, parsing, career timeline, enhance, preview ══
// ── CV Upload ──
function switchUploadTab(tab, btn) {
  document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('upload-paste-panel').style.display = tab === 'paste' ? 'block' : 'none';
  document.getElementById('upload-file-panel').style.display = tab === 'file' ? 'block' : 'none';
}

function loadSampleCV(btn) {
  document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('upload-paste-panel').style.display = 'block';
  document.getElementById('upload-file-panel').style.display = 'none';
  document.getElementById('cv-text-input').value = SAMPLE_CV;
}

function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('File too large. Max 5MB.');
    return;
  }

  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (isPDF) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Join items — add newline when y-position changes significantly (new line in PDF)
          let lastY = null;
          let lineText = '';
          content.items.forEach(item => {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
              fullText += lineText.trim() + '\n';
              lineText = '';
            }
            lineText += item.str + ' ';
            lastY = item.transform[5];
          });
          fullText += lineText.trim() + '\n';
        }
        document.getElementById('cv-text-input').value = fullText.trim();
        switchUploadTab('paste', document.querySelector('.upload-tab'));
      } catch (err) {
        alert('Could not read PDF: ' + err.message + '. Try pasting your CV text directly.');
      }
    };
    reader.readAsArrayBuffer(file);
  } else {
    // Plain text / docx fallback — read as text
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById('cv-text-input').value = e.target.result;
      switchUploadTab('paste', document.querySelector('.upload-tab'));
    };
    reader.readAsText(file);
  }
}

function persistCV() {
  const session = Auth.getSession();
  if (session && cvData) {
    localStorage.setItem('careeros_cv_' + session.userId, JSON.stringify({ cvData, enhancedData, timelineData }));
  }
}

function loadPersistedCV() {
  const session = Auth.getSession();
  if (!session) return;
  try {
    const saved = JSON.parse(localStorage.getItem('careeros_cv_' + session.userId) || 'null');
    if (saved?.cvData) {
      cvData = saved.cvData;
      enhancedData = saved.enhancedData || null;
      timelineData = saved.timelineData || null;
      cvUploaded = true;
      showCVResults(cvData);
      if (timelineData) renderTimeline(timelineData);
    }
  } catch { /* ignore */ }
}

async function analyzeCV() {
  const text = document.getElementById('cv-text-input').value.trim();
  if (!text) {
    alert('Please paste or upload your CV text first.');
    return;
  }

  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  const spinner = document.getElementById('uploading');
  const msgEl = document.getElementById('upload-msg');
  spinner.classList.add('show');
  document.getElementById('upload-done').style.display = 'none';

  const msgs = ['Reading your CV…', 'Extracting skills and experiences…', 'Mapping career patterns…', 'Benchmarking against SEA profiles…'];
  let mi = 0;
  const tick = setInterval(() => { if (mi < msgs.length) msgEl.textContent = msgs[mi++]; }, 600);

  try {
    if (AIService.hasApiKey()) {
      cvData = await AIService.parseCV(text);
    } else {
      await new Promise(r => setTimeout(r, 2000));
      cvData = parseCVLocally(text);
    }
    cvUploaded = true;
    enhancedData = null;
    timelineData = null;
    persistCV();
    showCVResults(cvData);
  } catch (err) {
    alert('Analysis failed: ' + (err.message === 'NO_API_KEY' ? 'Add your API key in Settings.' : err.message));
    cvData = parseCVLocally(text);
    cvUploaded = true;
    showCVResults(cvData);
  } finally {
    clearInterval(tick);
    spinner.classList.remove('show');
    btn.disabled = false;
  }
}

function parseCVLocally(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // ── Skills detection ──
  const skillKeywords = ['python','sql','javascript','typescript','react','vue','angular',
    'node','node.js','machine learning','pytorch','tensorflow','pandas','numpy','git',
    'tableau','power bi','aws','azure','gcp','docker','kubernetes','go','java','c++',
    'c#','ruby','php','swift','kotlin','flutter','mongodb','postgresql','mysql','redis',
    'kafka','spark','airflow','figma','excel','rest','graphql','fastapi','django','flask'];
  const lower = text.toLowerCase();
  const skills = skillKeywords.filter(s => lower.includes(s))
    .map(s => s === 'node.js' ? 'Node.js' : s === 'power bi' ? 'Power BI' :
              s.charAt(0).toUpperCase() + s.slice(1));

  // ── Section boundary detection ──
  const SECTION_RE = /^(experience|work experience|employment|professional experience|education|skills|projects|achievements|certifications|summary|profile|objective)/i;

  // Split lines into named sections
  const sections = {};
  let currentSection = 'header';
  sections[currentSection] = [];
  lines.forEach(line => {
    if (SECTION_RE.test(line) && line.length < 60) {
      currentSection = line.toLowerCase().split(/\s+/)[0];
      sections[currentSection] = sections[currentSection] || [];
    } else {
      sections[currentSection].push(line);
    }
  });

  // ── Experience extraction ──
  // Pick the best experience section key
  const expKey = ['experience','work','employment','professional'].find(k =>
    Object.keys(sections).some(s => s.startsWith(k))
  );
  const expLines = expKey
    ? sections[Object.keys(sections).find(s => s.startsWith(expKey))] || []
    : [];

  // A "content line" is one that isn't a job title/company header
  // Heuristic: lines >40 chars that don't look like dates/locations are bullet content
  const isBullet = l =>
    l.length > 30 &&
    !/^\d{4}/.test(l) &&           // doesn't start with year
    !/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(l) && // not a month
    !/^[A-Z][a-z]+ (University|College|School|Institute)/i.test(l);

  const bullets = expLines.filter(isBullet);

  // Group into one block or try to split by role-header lines
  const experiences = [];
  if (bullets.length > 0) {
    // Try to find role title lines (short, title-cased, not a bullet)
    let currentRole = 'Experience';
    let currentBullets = [];
    expLines.forEach(line => {
      if (!isBullet(line) && line.length > 5 && line.length < 80) {
        if (currentBullets.length > 0) {
          experiences.push({ title: currentRole, bullets: currentBullets });
          currentBullets = [];
        }
        currentRole = line;
      } else if (isBullet(line)) {
        currentBullets.push(line.replace(/^[-•·▪▸◦]\s*/, ''));
      }
    });
    if (currentBullets.length > 0) {
      experiences.push({ title: currentRole, bullets: currentBullets });
    }
  }

  // ── Name ──
  // Usually first non-empty line, skip if it looks like a section header
  const name = lines.find(l => l.length > 1 && l.length < 60 && !SECTION_RE.test(l)) || 'Candidate';

  // ── Education ──
  const eduKey = Object.keys(sections).find(s => s.startsWith('edu'));
  const eduLines = eduKey ? sections[eduKey] : [];
  const education = eduLines.find(l => /bachelor|master|phd|diploma|degree/i.test(l))
    || eduLines[0]
    || (text.match(/Bachelor[^.\n]*/i) || ['Education details in CV'])[0];

  // ── Summary ──
  const summaryKey = Object.keys(sections).find(s => s.startsWith('summ') || s.startsWith('prof') || s.startsWith('obj'));
  const summaryLines = summaryKey ? sections[summaryKey] : [];
  const summary = summaryLines.slice(0, 2).join(' ') ||
    `Profile with ${skills.length || 3} technical skills detected. Strongest signals in ${skills.slice(0, 3).join(', ') || 'technical'} roles across SEA.`;

  return {
    name,
    email: (text.match(/[\w.-]+@[\w.-]+\.\w+/) || [''])[0],
    skills: skills.length ? skills : ['Python', 'SQL', 'Data analysis'],
    experiences: experiences.length ? experiences : [{ title: 'Experience', bullets: bullets.length ? bullets : ['Add your Anthropic API key in Settings for full AI-powered CV parsing.'] }],
    education,
    projects: [],
    summary
  };
}

function showCVResults(data) {
  document.getElementById('upload-done').style.display = 'block';
  document.getElementById('cv-parse-title').textContent = 'CV analysed successfully';
  const expCount = data.experiences?.length || 0;
  const skillCount = data.skills?.length || 0;
  document.getElementById('cv-parse-sub').textContent = `${expCount} experience section(s) · ${skillCount} skills detected`;
  document.getElementById('cv-skills-chips').innerHTML = (data.skills || []).map(s => `<span class="chip">${s}</span>`).join('');
  document.getElementById('cv-summary-box').innerHTML = '<i class="ti ti-info-circle"></i> ' + (data.summary || '');
}

// ── Career Timeline ──
async function generateTimeline() {
  if (!cvData) return;

  document.getElementById('timeline-empty').style.display = 'none';
  document.getElementById('timeline-content').style.display = 'none';
  document.getElementById('timeline-loading').classList.add('show');

  try {
    if (AIService.hasApiKey()) {
      timelineData = await AIService.generateCareerTimeline(cvData, 'Data Science / ML Engineering');
    } else {
      await new Promise(r => setTimeout(r, 1800));
      timelineData = getDemoTimeline(cvData);
    }
    persistCV();
    renderTimeline(timelineData);
  } catch (err) {
    timelineData = getDemoTimeline(cvData);
    renderTimeline(timelineData);
  } finally {
    document.getElementById('timeline-loading').classList.remove('show');
  }
}

function getDemoTimeline(data) {
  const skills = (data.skills || []).slice(0, 3).join(', ') || 'Python, SQL';
  return {
    targetRole: 'Senior Data Scientist / ML Engineer',
    confidence: 'medium',
    whyThisPath: `Your ${skills} foundation aligns with the most common entry path for data-adjacent roles in SEA. Profiles with similar internship + project experience typically progress through analyst → scientist → senior/lead tracks over 5 years.`,
    similarProfiles: 'Based on 340+ early-career profiles in Malaysia and Singapore with comparable CS degrees and 1-2 internships.',
    milestones: [
      { year: 0, title: 'Today', role: 'Junior Data Analyst / DS Intern', salary: 'MYR 4–6k/mo', focus: 'SQL, dashboards, basic ML', why: `Your current skills (${skills}) match entry-level data roles. Internship experience gives you a head start over fresh grads.` },
      { year: 1, title: 'Year 1', role: 'Data Analyst', salary: 'MYR 5–8k/mo', focus: 'A/B testing, stakeholder reports', why: 'Most similar profiles land analyst roles first — it builds business context that pure ML roles often require.' },
      { year: 2, title: 'Year 2', role: 'Data Scientist', salary: 'MYR 7–11k/mo', focus: 'End-to-end ML projects', why: 'With 1-2 years of production data work, you can credibly own modelling projects. Cloud cert closes a common gap.' },
      { year: 3, title: 'Year 3', role: 'ML Engineer / Senior DS', salary: 'MYR 9–14k/mo', focus: 'Model deployment, MLOps', why: 'SEA tech companies increasingly want scientists who can deploy. This is where your technical depth differentiates.' },
      { year: 5, title: 'Year 5', role: 'Lead Data Scientist / ML Lead', salary: 'MYR 12–18k/mo', focus: 'Team leadership, architecture', why: 'Leadership signals (mentoring, cross-team projects) become the bottleneck — not technical skills.' }
    ]
  };
}

function renderTimeline(data) {
  document.getElementById('timeline-empty').style.display = 'none';
  document.getElementById('timeline-content').style.display = 'block';

  document.getElementById('tl-target-role').textContent = data.targetRole;
  const confMap = { high: 'High confidence', medium: 'Moderate confidence', exploratory: 'Exploratory' };
  const confClass = { high: 'conf-high', medium: 'conf-med', exploratory: 'conf-low' };
  document.getElementById('tl-confidence').innerHTML = `<span class="conf-badge ${confClass[data.confidence] || 'conf-med'}">${confMap[data.confidence] || data.confidence}</span>`;
  document.getElementById('tl-why').innerHTML = '<strong>Why this path:</strong> ' + data.whyThisPath;
  document.getElementById('tl-similar').innerHTML = '<i class="ti ti-users"></i> ' + data.similarProfiles;

  const container = document.getElementById('career-timeline');
  container.innerHTML = data.milestones.map((m, i) => `
    <div class="tl-milestone ${i === 0 ? 'current' : ''}">
      <div class="tl-marker">
        <div class="tl-dot"></div>
        ${i < data.milestones.length - 1 ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-card">
        <div class="tl-year">Year ${m.year} · ${m.title}</div>
        <div class="tl-role">${m.role}</div>
        <div class="tl-salary"><i class="ti ti-currency-dollar"></i> ${m.salary}</div>
        <div class="tl-focus"><strong>Focus:</strong> ${m.focus}</div>
        <div class="tl-why"><i class="ti ti-bulb"></i> ${m.why}</div>
      </div>
    </div>
  `).join('');
}


function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// ── Enhance CV ──
async function runEnhanceCV() {
  if (!cvData?.experiences?.length) return;

  document.getElementById('enhance-loading').classList.add('show');
  document.getElementById('enhance-btn').disabled = true;

  try {
    if (AIService.hasApiKey()) {
      enhancedData = await AIService.enhanceBullets(cvData.experiences);
    } else {
      await new Promise(r => setTimeout(r, 1500));
      enhancedData = { enhanced: cvData.experiences.map(exp => ({
        title: exp.title,
        original: exp.bullets,
        enhanced: exp.bullets.map(b => enhanceLocally(b))
      })) };
    }
    persistCV();
    renderEnhanceBlocks();
  } catch (err) {
    alert('Enhancement failed: ' + err.message);
  } finally {
    document.getElementById('enhance-loading').classList.remove('show');
    document.getElementById('enhance-btn').disabled = false;
  }
}

function enhanceLocally(bullet) {
  return bullet
    .replace(/^worked on/i, 'Contributed to')
    .replace(/^helped with/i, 'Supported')
    .replace(/^used /i, 'Leveraged ')
    .replace(/^did a/i, 'Designed and implemented a')
    .replace(/got good results/i, 'achieved strong evaluation metrics');
}

function renderEnhanceBlocks() {
  document.getElementById('enhance-empty').style.display = 'none';
  document.getElementById('enhance-content').style.display = 'block';

  const blocks = enhancedData?.enhanced || [];
  document.getElementById('enhance-blocks').innerHTML = blocks.map((block, bi) => `
    <div style="font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text)">${block.title}</div>
    ${block.original.map((orig, i) => `
      <div class="cv-block">
        <div class="cv-label">Your original</div>
        <div class="cv-original">${escapeHtml(orig)}</div>
        <div class="enhanced-label">Enhanced version</div>
        <div class="cv-enhanced">${escapeHtml(block.enhanced[i] || orig)}</div>
        <div style="display:flex;gap:6px;margin-top:10px">
          <button class="btn sm" onclick="copyText(this, ${JSON.stringify(block.enhanced[i] || orig)})"><i class="ti ti-copy"></i>Copy</button>
        </div>
      </div>
    `).join('')}
  `).join('');
}

function initEnhancePage() {
  if (cvUploaded && cvData) {
    document.getElementById('enhance-empty').style.display = 'none';
    document.getElementById('enhance-content').style.display = 'block';
    if (enhancedData) renderEnhanceBlocks();
  }
}

