  // /js/app.js

// ---- Theme toggle (kept here as page behavior) ----
(function initThemeToggle(){
  var btn = document.getElementById('themeToggle');
  if (!btn) return;
  var root = document.documentElement;
  var saved = localStorage.getItem('theme');
  if (saved) btn.setAttribute('aria-pressed', saved === 'light');

  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? '' : 'light';
    if (next) root.setAttribute('data-theme', next);
    else root.removeAttribute('data-theme');
    localStorage.setItem('theme', next);
    btn.setAttribute('aria-pressed', next === 'light');
  });
})();

// ---- Renderers ----
function renderHero(intro, contact){
  var el = document.getElementById('hero'); if(!el) return;
  var email = assembleEmail(contact.email);
  var chips = (intro.chips||[]).map(function(c){ return '<span class="chip">'+escapeHTML(c)+'</span>'; }).join('');

  var buttons = [
    '<a class="btn primary" href="'+escapeHTML(intro.cvPath)+'" target="_blank" rel="noopener"><span class="icon mail" aria-hidden="true"></span> Download CV</a>',
    '<button class="btn" id="copyEmail"><span class="icon mail" aria-hidden="true"></span> Copy Email</button>',
    '<a class="btn" id="mailLink" href="mailto:'+email+'"><span class="icon mail" aria-hidden="true"></span> Email Me</a>'
  ].join('');

  el.innerHTML =
  '<h1>'+escapeHTML(intro.headline)+'</h1>'+
  (intro.subtitle ? '<p class="tagline muted">'+escapeHTML(intro.subtitle)+'</p>' : '')+
  '<p class="lead hero-lead">'+escapeHTML(intro.summary)+'</p>'+
  '<div class="row mt-20">'+buttons+'</div>'+
  (chips ? '<div class="stack hero-chips">'+chips+'</div>' : '');

  // Copy handler
  var copyBtn = document.getElementById('copyEmail');
  if(copyBtn){
    copyBtn.addEventListener('click', function(e){
      navigator.clipboard.writeText(email).then(function(){
        var b = e.currentTarget;
        b.textContent = 'Copied!';
        setTimeout(function(){ b.innerHTML = '<span class="icon mail" aria-hidden="true"></span> Copy Email'; }, 1200);
      });
    });
  }
}

function renderExperience(items){
  var el = document.getElementById('experienceGrid'); if(!el) return;
  el.innerHTML = (items||[]).map(function(job){
    return [
      '<article class="card">',
        '<h3>'+escapeHTML(job.role)+(job.company ? ' - '+escapeHTML(job.company) : '')+'</h3>',
        '<p class="muted">'+fmtDate(job.start)+' – '+fmtDate(job.end)+' · '+escapeHTML(job.location||'')+'</p>',
        (job.summary ? '<p>'+escapeHTML(job.summary)+'</p>' : ''),
        (Array.isArray(job.highlights)? '<ul>'+job.highlights.map(function(h){return '<li>'+escapeHTML(h)+'</li>';}).join('')+'</ul>' : ''),
        (Array.isArray(job.tags)? '<div class="stack">'+job.tags.map(function(t){return '<span class="chip">'+escapeHTML(t)+'</span>';}).join('')+'</div>' : ''),
      '</article>'
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

function renderCertifications(list){
  var wrap = document.getElementById('certsStack');
  if (!wrap) return;

  function certChip(c){
    var label = escapeHTML(c.label || '');
    var date  = c.date ? escapeHTML(c.date) : '';
    var inner =
      '<span class="label">'+label+'</span>'+
      (date ? '<span class="meta">'+date+'</span>' : '');

    if (c.url && c.url.trim()){
      return '<a class="chip chip-cert" href="'+escapeHTML(c.url)+'" target="_blank" rel="noopener" aria-label="'+label+(date?(' ('+date+')'):'')+'">'+inner+'</a>';
    }
    return '<span class="chip chip-cert" aria-label="'+label+(date?(' ('+date+')'):'')+'">'+inner+'</span>';
  }

  wrap.innerHTML = (list || []).map(certChip).join('');
}

  wrap.innerHTML = (list || []).map(function(c){
    var hasUrl = c.url && c.url.trim();
    return chipHTML(c, !!hasUrl);
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
