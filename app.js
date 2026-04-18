import { auth, db, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, doc, getDoc, setDoc, updateDoc, serverTimestamp }
  from './firebase.js';

// ── STATE ──────────────────────────────────────────────────────────────────
export let currentUser = null;
export let userProfile  = null;

// ── AUTH ───────────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await ensureUserProfile(result.user);
    closeAuthModal();
    showToast('✓ Signed in!', 'success');
  } catch (e) {
    console.error(e);
    showToast('Sign-in failed', 'error');
  }
}

export async function logOut() {
  await signOut(auth);
  currentUser  = null;
  userProfile  = null;
  updateNavUI(null);
  showToast('Signed out', 'info');
}

async function ensureUserProfile(user) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:          user.uid,
      name:         user.displayName || 'Learner',
      email:        user.email,
      photoURL:     user.photoURL || null,
      points:       0,
      streak:       0,
      lastQuizDate: null,
      completed:    {},       // { ann: true, cnn: true, ... }
      joinedAt:     serverTimestamp()
    });
  }
}

export async function fetchUserProfile(uid) {
  const ref  = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// ── NAV UI ─────────────────────────────────────────────────────────────────
function updateNavUI(user, profile) {
  const btnSign   = document.getElementById('btn-signin');
  const btnOut    = document.getElementById('btn-signout');
  const navStreak = document.getElementById('nav-streak');
  const navPts    = document.getElementById('nav-points');

  if (user) {
    // User is signed in — hide sign-in button immediately
    btnSign && (btnSign.style.display = 'none');
    btnOut  && (btnOut.style.display  = 'inline-flex');
    // Show streak/points only if profile data is available
    if (profile) {
      if (navStreak) {
        navStreak.textContent  = `🔥 ${profile.streak || 0}`;
        navStreak.style.display = 'inline';
      }
      if (navPts) {
        navPts.textContent  = `⚡ ${profile.points || 0} pts`;
        navPts.style.display = 'inline';
      }
    }
  } else {
    // Not signed in
    btnSign  && (btnSign.style.display   = 'inline-flex');
    btnOut   && (btnOut.style.display    = 'none');
    navStreak && (navStreak.style.display = 'none');
    navPts   && (navPts.style.display   = 'none');
  }
}

// ── AUTH MODAL ─────────────────────────────────────────────────────────────
export function openAuthModal() {
  document.getElementById('auth-modal')?.classList.add('show');
}

export function closeAuthModal() {
  document.getElementById('auth-modal')?.classList.remove('show');
}

// ── TOAST ──────────────────────────────────────────────────────────────────
export function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── ACTIVE NAV LINK ────────────────────────────────────────────────────────
function markActiveNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop();
    if (href === path) a.classList.add('active');
  });
}

// ── INIT ───────────────────────────────────────────────────────────────────
export function initApp(onUser) {
  markActiveNav();

  // Sign-in button
  document.getElementById('btn-signin')?.addEventListener('click', openAuthModal);
  document.getElementById('btn-signout')?.addEventListener('click', logOut);
  document.getElementById('btn-google-signin')?.addEventListener('click', signInWithGoogle);
  document.getElementById('modal-close')?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal')?.addEventListener('click', e => {
    if (e.target.id === 'auth-modal') closeAuthModal();
  });

  onAuthStateChanged(auth, async user => {
    currentUser = user;
    if (user) {
      // Immediately hide sign-in button — don't wait for profile fetch
      updateNavUI(user, null);
      // Then fetch profile and update nav with streak/points
      userProfile = await fetchUserProfile(user.uid);
      updateNavUI(user, userProfile);
    } else {
      userProfile = null;
      updateNavUI(null, null);
    }
    onUser && onUser(user, userProfile);
  });
}
