// /js/utils.js

// Shorthands
var $  = function(sel, root){ return (root||document).querySelector(sel); };
var $$ = function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); };

// HTML escape (safety)
function escapeHTML(s){ 
  s = (s==null?'':String(s));
  return s.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

// YYYY-MM -> "Mon YYYY" | null -> "Present"
function fmtDate(ym){
  if (!ym) return 'Present';
  var parts = String(ym).split('-');
  var y = parseInt(parts[0],10) || 1970;
  var m = (parseInt(parts[1],10) || 1) - 1;
  var d = new Date(y, m, 1);
  return d.toLocaleString(undefined, { month:'short', year:'numeric' });
}

// Base64 helpers for email
function b64(s){ try { return atob(s); } catch(e){ return ''; } }
function assembleEmail(obj){ return obj ? (b64(obj.local_b64) + '@' + b64(obj.domain_b64)) : ''; }

// Fetch JSON (no-cache so edits show up immediately)
function loadJSON(path){
  return fetch(path, { cache:'no-cache' }).then(function(res){
    if(!res.ok) throw new Error('Failed to load '+path);
    return res.json();
  });
}

// Intersection-based reveal
function initReveal(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced){ $$('.reveal').forEach(function(el){ el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting) e.target.classList.add('in'); });
  }, {threshold:0.12});
  $$('.reveal').forEach(function(el){ io.observe(el); });
}

// Footer year
function setYearNow(){
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}
