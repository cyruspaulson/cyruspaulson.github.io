// Year in footer
(function setYear(){ const y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear(); })();

// Theme toggle with localStorage
(function themeToggle(){
  const btn = document.getElementById('themeToggle'); if (!btn) return;
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);
  btn.setAttribute('aria-pressed', saved === 'light' ? 'true' : 'false');
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (next) root.setAttribute('data-theme', next); else root.removeAttribute('data-theme');
    localStorage.setItem('theme', next);
    btn.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
  });
})();

// Minimal HTML escape for text nodes
export function escapeHTML(str=''){
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Base64 decode
export function decodeB64(b){ try { return atob(b || ''); } catch { return ''; } }

// Format "YYYY-MM" or "present"
export function formatDate(s){
  if (!s) return '';
  if (s.toLowerCase && s.toLowerCase() === 'present') return 'Present';
  const [y,m] = s.split('-'); const date = new Date(Number(y), Number(m||'1')-1, 1);
  return date.toLocaleString(undefined, { month:'short', year:'numeric' });
}

// IntersectionObserver reveal
export function inViewReveal(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced){ document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); return; }
  if (!('IntersectionObserver' in window)){ document.querySelectorAll('.reveal').forEach(el => el.classList.add('in')); return; }
  const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); } }), {threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// Copy helper
export async function copyToClipboard(text){
  try { await navigator.clipboard.writeText(text); return true; } catch { return false; }
}
