/* Career OS — Job listings */

const JOBS = [
  {
    id: 'j1',
    title: 'Junior Data Analyst',
    company: 'Grab',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 4,500 – 6,000/mo',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'A/B testing'],
    fit: 92,
    posted: '2 days ago',
    desc: 'Support product analytics for ride-hailing demand forecasting. Work with cross-functional teams to translate data into actionable insights.'
  },
  {
    id: 'j2',
    title: 'ML Engineer (Junior)',
    company: 'Shopee',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 5,500 – 8,000/mo',
    skills: ['Python', 'PyTorch', 'MLOps', 'Docker', 'SQL'],
    fit: 87,
    posted: '1 week ago',
    desc: 'Join the recommendation systems team. Deploy and monitor ML models at scale serving 50M+ daily users across SEA.'
  },
  {
    id: 'j3',
    title: 'Business Intelligence Analyst',
    company: 'Maybank',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    salary: 'MYR 5,000 – 7,500/mo',
    skills: ['SQL', 'Power BI', 'Data modelling', 'Excel', 'Banking domain'],
    fit: 80,
    posted: '3 days ago',
    desc: 'Build dashboards and reports for retail banking product performance. Partner with business stakeholders on KPI tracking.'
  },
  {
    id: 'j4',
    title: 'Data Engineer',
    company: 'Gojek',
    location: 'Jakarta',
    type: 'Full-time',
    salary: 'IDR 15 – 22M/mo',
    skills: ['Python', 'Spark', 'Airflow', 'AWS', 'SQL'],
    fit: 74,
    posted: '5 days ago',
    desc: 'Design and maintain data pipelines for the logistics platform. Ensure data quality and reliability for downstream analytics.'
  },
  {
    id: 'j5',
    title: 'Product Analyst',
    company: 'Sea Group',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 5,000 – 7,500/mo',
    skills: ['SQL', 'Python', 'Product analytics', 'Experimentation', 'Communication'],
    fit: 78,
    posted: '1 day ago',
    desc: 'Drive product decisions through data. Design and analyse A/B tests for Garena and Shopee product lines.'
  },
  {
    id: 'j6',
    title: 'Full Stack Developer',
    company: 'Carousell',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 5,000 – 8,500/mo',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'REST APIs'],
    fit: 68,
    posted: '4 days ago',
    desc: 'Build features for the marketplace platform. Work across the stack from React frontends to Node.js microservices.'
  },
  {
    id: 'j7',
    title: 'Data Science Intern',
    company: 'Lazada',
    location: 'Kuala Lumpur',
    type: 'Internship',
    salary: 'MYR 2,500 – 3,500/mo',
    skills: ['Python', 'Machine learning', 'SQL', 'Pandas', 'Statistics'],
    fit: 95,
    posted: '6 days ago',
    desc: '6-month internship on the search ranking team. Apply ML techniques to improve product discovery and conversion.'
  },
  {
    id: 'j8',
    title: 'Cloud Solutions Architect (Associate)',
    company: 'AWS',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 7,000 – 10,000/mo',
    skills: ['AWS', 'Cloud architecture', 'Python', 'DevOps', 'Communication'],
    fit: 55,
    posted: '2 weeks ago',
    desc: 'Help enterprise customers in SEA design cloud-native solutions. Requires strong technical depth and client-facing skills.'
  },
  {
    id: 'j9',
    title: 'Quantitative Analyst',
    company: 'DBS Bank',
    location: 'Singapore',
    type: 'Full-time',
    salary: 'SGD 6,500 – 9,500/mo',
    skills: ['Python', 'Statistics', 'Financial modelling', 'R', 'Risk analysis'],
    fit: 62,
    posted: '1 week ago',
    desc: 'Develop models for market risk and portfolio analytics. Strong quantitative background required.'
  },
  {
    id: 'j10',
    title: 'Technical Product Manager',
    company: 'Funding Societies',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    salary: 'MYR 7,000 – 12,000/mo',
    skills: ['Product management', 'SQL', 'Agile', 'Stakeholder management', 'Fintech'],
    fit: 66,
    posted: '3 days ago',
    desc: 'Own the lending platform roadmap. Bridge engineering and business teams in a fast-growing fintech startup.'
  }
];

function searchJobs(query, filters = {}) {
  const q = (query || '').toLowerCase().trim();
  return JOBS.filter(job => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.type && job.type !== filters.type) return false;

    if (!q) return true;
    const haystack = [
      job.title, job.company, job.location, job.type,
      job.salary, job.desc, ...job.skills
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}

function renderJobCard(job, opts = {}) {
  const { saved = false, applied = false, mode = 'list' } = opts;
  const fitClass = job.fit >= 85 ? 'fit-high' : job.fit >= 70 ? 'fit-med' : 'fit-low';

  let actions = '';
  if (mode === 'saved') {
    actions = `
      <button class="btn sm" onclick="unsaveJob('${job.id}')"><i class="ti ti-bookmark-off"></i> Remove</button>
      ${applied
        ? '<button class="btn sm applied" disabled><i class="ti ti-check"></i> Applied</button>'
        : `<button class="btn sm primary" onclick="applyToJob('${job.id}')"><i class="ti ti-send"></i> Apply</button>`}`;
  } else {
    actions = `
      ${saved
        ? '<button class="btn sm saved" disabled><i class="ti ti-bookmark-filled"></i> Saved</button>'
        : `<button class="btn sm" onclick="saveJob('${job.id}')"><i class="ti ti-bookmark"></i> Save</button>`}
      ${applied
        ? '<button class="btn sm applied" disabled><i class="ti ti-check"></i> Applied</button>'
        : `<button class="btn sm primary" onclick="applyToJob('${job.id}')"><i class="ti ti-send"></i> Apply</button>`}`;
  }

  return `
    <div class="job-card" data-id="${job.id}">
      <div class="job-card-header">
        <div class="job-card-icon"><i class="ti ti-briefcase"></i></div>
        <div class="job-card-info">
          <div class="job-card-title">${job.title}</div>
          <div class="job-card-meta">${job.company} · ${job.location} · ${job.type}</div>
        </div>
        <div class="job-fit-badge ${fitClass}">${job.fit}% fit</div>
      </div>
      <div class="job-card-salary"><i class="ti ti-currency-dollar"></i> ${job.salary}</div>
      <div class="job-card-desc">${job.desc}</div>
      <div class="job-card-skills">
        ${job.skills.map(s => `<span class="job-skill-chip">${s}</span>`).join('')}
      </div>
      <div class="job-card-footer">
        <span class="job-posted">${job.posted}</span>
        <div class="job-card-actions">${actions}</div>
      </div>
    </div>`;
}

function renderJobList(jobs, containerId, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!jobs.length) {
    if (containerId === 'saved-jobs-list') return;
    el.innerHTML = '<div class="empty-state"><i class="ti ti-search-off"></i><p>No jobs match your search. Try different keywords.</p></div>';
    return;
  }
  el.innerHTML = jobs.map(j => renderJobCard(j, opts[j.id] || opts)).join('');
}
