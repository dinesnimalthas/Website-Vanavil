/**
 * SC Vanavil Luzern - Main JavaScript
 */
// ========== PAGE LOADER ==========
(function () {
  const loader  = document.getElementById('vanavil-loader');
  const fill    = document.getElementById('loaderBarFill');
  const glow    = document.getElementById('loaderBarGlow');
  const pct     = document.getElementById('loaderPercent');
  if (!loader || !fill) return;

  let progress = 0;
  let done = false;

  function setProgress(val) {
    progress = Math.min(val, 100);
    fill.style.width = progress + '%';
    if (glow) glow.style.left = progress + '%';
    if (pct)  pct.textContent = Math.round(progress) + '%';
  }

  // Simulierter Fortschritt — zügig bis 80 %, dann bewusst langsamer
  const interval = setInterval(() => {
    if (done) return;
    const remaining = 88 - progress;
    if (remaining <= 0) return;
    setProgress(progress + remaining * 0.06 + 0.4);
  }, 80);

  // Mindestanzeigedauer: 1.2s — damit es nicht zu schnell wirkt
  const minDelay = new Promise(res => setTimeout(res, 1200));

  Promise.all([
    minDelay,
    new Promise(res => window.addEventListener('load', res))
  ]).then(() => {
    done = true;
    clearInterval(interval);
    // Balken springt flüssig auf 100 %
    fill.style.transition = 'width 0.35s cubic-bezier(.16,1,.3,1)';
    if (glow) glow.style.transition = 'left 0.35s cubic-bezier(.16,1,.3,1)';
    setProgress(100);
    setTimeout(() => loader.classList.add('hidden'), 450);
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCurrentYear();
  initAdminBar();
  initRevealObserver();
  
  // Initialize Firebase if available
  if (window.VanavilDB) {
    window.VanavilDB.init();
    
    // Check auth state for admin bar
    window.VanavilDB.onAuthStateChange((user) => {
      const adminBar = document.querySelector('.admin-bar');
      if (adminBar) {
        adminBar.classList.toggle('visible', !!user);
      }
    });

    // Load team photo into hero
    loadHeroTeamPhoto();
  }
});

async function loadHeroTeamPhoto() {
  const section = document.getElementById('teamPhotoSection');
  const img = document.getElementById('teamPhotoImg');
  const heroBg = document.getElementById('heroBgPhoto');
  const heroSection = document.getElementById('heroSection');
  if (!section || !img) return;
  try {
    const settings = await window.VanavilDB.getSettings();
    if (settings && settings.teamPhotoURL) {
      img.src = settings.teamPhotoURL;
      section.style.display = '';
      // Show team photo as hero background
      if (heroBg && heroSection) {
        heroBg.style.backgroundImage = 'url(' + settings.teamPhotoURL + ')';
        heroSection.classList.add('has-team-photo');
      }
      // Re-observe reveal elements inside the newly shown section
      section.querySelectorAll('.reveal').forEach(el => {
        if (window._revealObserver) window._revealObserver.observe(el);
      });
    }
  } catch (e) {
    // no team photo set yet
  }
}

// ========== NAVIGATION ==========
function initNavigation() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  
  if (toggle && menu) {
    const closeNav = () => {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggle.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeNav);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      // Only close if menu is open and the click is outside both the menu and the toggle button
      if (menu.classList.contains('open') && !toggle.contains(e.target) && !menu.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }
  
  // Mark current page as active
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === 'index.html' && linkPath === './')) {
      link.classList.add('active');
    }
  });
}

// ========== FOOTER YEAR ==========
function initCurrentYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ========== ADMIN BAR ==========
function initAdminBar() {
  const loginBtn = document.getElementById('adminLoginBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const loginPanel = document.getElementById('loginPanel');
  const loginForm = document.getElementById('loginForm');
  const closeLogin = document.getElementById('closeLogin');
  
  if (loginBtn && loginPanel) {
    loginBtn.addEventListener('click', () => {
      loginPanel.classList.add('open');
    });
  }
  
  if (closeLogin && loginPanel) {
    closeLogin.addEventListener('click', () => {
      loginPanel.classList.remove('open');
    });
  }
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('adminEmail').value;
      const password = document.getElementById('adminPassword').value;
      
      const result = await window.VanavilDB.adminLogin(email, password);
      if (result.success) {
        loginPanel.classList.remove('open');
        alert('Erfolgreich eingeloggt!');
        location.reload();
      } else {
        alert('Login fehlgeschlagen: ' + result.error);
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.VanavilDB.adminLogout();
      alert('Ausgeloggt');
      location.reload();
    });
  }
}

// ========== SCROLL REVEAL ==========
function initRevealObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  // expose so loadHeroTeamPhoto can re-observe dynamic elements
  window._revealObserver = observer;
}

