/* Career OS — Secure client-side auth (localStorage, PBKDF2) */

const Auth = (() => {
  const USERS_KEY = 'careeros_users';
  const SESSION_KEY = 'careeros_session';
  const LOCKOUT_KEY = 'careeros_lockout';
  const PBKDF2_ITERATIONS = 120000;
  const SESSION_HOURS = 24;
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 15;

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function toBase64(buf) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)));
  }

  function fromBase64(str) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0));
  }

  async function hashPassword(password, saltB64) {
    const enc = new TextEncoder();
    const salt = saltB64 ? fromBase64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
      keyMaterial, 256
    );
    return { hash: toBase64(bits), salt: toBase64(salt) };
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
    if (!/[0-9]/.test(password)) errors.push('One number');
    return errors;
  }

  function getLockout(email) {
    try {
      const data = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
      return data[email.toLowerCase()] || { attempts: 0, lockedUntil: 0 };
    } catch {
      return { attempts: 0, lockedUntil: 0 };
    }
  }

  function setLockout(email, data) {
    const all = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
    all[email.toLowerCase()] = data;
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(all));
  }

  function clearLockout(email) {
    const all = JSON.parse(localStorage.getItem(LOCKOUT_KEY) || '{}');
    delete all[email.toLowerCase()];
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(all));
  }

  function isLockedOut(email) {
    const lock = getLockout(email);
    if (lock.lockedUntil > Date.now()) {
      const mins = Math.ceil((lock.lockedUntil - Date.now()) / 60000);
      return { locked: true, minutes: mins };
    }
    if (lock.lockedUntil && lock.lockedUntil <= Date.now()) {
      clearLockout(email);
    }
    return { locked: false };
  }

  function recordFailedAttempt(email) {
    const lock = getLockout(email);
    lock.attempts = (lock.attempts || 0) + 1;
    if (lock.attempts >= MAX_ATTEMPTS) {
      lock.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
      lock.attempts = 0;
    }
    setLockout(email, lock);
    const remaining = MAX_ATTEMPTS - (lock.attempts || 0);
    return remaining > 0 ? remaining : 0;
  }

  async function signup(name, email, password) {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { ok: false, error: 'Please enter your full name.' };
    }
    if (!validateEmail(trimmedEmail)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    const pwErrors = validatePassword(password);
    if (pwErrors.length) {
      return { ok: false, error: 'Password must have: ' + pwErrors.join(', ') + '.' };
    }

    const users = getUsers();
    if (users.find(u => u.email === trimmedEmail)) {
      return { ok: false, error: 'An account with this email already exists.' };
    }

    const { hash, salt } = await hashPassword(password);
    users.push({
      id: crypto.randomUUID(),
      name: trimmedName,
      email: trimmedEmail,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
    return { ok: true };
  }

  async function login(email, password, role) {
    const trimmedEmail = email.trim().toLowerCase();
    const loginRole = role === 'employer' ? 'employer' : 'candidate';

    const lockStatus = isLockedOut(trimmedEmail);
    if (lockStatus.locked) {
      return { ok: false, error: `Too many failed attempts. Try again in ${lockStatus.minutes} minute(s).` };
    }

    const users = getUsers();
    const user = users.find(u => u.email === trimmedEmail);
    if (!user) {
      recordFailedAttempt(trimmedEmail);
      return { ok: false, error: 'Invalid email or password.' };
    }

    const { hash } = await hashPassword(password, user.salt);
    if (hash !== user.passwordHash) {
      const remaining = recordFailedAttempt(trimmedEmail);
      if (remaining === 0) {
        return { ok: false, error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` };
      }
      return { ok: false, error: `Invalid email or password. ${remaining} attempt(s) remaining.` };
    }

    clearLockout(trimmedEmail);
    const session = {
      token: crypto.randomUUID(),
      userId: user.id,
      email: user.email,
      name: user.name,
      role: loginRole,
      expiresAt: Date.now() + SESSION_HOURS * 60 * 60 * 1000
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, user: { id: user.id, name: user.name, email: user.email, role: loginRole } };
  }

  function getSession() {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      if (!session || session.expiresAt < Date.now()) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users.find(u => u.id === session.userId) || null;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function isAuthenticated() {
    return !!getSession();
  }

  return { signup, login, logout, getSession, getCurrentUser, isAuthenticated, validatePassword };
})();
