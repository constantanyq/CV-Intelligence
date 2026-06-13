// ══ app-auth.js — Auth UI, form validation, API key management ══
// ── App state ──
let cvUploaded = false;
let cvData = null;
let enhancedData = null;
let timelineData = null;

let activeFieldIdx = null;

const SAMPLE_CV = `Alex Tan Wei Ming
alex.tan@email.com · +60 12-345 6789 · Kuala Lumpur, Malaysia

EDUCATION
Bachelor of Computer Science (Hons) — Data Science
National University of Singapore · 2020 – 2024 · CGPA 3.7 / 4.0

OBJECTIVE
I am looking for a job in data science or software engineering because I just graduated and need to start earning money. I am a quick learner and a hard worker.

EDUCATION

NUS
Degree: Computer Science (Data Science major)
Dates: 2020 to 2024
GPA: Pretty good, got a 3.7.

EXPERIENCE

Shopee Intern (2023)
- Worked on the recommendation engine database.
- Helped out the senior team members with basic stuff whenever they asked.
- Used Python and SQL for various daily tasks.
- Did a task that was meant to improve the CTR (click-through rate) on the app.

Vortex Systems Software Intern (2023)
- Helped with APIs.
- Did some database stuff like query optimizations when things were running slow.
- Attended weekly meetings.

PROJECTS
- My Final Year Project * Did a sentiment analysis project for my final year.
- I used BERT for it.
- The professors liked it and I received an A grade for the project.

SKILLS
- Computers
- Coding (Python, SQL)
- Machine Learning stuff
- PyTorch
- Pandas
- Git
- Tableau
- React (basic level)

OTHER ACHIEVEMENTS
- Won 1st place at a datathon in NUS back in 2023. There were a lot of teams there (around 42).
- Got onto the Dean's List for the academic year 2022/2023.`

// ── Auth UI ──
function showAuthForm(which) {
    document.getElementById('auth-login').classList.toggle('active', which === 'login');
    document.getElementById('auth-signup').classList.toggle('active', which === 'signup');
    if (which === 'signup') clearAuthError('login-error');
    if (which === 'login') clearAuthError('signup-error');
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    btn.innerHTML = isPassword ? '<i class="ti ti-eye-off"></i>' : '<i class="ti ti-eye"></i>';
}

function checkPasswordStrength(password) {
    const el = document.getElementById('pw-strength');
    if (!password) { el.innerHTML = ''; return; }
    const errors = Auth.validatePassword(password);
    if (!errors.length) {
        el.innerHTML = '<span class="pw-ok"><i class="ti ti-check"></i> Strong password</span>';
    } else {
        el.innerHTML = '<span class="pw-weak">Needs: ' + errors.join(', ') + '</span>';
    }
}

function showAuthError(id, msg) {
    const el = document.getElementById(id);
    el.textContent = msg;
    el.style.display = 'block';
    // Reset to default error styling in case it was previously shown as success
    el.style.background = '';
    el.style.borderColor = '';
    el.style.color = '';
}

function clearAuthError(id) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = '';
        el.style.display = 'none';
        el.style.background = '';
        el.style.borderColor = '';
        el.style.color = '';
    }
    const successEl = document.getElementById('login-success');
    if (successEl) {
        successEl.textContent = '';
        successEl.style.display = 'none';
    }
}

// Client-side login validation (pattern from COMP1044 login form)
function validateLoginForm() {
    clearAuthError('login-error');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email) {
        showAuthError('login-error', 'Please enter your email.');
        document.getElementById('login-email').focus();
        return false;
    }
    if (!password) {
        showAuthError('login-error', 'Please enter your password.');
        document.getElementById('login-password').focus();
        return false;
    }
    return true;
}

function validateSignupForm() {
    clearAuthError('signup-error');
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!name) {
        showAuthError('signup-error', 'Please enter your full name.');
        return false;
    }
    if (!email) {
        showAuthError('signup-error', 'Please enter your email.');
        return false;
    }
    if (!password) {
        showAuthError('signup-error', 'Please enter a password.');
        return false;
    }
    if (password !== confirm) {
        showAuthError('signup-error', 'Passwords do not match.');
        return false;
    }
    return true;
}

async function handleLogin(e) {
    e.preventDefault();
    if (!validateLoginForm()) return;

    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    const result = await Auth.login(
        document.getElementById('login-email').value,
        document.getElementById('login-password').value,
        'candidate'
    );
    btn.disabled = false;
    if (!result.ok) {
        showAuthError('login-error', result.error);
        return;
    }
    enterApp(result.user);
}

async function handleSignup(e) {
    e.preventDefault();
    if (!validateSignupForm()) return;
    const email = document.getElementById('signup-email').value;
    const btn = document.getElementById('signup-btn');
    btn.disabled = true;
    const result = await Auth.signup(
        document.getElementById('signup-name').value,
        email,
        document.getElementById('signup-password').value
    );
    btn.disabled = false;
    if (!result.ok) {
        showAuthError('signup-error', result.error);
        return;
    }
    // Reset signup form and redirect back to sign-in
    document.getElementById('signup-form').reset();
    document.getElementById('pw-strength').innerHTML = '';
    showAuthForm('login');
    document.getElementById('login-email').value = email;
    showAuthSuccess('login-success', '✓ Account created — sign in to continue.');
}

function showAuthSuccess(id, msg) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = msg;
        el.style.display = 'block';
    }
}

function handleLogout() {
    Auth.logout();
    cvUploaded = false;
    cvData = null;
    enhancedData = null;
    timelineData = null;
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('login-form').reset();

    // Clear any existing alerts
    clearAuthError('login-error');
    clearAuthError('signup-error');
}

function enterApp(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-greeting').textContent = user.name.split(' ')[0];
    const role = user.role || Auth.getSession()?.role || 'candidate';
    switchPortal(role);
    loadPersistedCV();
    renderFieldList();
    filterJobs();
    updateJobBadges();

    if (role === 'employer') {
        eNav('post');
    } else {
        cNav('profile');
    }
}