// ========== RENDER HELPERS ==========

/**
 * Format date to German locale
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-CH', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format date for match display
 */
function formatMatchDate(dateString) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('de-CH', { month: 'short' }).toUpperCase()
  };
}

/**
 * Render news cards
 */
function renderNewsCards(news, container, featured = false) {
  if (!container) return;
  
  if (news.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Keine News vorhanden</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = news.map((item, index) => `
    <article class="card ${featured && index === 0 ? 'news-featured' : ''}">
      <div class="card-image" style="${item.image
        ? `background-image:url('${escapeHtml(item.image)}');background-size:cover;background-position:center;`
        : 'background:linear-gradient(135deg,var(--bg-card),var(--primary-light));'}"></div>
      <div class="card-meta">
        <span class="card-tag">${item.category || 'News'}</span>
        <span>${formatDate(item.date)}</span>
      </div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary || '')}</p>
    </article>
  `).join('');
}

/**
 * Render match cards
 */
function renderMatchCards(matches, container) {
  if (!container) return;
  
  if (matches.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Keine Spiele geplant</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = matches.map(match => {
    const { day, month } = formatMatchDate(match.date);
    const isLive = match.status === 'live';
    
    return `
      <article class="card match-card">
        <div class="match-date">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="match-info">
          <h4>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</h4>
          <p>${escapeHtml(match.location || 'TBA')}</p>
        </div>
        <span class="match-time ${isLive ? 'match-live' : ''}">
          ${isLive ? 'LIVE' : match.time || ''}
        </span>
      </article>
    `;
  }).join('');
}

/**
 * Render tournament table
 */
function renderTournaments(tournaments, container) {
  if (!container) return;
  
  if (tournaments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Keine Turniere geplant</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Turnier</th>
            <th>Ort</th>
            <th>Kategorie</th>
          </tr>
        </thead>
        <tbody>
          ${tournaments.map(t => `
            <tr>
              <td>${formatDate(t.date)}</td>
              <td><strong>${escapeHtml(t.name)}</strong></td>
              <td>${escapeHtml(t.location || 'TBA')}</td>
              <td><span class="card-tag">${escapeHtml(t.category || 'Senior')}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render player cards for a given list of player objects
 */
function renderPlayerCards(players, container, onCardClick) {
  if (!container) return;

  if (players.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Keine Spieler im Kader</p></div>`;
    return;
  }

  container.innerHTML = players.map((p, i) => `
    <div class="player-card${onCardClick ? ' player-card--clickable' : ''}" data-player-index="${i}" ${onCardClick ? 'role="button" tabindex="0" aria-label="' + escapeHtml(p.name) + ' - Details anzeigen"' : ''}>
      <div class="player-card-media">
        <div class="player-photo" ${p.photoURL ? `style="background-image:url('${escapeHtml(p.photoURL)}')"` : ''}></div>
        ${!p.photoURL ? `<span class="player-initials">${escapeHtml(p.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase())}</span>` : ''}
        <div class="player-card-overlay"></div>
        ${p.number ? `<span class="player-number">#${escapeHtml(String(p.number))}</span>` : ''}
      </div>
      <div class="player-info">
        <strong class="player-name">${escapeHtml(p.name)}</strong>
        ${p.position ? `<span class="player-position">${escapeHtml(p.position)}</span>` : ''}
      </div>
    </div>
  `).join('');

  if (onCardClick) {
    container.querySelectorAll('.player-card').forEach((card, i) => {
      const open = () => onCardClick(players[i]);
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    });
  }
}

/**
 * Render gallery grid (public page)
 */
function renderGalleryGrid(images, container, onImageClick) {
  if (!container) return;

  if (images.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Noch keine Bilder vorhanden</p></div>`;
    return;
  }

  container.innerHTML = images.map((img, i) => `
    <div class="gallery-item" data-index="${i}" style="cursor:pointer" role="button" tabindex="0" aria-label="${escapeHtml(img.title || 'Bild')}">
      <img src="${escapeHtml(img.imageURL)}" alt="${escapeHtml(img.title || '')}" loading="lazy">
      ${img.title ? `<div class="gallery-caption">${escapeHtml(img.title)}</div>` : ''}
    </div>
  `).join('');

  container.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => onImageClick && onImageClick(Number(item.dataset.index)));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onImageClick && onImageClick(Number(item.dataset.index));
      }
    });
  });
}

// Export helpers for page scripts
window.VanavilUI = {
  formatDate,
  formatMatchDate,
  renderNewsCards,
  renderMatchCards,
  renderTournaments,
  renderPlayerCards,
  renderGalleryGrid,
  escapeHtml
};
