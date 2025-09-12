// /js/app.js

// ---- Theme toggle (switch) ----
function initThemeToggle(){
  var root = document.documentElement;
  var btn  = document.getElementById('themeBtn');

  // Decide initial theme: saved -> system -> dark
  var saved = localStorage.getItem('theme');  // "light" or ""
  var initial = (saved !== null)
    ? saved
    : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : '');

  apply(initial);

  if (!btn) return;
  btn.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'light' ? '' : 'light';
    apply(next);
  });

  function apply(mode){
    if (mode === 'light') {
      root.setAttribute('data-theme','light');
      localStorage.setItem('theme','light');
      btn && btn.setAttribute('aria-label','Switch to dark theme');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme','');
      btn && btn.setAttribute('aria-label','Switch to light theme');
    }
  }
}

// ---- Renderers ----

// ---- Render hero (top section) ----
function renderHero(intro, contact){
  var el = document.getElementById('hero');
  if (!el || !intro) return;

  // email (obfuscated in contact.json)
  var email = contact && contact.email ? assembleEmail(contact.email) : '';

  // chips row
  var chipsHtml = (intro.chips || [])
    .map(function(c){ return '<span class="chip">'+escapeHTML(c)+'</span>'; })
    .join('');

  // optional file size under Resume tile (put "cvSize" in intro.json if you want it)
  var cvSizeText = intro.cvSize ? escapeHTML(intro.cvSize) : "";

  // CTA tiles (no permanent boxes; your CSS shows the box only on hover/active)
  var tiles =
    '<div class="hero-actions">' +

      // 1) Email me — primary tile
      (email ? (
        '<a class="tile primary" id="mailLink" href="mailto:'+email+'">' +
          '<span class="icon mail" aria-hidden="true"></span>' +
          '<span class="title">Email me</span>' +
        '</a>'
      ) : '') +

      // 2) Copy email — neutral tile
      (email ? (
        '<button class="tile" id="copyEmail" type="button">' +
          '<span class="icon copy" aria-hidden="true"></span>' +
          '<span class="title">Copy Email</span>' +
        '</button>'
      ) : '') +

      // 3) Resume PDF — neutral tile (+ size overlaid, not affecting layout)
      '<a class="tile resume" href="'+escapeHTML(intro.cvPath)+'" target="_blank" rel="noopener">' +
      '<span class="icon download" aria-hidden="true"></span>' +
      '<span class="title">Resume PDF</span>' +
      (cvSizeText ? '<span class="meta meta-overlay">'+cvSizeText+'</span>' : '') +
      '</a>' +
    '</div>';

  // Inject hero
  el.innerHTML =
    '<h1>'+escapeHTML(intro.headline)+'</h1>' +
    (intro.subtitle ? '<p class="tagline muted">'+escapeHTML(intro.subtitle)+'</p>' : '') +
    '<p class="lead hero-lead">'+escapeHTML(intro.summary)+'</p>' +
    tiles +
    (chipsHtml ? '<div class="stack hero-chips">'+chipsHtml+'</div>' : '');

  // Copy feedback → changes label to “Copied!” briefly
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn && email){
    copyBtn.addEventListener('click', function(){
      navigator.clipboard.writeText(email).then(function(){
        var title = copyBtn.querySelector('.title');
        var old = title.textContent;
        title.textContent = 'Copied!';
        copyBtn.classList.add('copied');      // optional if you style .tile.copied
        setTimeout(function(){
          title.textContent = old;
          copyBtn.classList.remove('copied');
        }, 1200);
      });
    });
  }
}

function renderExperience(items){
  var el = document.getElementById('experienceGrid'); if(!el) return;

  el.innerHTML = (items || []).map(function(job){
    return [
      '<article class="card">',

        // role
        '<h3>' + escapeHTML(job.role || '') + '</h3>' +

        // company • location (single line under role)
        ((job.company || job.location)
          ? '<p class="meta-line">' +
              (job.company ? '<span class="company"><em>' + escapeHTML(job.company) + '</em></span>' : '') +
              (job.company && job.location ? '<span class="dot"> · </span>' : '') +
              (job.location ? '<span class="location">' + escapeHTML(job.location) + '</span>' : '') +
            '</p>'
          : '')

        // dates line
        + '<p class="dates">' + fmtDate(job.start) + ' - ' + fmtDate(job.end) + '</p>'

        // optional one-line blurb
        + (job.summary ? '<p class="role-blurb">' + escapeHTML(job.summary) + '</p>' : '')

        // highlights (bullets)
        + (Array.isArray(job.highlights)
            ? '<ul>' + job.highlights.map(function(h){ return '<li>' + escapeHTML(h) + '</li>'; }).join('') + '</ul>'
            : '')

        // tags as chips
        + (Array.isArray(job.tags)
            ? '<div class="stack">' + job.tags.map(function(t){ return '<span class="chip">' + escapeHTML(t) + '</span>'; }).join('') + '</div>'
            : '')

      + '</article>'
    ].join('');
  }).join('');
}


