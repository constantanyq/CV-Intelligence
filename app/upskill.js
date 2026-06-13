// ══ app-upskill.js — Upskill tracker data  functions, DOMContentLoaded init ══
// ── Upskill Tracker ──
const UPSKILL_KEY = 'careeros_upskill_progress';

const upskillData = {
  'Data Science': {
    color: 'var(--green-dark)',
    icon: 'ti-chart-dots',
    intro: 'Data Scientists who excel in SEA typically combine strong Python, statistics, and the ability to communicate findings to non-technical stakeholders.',
    skills: [
      {
        skill: 'Python for Data Analysis',
        why: 'The de-facto language for DS in SEA. Pandas, NumPy, and Matplotlib are expected on every DS CV.',
        resources: [
          { type: 'Free', label: 'Python for Everybody – Coursera (U. Michigan)', url: 'https://www.coursera.org/specializations/python', badge: 'Certificate' },
          { type: 'Free', label: 'Kaggle Python & Pandas micro-courses', url: 'https://www.kaggle.com/learn/python', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Python Bootcamp (Jose Portilla)', url: 'https://www.udemy.com/course/complete-python-bootcamp/', badge: 'Certificate' }
        ]
      },
      {
        skill: 'SQL & Data Wrangling',
        why: 'Nearly every DS job spec in SEA lists SQL as required. Window functions and CTEs are the common gap.',
        resources: [
          { type: 'Free', label: 'Mode SQL Tutorial (interactive)', url: 'https://mode.com/sql-tutorial/', badge: 'Free' },
          { type: 'Free', label: 'SQLZoo – interactive SQL practice', url: 'https://sqlzoo.net/', badge: 'Free' },
          { type: 'Paid', label: 'DataCamp: SQL for Data Science', url: 'https://www.datacamp.com/tracks/sql-fundamentals', badge: 'Certificate' }
        ]
      },
      {
        skill: 'Machine Learning Fundamentals',
        why: 'scikit-learn, model evaluation, and bias/variance tradeoff are tested in almost every DS interview.',
        resources: [
          { type: 'Free', label: 'Andrew Ng – Machine Learning Specialization (Coursera)', url: 'https://www.coursera.org/specializations/machine-learning-introduction', badge: 'Certificate' },
          { type: 'Free', label: 'fast.ai – Practical Deep Learning', url: 'https://www.fast.ai/', badge: 'Free' },
          { type: 'Paid', label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', badge: 'Free' }
        ]
      },
      {
        skill: 'Statistics & A/B Testing',
        why: 'Hypothesis testing, p-values, and experiment design are asked in virtually every DS technical interview in SEA.',
        resources: [
          { type: 'Free', label: 'Khan Academy: Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', badge: 'Free' },
          { type: 'Paid', label: 'Udacity: A/B Testing (Google)', url: 'https://www.udacity.com/course/ab-testing--ud257', badge: 'Free' },
          { type: 'Paid', label: 'DataCamp: Statistical Thinking in Python', url: 'https://www.datacamp.com/courses/statistical-thinking-in-python-part-1', badge: 'Certificate' }
        ]
      },
      {
        skill: 'Data Visualisation (Tableau / Power BI)',
        why: 'Malaysian and Singaporean companies heavily use Tableau and Power BI. A dashboard portfolio is a strong differentiator.',
        resources: [
          { type: 'Free', label: 'Tableau Public – free training videos', url: 'https://public.tableau.com/en-us/s/resources', badge: 'Free' },
          { type: 'Paid', label: 'Microsoft: PL-300 Power BI Analyst cert', url: 'https://learn.microsoft.com/en-us/certifications/power-bi-data-analyst-associate/', badge: 'Certification' },
          { type: 'Paid', label: 'Udemy: Tableau 2024 A-Z', url: 'https://www.udemy.com/course/tableau10/', badge: 'Certificate' }
        ]
      }
    ]
  },
  'ML Engineering': {
    color: 'var(--green-dark)',
    icon: 'ti-brain',
    intro: 'ML Engineers in SEA are expected to take models from notebook to production. Cloud and MLOps skills are the biggest gap for most candidates.',
    skills: [
      {
        skill: 'Deep Learning (PyTorch / TensorFlow)',
        why: 'SEA ML roles at Grab, Sea, GoTo all expect practical DL. PyTorch is now the dominant framework.',
        resources: [
          { type: 'Free', label: 'PyTorch Official Tutorials', url: 'https://pytorch.org/tutorials/', badge: 'Free' },
          { type: 'Free', label: 'fast.ai – Practical Deep Learning for Coders', url: 'https://www.fast.ai/', badge: 'Free' },
          { type: 'Paid', label: 'DeepLearning.AI TensorFlow Developer Certificate', url: 'https://www.coursera.org/professional-certificates/tensorflow-in-practice', badge: 'Certification' }
        ]
      },
      {
        skill: 'MLOps & Model Deployment',
        why: 'Deploying models with Docker, FastAPI, and monitoring drift separates ML Engineers from data scientists in job specs.',
        resources: [
          { type: 'Free', label: 'MLflow Docs + Quickstart', url: 'https://mlflow.org/docs/latest/quickstart.html', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: MLOps Bootcamp (Docker, Airflow, MLflow)', url: 'https://www.udemy.com/course/mlops-course/', badge: 'Certificate' },
          { type: 'Paid', label: 'DeepLearning.AI MLOps Specialization', url: 'https://www.coursera.org/specializations/machine-learning-engineering-for-production-mlops', badge: 'Certificate' }
        ]
      },
      {
        skill: 'Cloud Platforms (AWS / GCP)',
        why: '78% of ML Engineer JDs in SEA require cloud. AWS SageMaker and GCP Vertex AI are the most commonly listed.',
        resources: [
          { type: 'Free', label: 'AWS Cloud Practitioner Essentials (free)', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', badge: 'Free' },
          { type: 'Paid', label: 'AWS Certified Machine Learning – Specialty', url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/', badge: 'Certification' },
          { type: 'Paid', label: 'GCP Professional ML Engineer cert', url: 'https://cloud.google.com/learn/certification/machine-learning-engineer', badge: 'Certification' }
        ]
      },
      {
        skill: 'Docker & Kubernetes',
        why: 'Containerising models is now a baseline expectation for production ML roles across SEA.',
        resources: [
          { type: 'Free', label: 'Docker Getting Started (official docs)', url: 'https://docs.docker.com/get-started/', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Docker & Kubernetes: The Practical Guide', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', badge: 'Certificate' },
          { type: 'Free', label: 'Kubernetes Official Interactive Tutorial', url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/', badge: 'Free' }
        ]
      }
    ]
  },
  'Backend Engineering': {
    color: 'var(--blue)',
    icon: 'ti-server',
    intro: 'Backend roles in SEA tech companies expect strong API design, database skills, and increasingly cloud-native architecture.',
    skills: [
      {
        skill: 'REST API Design & Node.js / Python',
        why: 'Node.js and Python (FastAPI/Django) dominate backend job specs at Malaysian and Singaporean startups.',
        resources: [
          { type: 'Free', label: 'The Odin Project – Full Stack Node.js', url: 'https://www.theodinproject.com/paths/full-stack-javascript', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Node.js, Express, MongoDB Bootcamp', url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/', badge: 'Certificate' },
          { type: 'Free', label: 'FastAPI Official Tutorial', url: 'https://fastapi.tiangolo.com/tutorial/', badge: 'Free' }
        ]
      },
      {
        skill: 'System Design',
        why: 'System design interviews are standard at mid-level+ backend roles. Load balancers, caching, and databases at scale are must-knows.',
        resources: [
          { type: 'Free', label: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', badge: 'Free' },
          { type: 'Paid', label: 'Educative: Grokking System Design Interview', url: 'https://www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers', badge: 'Certificate' },
          { type: 'Free', label: 'ByteByteGo Newsletter + YouTube', url: 'https://www.youtube.com/@ByteByteGo', badge: 'Free' }
        ]
      },
      {
        skill: 'PostgreSQL & Database Internals',
        why: 'Query optimisation, indexing strategies, and schema design are grilled in backend interviews across SEA.',
        resources: [
          { type: 'Free', label: 'PostgreSQL Official Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: SQL and PostgreSQL: The Complete Developer\'s Guide', url: 'https://www.udemy.com/course/sql-and-postgresql/', badge: 'Certificate' },
          { type: 'Free', label: 'Use The Index, Luke! (query optimisation)', url: 'https://use-the-index-luke.com/', badge: 'Free' }
        ]
      },
      {
        skill: 'Docker & CI/CD',
        why: 'Containerisation and automated deployment pipelines are now table-stakes for backend roles in SEA product companies.',
        resources: [
          { type: 'Free', label: 'GitHub Actions Quickstart', url: 'https://docs.github.com/en/actions/quickstart', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Docker & Kubernetes Practical Guide', url: 'https://www.udemy.com/course/docker-kubernetes-the-practical-guide/', badge: 'Certificate' },
          { type: 'Free', label: 'GitLab CI/CD Docs', url: 'https://docs.gitlab.com/ee/ci/', badge: 'Free' }
        ]
      }
    ]
  },
  'Product Management': {
    color: 'var(--amber)',
    icon: 'ti-bulb',
    intro: 'Technical PMs in SEA stand out by combining product intuition with data fluency. Stakeholder communication is consistently the hardest gap to close.',
    skills: [
      {
        skill: 'Product Thinking & Frameworks',
        why: 'CIRCLES, Jobs-to-be-Done, and North Star Metric frameworks are expected in PM interviews at Grab, Shopee, and regional startups.',
        resources: [
          { type: 'Free', label: 'Lenny\'s Newsletter – PM fundamentals', url: 'https://www.lennysnewsletter.com/', badge: 'Free' },
          { type: 'Paid', label: 'Coursera: Google Project Management Certificate', url: 'https://www.coursera.org/professional-certificates/google-project-management', badge: 'Certification' },
          { type: 'Paid', label: 'Reforge: Mastering Product Management', url: 'https://www.reforge.com/mastering-product-management', badge: 'Certificate' }
        ]
      },
      {
        skill: 'SQL for Product Analytics',
        why: 'PMs who can self-serve on data (funnels, retention, cohorts) are far more effective and more hireable across SEA.',
        resources: [
          { type: 'Free', label: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/', badge: 'Free' },
          { type: 'Free', label: 'Kaggle: Intro to SQL', url: 'https://www.kaggle.com/learn/intro-to-sql', badge: 'Free' },
          { type: 'Paid', label: 'DataCamp: SQL for Business Analysts', url: 'https://www.datacamp.com/tracks/sql-fundamentals', badge: 'Certificate' }
        ]
      },
      {
        skill: 'User Research & Usability Testing',
        why: 'Qualitative research skills are what differentiate PMs who ship right from those who ship fast.',
        resources: [
          { type: 'Free', label: 'Nielsen Norman Group – Free UX Articles', url: 'https://www.nngroup.com/articles/', badge: 'Free' },
          { type: 'Paid', label: 'Coursera: UX Design by Google (Certificate)', url: 'https://www.coursera.org/professional-certificates/google-ux-design', badge: 'Certification' },
          { type: 'Free', label: 'UserTesting Blog – Research Methods', url: 'https://www.usertesting.com/blog', badge: 'Free' }
        ]
      }
    ]
  },
  'Quantitative Finance': {
    color: 'var(--amber)',
    icon: 'ti-chart-line',
    intro: 'Quant roles in SEA (Maybank, CIMB, regional hedge funds) expect deep probability, financial instruments knowledge, and Python for modelling.',
    skills: [
      {
        skill: 'Probability & Statistics',
        why: 'Stochastic processes, distributions, and statistical inference are core to every quant interview.',
        resources: [
          { type: 'Free', label: 'Khan Academy: Statistics & Probability', url: 'https://www.khanacademy.org/math/statistics-probability', badge: 'Free' },
          { type: 'Paid', label: 'Coursera: Statistics with Python (U. Michigan)', url: 'https://www.coursera.org/specializations/statistics-with-python', badge: 'Certificate' },
          { type: 'Free', label: 'MIT OpenCourseWare: Probability', url: 'https://ocw.mit.edu/courses/6-041-probabilistic-systems-analysis-and-applied-probability-fall-2010/', badge: 'Free' }
        ]
      },
      {
        skill: 'Financial Modelling & Derivatives',
        why: 'Black-Scholes, options pricing, and risk measures (VaR, CVaR) are standard quant knowledge.',
        resources: [
          { type: 'Paid', label: 'CFA Institute – CFA Program', url: 'https://www.cfainstitute.org/en/programs/cfa', badge: 'Certification' },
          { type: 'Free', label: 'Investopedia Academy – Free Articles', url: 'https://www.investopedia.com/financial-modeling-4689817', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Financial Modelling in Excel & Python', url: 'https://www.udemy.com/course/python-for-finance-and-trading-algorithms/', badge: 'Certificate' }
        ]
      }
    ]
  },
  'UX Research': {
    color: 'var(--blue)',
    icon: 'ti-user-search',
    intro: 'UX Researchers in SEA are in demand at e-commerce and fintech companies. Qualitative methods and stakeholder presentation are the core gaps for most technical candidates.',
    skills: [
      {
        skill: 'Qualitative Research Methods',
        why: 'User interviews, contextual inquiry, and affinity mapping are the bread-and-butter of UX Research roles.',
        resources: [
          { type: 'Free', label: 'IDEO Design Thinking – Free Course', url: 'https://www.ideou.com/products/design-thinking-certificate', badge: 'Free' },
          { type: 'Paid', label: 'Coursera: UX Research & Design (Michigan)', url: 'https://www.coursera.org/specializations/michiganux', badge: 'Certificate' },
          { type: 'Free', label: 'Nielsen Norman Group UX Certification', url: 'https://www.nngroup.com/ux-certification/', badge: 'Certification' }
        ]
      },
      {
        skill: 'Figma for Prototyping',
        why: 'Researchers who can build and test prototypes in Figma are more valuable than those who can only report findings.',
        resources: [
          { type: 'Free', label: 'Figma Official Learn Hub', url: 'https://www.figma.com/resources/learn-design/', badge: 'Free' },
          { type: 'Free', label: 'Google UX Design Certificate (Coursera)', url: 'https://www.coursera.org/professional-certificates/google-ux-design', badge: 'Certification' },
          { type: 'Free', label: 'YouTube: Figma Crash Course by Flux Academy', url: 'https://www.youtube.com/c/FluxAcademy', badge: 'Free' }
        ]
      }
    ]
  },
  'Management Consulting': {
    color: 'var(--text3)',
    icon: 'ti-presentation',
    intro: 'Consulting interviews in SEA (McKinsey, BCG, Deloitte Malaysia, etc.) focus on case cracking, structured communication, and leadership stories.',
    skills: [
      {
        skill: 'Case Interview Frameworks',
        why: 'MBB and Big 4 consulting interviews in SEA are almost entirely case-based. Practice volume is the key variable.',
        resources: [
          { type: 'Free', label: 'Case in Point – free intro materials', url: 'https://www.caseinterview.com/', badge: 'Free' },
          { type: 'Paid', label: 'PrepLounge – Case Interview Practice', url: 'https://www.preplounge.com/', badge: 'Platform' },
          { type: 'Free', label: 'McKinsey Problem Solving Game (Imbellus)', url: 'https://www.mckinsey.com/careers/application-tips/application-and-hiring-process', badge: 'Free' }
        ]
      },
      {
        skill: 'Structured Communication & Slide Design',
        why: 'Pyramid Principle writing and clean slide decks are daily tools in consulting. Assessed in case presentation rounds.',
        resources: [
          { type: 'Free', label: 'Barbara Minto – Pyramid Principle Summary', url: 'https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-science-of-storytelling', badge: 'Free' },
          { type: 'Paid', label: 'Udemy: Consulting Skills Masterclass', url: 'https://www.udemy.com/course/consulting-skills/', badge: 'Certificate' },
          { type: 'Free', label: 'Slidedocs by Duarte (free PDF)', url: 'https://www.duarte.com/slidedocs/', badge: 'Free' }
        ]
      }
    ]
  },
  'Marketing / Growth': {
    color: 'var(--red)',
    icon: 'ti-speakerphone',
    intro: 'Growth and performance marketing roles in SEA e-commerce reward data-driven marketers who can own paid channels and interpret analytics.',
    skills: [
      {
        skill: 'Google Analytics & Tag Manager',
        why: 'GA4 and GTM are the baseline tools for any growth or digital marketing role in SEA.',
        resources: [
          { type: 'Free', label: 'Google Analytics Academy (free cert)', url: 'https://analytics.google.com/analytics/academy/', badge: 'Free Cert' },
          { type: 'Free', label: 'Google Tag Manager Fundamentals', url: 'https://skillshop.exceedlms.com/student/catalog/list?category_ids=53-google-tag-manager', badge: 'Free Cert' },
          { type: 'Paid', label: 'CXL Institute: Growth Marketing Minidegree', url: 'https://cxl.com/institute/program/growth-marketing/', badge: 'Certification' }
        ]
      },
      {
        skill: 'Paid Ads (Meta & Google Ads)',
        why: 'Meta and Google Ads management is required in virtually every growth marketing JD across Malaysia and Singapore.',
        resources: [
          { type: 'Free', label: 'Google Skillshop: Google Ads Certification', url: 'https://skillshop.withgoogle.com/', badge: 'Free Cert' },
          { type: 'Free', label: 'Meta Blueprint – free ad courses', url: 'https://www.facebook.com/business/learn', badge: 'Free Cert' },
          { type: 'Paid', label: 'Udemy: Facebook Ads & Facebook Marketing', url: 'https://www.udemy.com/course/facebook-ads-marketing/', badge: 'Certificate' }
        ]
      },
      {
        skill: 'A/B Testing & Experimentation',
        why: 'Growth teams at Shopee, Lazada, and Grab run experiments constantly. Understanding statistical significance is a clear differentiator.',
        resources: [
          { type: 'Free', label: 'Optimizely: A/B Testing Guide', url: 'https://www.optimizely.com/optimization-glossary/ab-testing/', badge: 'Free' },
          { type: 'Free', label: 'Udacity: A/B Testing (Google)', url: 'https://www.udacity.com/course/ab-testing--ud257', badge: 'Free' },
          { type: 'Paid', label: 'CXL: A/B Testing Mastery', url: 'https://cxl.com/institute/program/cro/', badge: 'Certificate' }
        ]
      }
    ]
  }
};

function loadUpskillProgress() {
  try { return JSON.parse(localStorage.getItem(UPSKILL_KEY) || '{}'); } catch { return {}; }
}
function saveUpskillProgress(data) {
  localStorage.setItem(UPSKILL_KEY, JSON.stringify(data));
}

let activeUpskillField = null;

function initUpskillPage() {
  const selector = document.getElementById('upskill-field-selector');
  if (!selector) return;
  selector.innerHTML = '';
  const fieldNames = Object.keys(upskillData);
  fieldNames.forEach(name => {
    const d = upskillData[name];
    const btn = document.createElement('button');
    btn.className = 'upskill-field-btn' + (activeUpskillField === name ? ' active' : '');
    btn.innerHTML = `<i class="ti ${d.icon}"></i><span>${name}</span>`;
    btn.onclick = () => selectUpskillField(name);
    selector.appendChild(btn);
  });
  if (activeUpskillField) renderUpskillField(activeUpskillField);
}

function selectUpskillField(name) {
  activeUpskillField = name;
  document.querySelectorAll('.upskill-field-btn').forEach(b => {
    b.classList.toggle('active', b.querySelector('span').textContent === name);
  });
  renderUpskillField(name);
}

function renderUpskillField(name) {
  const d = upskillData[name];
  if (!d) return;
  const progress = loadUpskillProgress();
  const fieldProgress = progress[name] || {};

  document.getElementById('upskill-empty').style.display = 'none';
  document.getElementById('upskill-content').style.display = 'block';

  document.getElementById('upskill-field-header').innerHTML = `
    <i class="ti ${d.icon}" style="color:${d.color};font-size:18px"></i>
    <div>
      <div class="upskill-field-name">${name}</div>
      <div class="upskill-field-intro">${d.intro}</div>
    </div>`;

  const totalResources = d.skills.reduce((sum, s) => sum + s.resources.length, 0);
  const completedResources = Object.values(fieldProgress).filter(Boolean).length;
  const pct = totalResources ? Math.round((completedResources / totalResources) * 100) : 0;
  document.getElementById('upskill-progress-label').textContent = `${completedResources} of ${totalResources} resources completed`;
  document.getElementById('upskill-progress-fill').style.width = pct + '%';
  document.getElementById('upskill-progress-pct').textContent = pct + '%';

  const container = document.getElementById('upskill-skill-blocks');
  container.innerHTML = '';
  d.skills.forEach((skillBlock, si) => {
    const block = document.createElement('div');
    block.className = 'upskill-skill-block';
    const resourcesHtml = skillBlock.resources.map((r, ri) => {
      const key = `${name}__${si}__${ri}`;
      const done = !!fieldProgress[key];
      const typeClass = r.type === 'Free' ? 'res-free' : 'res-paid';
      return `
        <div class="upskill-resource ${done ? 'done' : ''}" id="upskill-res-${si}-${ri}">
          <label class="upskill-check-label">
            <input type="checkbox" class="upskill-checkbox" ${done ? 'checked' : ''}
              onchange="toggleUpskillItem('${name}',${si},${ri},this.checked)">
            <span class="upskill-checkmark"></span>
          </label>
          <div class="upskill-res-body">
            <div class="upskill-res-top">
              <span class="upskill-res-badge ${typeClass}">${r.type}</span>
              <span class="upskill-res-badge badge-type">${r.badge}</span>
            </div>
            <a href="${r.url}" target="_blank" rel="noopener" class="upskill-res-link">${r.label} <i class="ti ti-external-link" style="font-size:10px"></i></a>
          </div>
        </div>`;
    }).join('');

    block.innerHTML = `
      <div class="upskill-skill-header">
        <div class="upskill-skill-name"><i class="ti ti-target" style="color:${d.color}"></i> ${skillBlock.skill}</div>
        <div class="upskill-skill-why">${skillBlock.why}</div>
      </div>
      <div class="upskill-resources">${resourcesHtml}</div>`;
    container.appendChild(block);
  });
}

function toggleUpskillItem(fieldName, si, ri, checked) {
  const progress = loadUpskillProgress();
  if (!progress[fieldName]) progress[fieldName] = {};
  const key = `${fieldName}__${si}__${ri}`;
  progress[fieldName][key] = checked;
  saveUpskillProgress(progress);
  // update row style
  const resEl = document.getElementById(`upskill-res-${si}-${ri}`);
  if (resEl) resEl.classList.toggle('done', checked);
  // recount progress bar
  const d = upskillData[fieldName];
  const fieldProgress = progress[fieldName];
  const totalResources = d.skills.reduce((sum, s) => sum + s.resources.length, 0);
  const completedResources = Object.values(fieldProgress).filter(Boolean).length;
  const pct = Math.round((completedResources / totalResources) * 100);
  document.getElementById('upskill-progress-label').textContent = `${completedResources} of ${totalResources} resources completed`;
  document.getElementById('upskill-progress-fill').style.width = pct + '%';
  document.getElementById('upskill-progress-pct').textContent = pct + '%';

  // CV Auto-update (add certification/skill to CV skills list)
  if (cvUploaded && cvData) {
    const resource = d.skills[si].resources[ri];
    const courseName = resource.label;
    if (!cvData.skills) cvData.skills = [];
    
    if (checked) {
      if (!cvData.skills.includes(courseName)) {
        cvData.skills.push(courseName);
      }
    } else {
      cvData.skills = cvData.skills.filter(s => s !== courseName);
    }
    
    if (typeof persistCV === 'function') persistCV();
    if (typeof renderProfile === 'function') renderProfile();
    if (typeof renderFieldList === 'function') renderFieldList();
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    const user = Auth.getCurrentUser();
    const session = Auth.getSession();
    if (user) enterApp({ name: user.name, email: user.email, role: session?.role || 'candidate' });
  }
  document.addEventListener('click', e => {
    if (e.target.id === 'cv-modal') closeCVModal();
    if (e.target.id === 'cand-cv-modal') closeCandModal();
  });
});
