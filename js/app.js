import { escapeHTML, decodeB64, formatDate, inViewReveal, copyToClipboard } from './utils.js';

async function loadContent(){
  const url = `/data/content.json?v=${Date.now()}`;
  const res = await fetch(url, {cache:'no-store'});
  if (!res.ok) throw new Error('Failed to load content.json');
  return res.json();
}

function assembleEmail(emailObj){
  const local = decodeB64(emailObj?.local_b64);
  const domain = decodeB64(emailObj?.domain_b64);
  return (local && domain) ? `${local}@${domain}` : '';
}

function pickHeroChips(skills){
  // Flatten first few skills across groups for the hero chips (up to 5)
  const out = [];
  Object.values(skills || {}).forEach(arr => {
    (arr || []).forEach(s => { if (out.length < 5) out.push(s); });
  });
  return out;
}

/* ---------- Renderers ---------- */
function renderHero(profile, skills){
  const hero = document.getElementById('hero'); if (!hero) return;
  const email = assembleEmail(profile.email);
  const chips = pickHeroChips(skills);

  hero.innerHTML = `
    <h1>${escapeHTML(profile.headline || 'Designing safe, reliable control systems for gas turbines')}</h1>
    <p class="lead">${escapeHTML(profile.summary || '')}</p>
    <div class="row mt-20">
      <a class="btn primary" href="${escapeHTML(profile.cvPath || '#')}" target="_blank" rel="noopener">Download CV</a>
      <button class="btn" id="copyEmailBtn">Copy Email</button>
      <a class="btn" id="mailtoBtn" href="${email ? `mailto:${email}` : '#'}">Email Me</a>
    </div>
    ${chips.length ? `<div class="stack">${chips.map(c=>`<span class="chip">${escapeHTML(c)}</span>`).join('')}</div>` : ''}
  `;

  // actions
  const copyBtn = document.getElementById('copyEmailBtn');
  if (copyBtn && email){
    copyBtn.addEventListener('click', async () => {
      const ok = await copyToClipboard(email);
      copyBtn.textContent = ok ? 'Copied!' : 'Copy failed';
      copyBtn.style.borderColor = ok ? 'var(--ok)' : 'var(--warn)';
      setTimeout(()=>{ copyBtn.textContent='Copy Email'; copyBtn.style.borderColor='var(--line)'; }, 1200);
    });
  }
}

function renderExperience(list){
  const mount = document.getElementById('experience-list'); if (!mount) return;
  const cards = (list || []).map(item => {
    const start = formatDate(item.start);
    const end = item.end ? formatDate(item.end) : '';
    const when = `${start}${end ? ' — ' + end : ''}`;
    const tags = (item.tags || []).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join('');
    const highlights = (item.highlights || []).map(h => `<li>${escapeHTML(h)}</li>`).join('');
    return `
      <article class="card">
        <h3>${escapeHTML(item.role || '')} — ${escapeHTML(item.company || '')}</h3>
        <p class="muted">${escapeHTML(item.location || '')}${item.location ? ' · ' : ''}${escapeHTML(when)}</p>
        <ul>${highlights}</ul>
        ${tags ? `<div class="stack mt-20">${tags}</div>` : ''}
      </article>
    `;
  }).join('');
  mount.innerHTML = cards;
}

function renderProjects(list){
  const mount = document.getElementById('projects-grid'); if (!mount) return;
  const cards = (list || []).map(p => {
    const tags = (p.tags || []).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join('');
    const links = [];
    if (p.links?.github) links.push(`<a class="btn" href="${escapeHTML(p.links.github)}" target="_blank" rel="noopener">Code</a>`);
    if (p.links?.demo) links.push(`<a class="btn" href="${escapeHTML(p.links.demo)}" target="_blank" rel="noopener">Demo</a>`);
    return `
      <article class="card">
        <h3>${escapeHTML(p.name || '')}</h3>
        ${p.blurb ? `<p class="muted">${escapeHTML(p.blurb)}</p>` : ''}
        ${tags ? `<div class="stack mt-20">${tags}</div>` : ''}
        ${links.length ? `<div class="row mt-20">${links.join('')}</div>` : ''}
      </article>
    `;
  }).join('');
  mount.innerHTML = cards;
}

function renderSkills(groups){
  const mount = document.getElementById('skills-list'); if (!mount) return;
  const cards = Object.entries(groups || {}).map(([group, items]) => `
    <div class="card">
      <h3>${escapeHTML(group)}</h3>
      <ul>${(items||[]).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>
    </div>
  `).join('');
  mount.innerHTML = cards;
}

function renderContact(profile, contact){
  const mount = document.getElementById('contact-block'); if (!mount) return;
  const email = assembleEmail(profile.email);
  const buttons = contact?.buttons || ['copy','mailto','linkedin'];
  const btns = [];

  if (buttons.includes('copy')){
    btns.push(`<button class="btn primary" id="copyEmailBtn2">Copy Email</button>`);
  }
  if (buttons.includes('mailto')){
    btns.push(`<a class="btn" id="mailtoBtn2" href="${email ? `mailto:${email}` : '#'}">Open Email App</a>`);
  }
  if (buttons.includes('linkedin') && profile.links?.linkedin){
    btns.push(`<a class="btn" href="${escapeHTML(profile.links.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`);
  }

  mount.innerHTML = `
    <p class="lead">${escapeHTML(contact?.cta || 'Reach out by email anytime.')}</p>
    <div class="row mt-20">${btns.join('')}</div>
    <p class="muted mt-20">This site ships no trackers; email is lightly obfuscated to reduce scraping.</p>
  `;

  const copy2 = document.getElementById('copyEmailBtn2');
  if (copy2 && email){
    copy2.addEventListener('click', async () => {
      const ok = await copyToClipboard(email);
      copy2.textContent = ok ? 'Copied!' : 'Copy failed';
      copy2.style.borderColor = ok ? 'var(--ok)' : 'var(--warn)';
      setTimeout(()=>{ copy2.textContent='Copy Email'; copy2.style.borderColor='var(--line)'; }, 1200);
    });
  }
}

/* ---------- Bootstrap ---------- */
(async function init(){
  try{
    const data = await loadContent();
    renderHero(data.profile, data.skills);
    renderExperience(data.experience);
    renderProjects(data.projects);
    renderSkills(data.skills);
    renderContact(data.profile, data.contact);
    inViewReveal();
  }catch(err){
    console.error(err);
    // Minimal fallback content if JSON fails
    const hero = document.getElementById('hero');
    if (hero) hero.innerHTML = `<p class="muted">Content failed to load.</p>`;
  }
})();