function renderProjects(items){
  var el = document.getElementById('projectsGrid'); if(!el) return;
  el.innerHTML = (items||[]).map(function(p){
    return [
      '<article class="card">',
        '<h3>'+escapeHTML(p.name)+'</h3>',
        (p.blurb ? '<p class="muted">'+escapeHTML(p.blurb)+'</p>' : ''),
        (Array.isArray(p.tags)? '<div class="stack">'+p.tags.map(function(t){return '<span class="chip">'+escapeHTML(t)+'</span>';}).join('')+'</div>' : ''),
      '</article>'
    ].join('');
  }).join('');
}

function renderSkills(groups){
  var el = document.getElementById('skillsGrid'); if(!el) return;
  var html = Object.keys(groups||{}).map(function(group){
    var list = groups[group] || [];
    return [
      '<div class="card">',
        '<h3>'+escapeHTML(group)+'</h3>',
        '<ul>'+list.map(function(s){return '<li>'+escapeHTML(s)+'</li>';}).join('')+'</ul>',
      '</div>'
    ].join('');
  }).join('');
  el.innerHTML = html;
}

function renderCertifications(items){
  var el = document.getElementById('certificationsGrid');
  if (!el) return;

  var list = Array.isArray(items) ? items : [];

  el.innerHTML = list.map(function(c){
    var title   = c.label ? escapeHTML(c.label) : '';
    var issuer  = c.issuer ? escapeHTML(c.issuer) : '';          // optional in your JSON
    var date    = c.date   ? escapeHTML(c.date)   : '';
    var url     = c.url    ? String(c.url)        : '';

    var inner =
      '<div class="cert-title">' + title + '</div>' +
      (issuer ? '<div class="cert-issuer">' + issuer + '</div>' : '') +
      (date   ? '<div class="cert-date">'   + date   + '</div>' : '');

    if (url) {
      // Clickable card
      return '<a class="cert-card" href="' + url + '" target="_blank" rel="noopener">' + inner + '</a>';
    } else {
      // Static card
      return '<div class="cert-card">' + inner + '</div>';
    }
  }).join('');
}

function renderContact(contact){
  var el = document.getElementById('contactButtons'); if(!el) return;
  var links = contact.links || {};
  var email = assembleEmail(contact.email);

  var btns = (contact.primary_buttons||[]).map(function(btn){
    if (btn.type === 'copy-email'){
      return '<button class="btn js-copy-email"><span class="icon '+escapeHTML(btn.icon||'mail')+'" aria-hidden="true"></span> '+escapeHTML(btn.label||'Copy Email')+'</button>';
    } else if (btn.type === 'mailto'){
      return '<a class="btn" href="mailto:'+email+'"><span class="icon '+escapeHTML(btn.icon||'mail')+'" aria-hidden="true"></span> '+escapeHTML(btn.label||'Email Me')+'</a>';
    } else if (btn.type === 'link'){
      var href = links[btn.href_key] || '#';
      return '<a class="btn" href="'+escapeHTML(href)+'" target="_blank" rel="noopener"><span class="icon '+escapeHTML(btn.icon||'')+'" aria-hidden="true"></span> '+escapeHTML(btn.label||'Open')+'</a>';
    }
    return '';
  }).join('');

  el.innerHTML = btns;

  // Copy handler
  var copyBtn = el.querySelector('.js-copy-email');
  if(copyBtn){
    copyBtn.addEventListener('click', function(e){
      navigator.clipboard.writeText(email).then(function(){
        var b = e.currentTarget; var orig = b.textContent;
        b.textContent = 'Copied!';
        setTimeout(function(){ b.textContent = orig; }, 1200);
      });
    });
  }
}

// ---- Init ----
window.addEventListener('DOMContentLoaded', function(){
  setYearNow();
  initReveal();
  initThemeToggle();

  Promise.all([
    loadJSON('/data/intro.json'),
    loadJSON('/data/experience.json'),
    loadJSON('/data/projects.json'),
    loadJSON('/data/skills.json'),
    loadJSON('/data/contact.json'),
    loadJSON('/data/certifications.json')
  ]).then(function(res){
    var intro=res[0], experience=res[1], projects=res[2], skills=res[3], contact=res[4], certs=res[5];
    renderHero(intro, contact);
    renderExperience(experience);
    renderProjects(projects);
    renderSkills(skills);
    renderCertifications(certs);
    renderContact(contact);
  }).catch(function(err){
    console.error(err);
  });
});
