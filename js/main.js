/**
 * SC Vanavil Luzern - Main JavaScript
 */
// ========== PAGE LOADER ==========
// Kurzer Wappen-Einstieg auf der Startseite (nur CSS-Animation).
(function () {
  const loader = document.getElementById('vanavil-loader');
  if (!loader) return;

  // Nur einmal pro Browser-Session abspielen; danach sofort ausblenden.
  let alreadyShown = false;
  try { alreadyShown = sessionStorage.getItem('vanavilLoaderShown') === '1'; } catch (e) {}
  if (alreadyShown) loader.classList.add('no-anim');

  // Deckt die Animation (~1s) ab, damit sie nicht abgeschnitten wird.
  const minDelay = new Promise(res => setTimeout(res, alreadyShown ? 0 : 1000));

  Promise.all([
    minDelay,
    new Promise(res => window.addEventListener('load', res))
  ]).then(() => {
    loader.classList.add('hidden');
    try { sessionStorage.setItem('vanavilLoaderShown', '1'); } catch (e) {}
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCurrentYear();
  initAdminBar();

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

// Teamfoto aus dem Admin-Panel: Hintergrund der Startseite sowie
// (über --team-photo) der Seitenköpfe und des Mitmachen-Blocks.
// Ohne Foto bleibt alles navy, auf der Startseite mit Wappen.
async function loadHeroTeamPhoto() {
  try {
    const settings = await window.VanavilDB.getSettings();
    const url = settings && settings.teamPhotoURL;
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      const cssUrl = 'url("' + url.replace(/"/g, '%22') + '")';
      document.documentElement.style.setProperty('--team-photo', cssUrl);
      const hero = document.getElementById('heroSection');
      const photo = document.getElementById('heroPhoto');
      if (hero && photo) {
        photo.style.backgroundImage = cssUrl;
        hero.classList.add('has-photo');
      }
    };
    img.src = url;
  } catch (e) {
    // kein Teamfoto gesetzt
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

// ========== RENDER HELPERS ==========

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMatchDate(dateString) {
  const date = new Date(dateString);
  return {
    day: date.getDate(),
    month: date.toLocaleDateString('de-CH', { month: 'short' }).replace('.', '').toUpperCase()
  };
}

function renderNewsCards(news, container) {
  if (!container) return;

  if (news.length === 0) {
    container.innerHTML = '<p class="empty-state" style="grid-column:1/-1">Noch keine Beiträge. Aktuelles vom Verein gibt es auch auf <a href="https://instagram.com/scvanavil" target="_blank" rel="noopener">Instagram</a>.</p>';
    return;
  }

  container.innerHTML = news.map(item => `
    <article class="card news-card">
      <div class="card-image"${item.image ? ` style="background-image:url('${escapeHtml(item.image)}')"` : ''}></div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-tag">${escapeHtml(item.category || 'News')}</span>
          <span>${formatDate(item.date)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary || '')}</p>
      </div>
    </article>
  `).join('');
}

function renderMatchCards(matches, container) {
  if (!container) return;

  if (matches.length === 0) {
    container.innerHTML = '<p class="empty-state">Zurzeit sind keine Spiele eingetragen.</p>';
    return;
  }

  const orFallback = (value, fallback) => (!value || value === 'TBA') ? fallback : value;

  container.innerHTML = '<div class="match-list">' + matches.map(match => {
    const { day, month } = formatMatchDate(match.date);
    const isLive = match.status === 'live';

    return `
      <article class="card match-card">
        <div class="match-date">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="match-info">
          <h4>${escapeHtml(match.homeTeam)} – ${escapeHtml(match.awayTeam)}</h4>
          <p>${escapeHtml(orFallback(match.location, 'Ort folgt'))}</p>
        </div>
        <span class="match-time ${isLive ? 'match-live' : ''}">
          ${isLive ? 'Live' : escapeHtml(orFallback(match.time, 'Zeit folgt'))}
        </span>
      </article>
    `;
  }).join('') + '</div>';
}

/**
 * Heutiges Datum als 'YYYY-MM-DD' (lokale Zeit)
 */
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

/**
 * '2026-07-04' (+ optional '2026-07-05') -> '4.–5. Juli 2026'
 */
function formatDateRange(start, end) {
  const s = new Date(start + 'T12:00:00');
  if (!end || end === start) {
    return s.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  const e = new Date(end + 'T12:00:00');
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return s.getDate() + '.–' + e.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return s.toLocaleDateString('de-CH', { day: 'numeric', month: 'long' }) + ' – ' +
         e.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Turniere in kommende und vergangene aufteilen.
 * Ein Turnier gilt bis zu seinem letzten Tag als kommend.
 */
function splitTournaments(tournaments) {
  const today = todayISO();
  const upcoming = [], past = [];
  tournaments.forEach(t => ((t.endDate || t.date) >= today ? upcoming : past).push(t));
  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  past.sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

function renderTournamentList(tournaments, container, { showResult = false } = {}) {
  if (!container) return;
  container.innerHTML = '<div class="match-list">' + tournaments.map(t => {
    const d = new Date(t.date + 'T12:00:00');
    const month = d.toLocaleDateString('de-CH', { month: 'short' }).replace('.', '').toUpperCase();
    const meta = [formatDateRange(t.date, t.endDate), t.location].filter(Boolean).map(escapeHtml).join(' · ');
    const right = showResult
      ? (t.result ? `<span class="tournament-result">${escapeHtml(t.result)}</span>` : '')
      : (t.team ? `<span class="tournament-team">${escapeHtml(t.team)}</span>` : '');
    return `
      <article class="card match-card">
        <div class="match-date">
          <span class="day">${d.getDate()}</span>
          <span class="month">${month}</span>
        </div>
        <div class="match-info">
          <h4>${escapeHtml(t.name)}</h4>
          <p>${meta}</p>
        </div>
        ${right}
      </article>`;
  }).join('') + '</div>';
}

const WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

function renderTrainings(trainings, container) {
  if (!container) return;
  const sorted = [...trainings].sort((a, b) =>
    (a.team || '').localeCompare(b.team || '') ||
    WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day) ||
    (a.start || '').localeCompare(b.start || ''));

  container.innerHTML = `
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Team</th><th>Tag</th><th>Zeit</th><th>Ort</th></tr></thead>
        <tbody>
          ${sorted.map(t => `
            <tr>
              <td><strong>${escapeHtml(t.team)}</strong></td>
              <td>${escapeHtml(t.day)}</td>
              <td>${escapeHtml(t.start)}${t.end ? '–' + escapeHtml(t.end) : ''} Uhr</td>
              <td>${escapeHtml(t.location)}</td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

/**
 * Instagram-Link erkennen:
 *   Beitrag/Reel: 'https://www.instagram.com/p/ABC123/' -> { type: 'p', code: 'ABC123' }
 *   Profil:       'https://www.instagram.com/scvanavil/' -> { type: 'profile', code: 'scvanavil' }
 */
function parseInstagramUrl(url) {
  const post = String(url).match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (post) return { type: post[1], code: post[2] };
  const profile = String(url).match(/instagram\.com\/([A-Za-z0-9_.]+)\/?(?:[?#].*)?$/);
  const reserved = ['p', 'reel', 'reels', 'tv', 'explore', 'stories', 'accounts'];
  if (profile && !reserved.includes(profile[1])) return { type: 'profile', code: profile[1] };
  return null;
}

function renderInstagramPosts(urls, container) {
  if (!container) return;
  const items = urls.map(parseInstagramUrl).filter(Boolean);
  container.classList.toggle('insta-single', items.length === 1);
  container.innerHTML = items.map(p => {
    const src = p.type === 'profile'
      ? `https://www.instagram.com/${encodeURIComponent(p.code)}/embed/`
      : `https://www.instagram.com/${p.type}/${encodeURIComponent(p.code)}/embed/`;
    return `
      <div class="insta-post${p.type === 'profile' ? ' insta-profile' : ''}">
        <iframe src="${src}" title="Instagram von SC Vanavil" loading="lazy"
                allowtransparency="true" scrolling="no"></iframe>
      </div>`;
  }).join('');
}

/**
 * Escape HTML (inkl. Anführungszeichen, da auch in Attributen verwendet)
 */
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
      <img src="${escapeHtml(img.thumbURL || img.imageURL)}" alt="${escapeHtml(img.title || '')}" loading="lazy" decoding="async">
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
  renderTournamentList,
  splitTournaments,
  formatDateRange,
  renderTrainings,
  renderInstagramPosts,
  parseInstagramUrl,
  WEEKDAYS,
  renderPlayerCards,
  renderGalleryGrid,
  escapeHtml
};
