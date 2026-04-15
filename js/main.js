/**
 * SC Vanavil Luzern - Main JavaScript
 */

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
  }
});

// ========== NAVIGATION ==========
function initNavigation() {
  const toggle = document.getElementById('menuToggle');
  const menu = document.getElementById('navMenu');
  
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });
    
    // Close on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      });
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      }
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
      <div class="card-image" style="background: linear-gradient(135deg, var(--bg-card), var(--primary-light));"></div>
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
function renderPlayerCards(players, container) {
  if (!container) return;

  if (players.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Keine Spieler im Kader</p></div>`;
    return;
  }

  container.innerHTML = players.map(p => `
    <div class="player-card">
      <div class="player-photo" style="${p.photoURL ? `background-image:url('${escapeHtml(p.photoURL)}')` : ''}">
        ${!p.photoURL ? `<span class="player-initials">${escapeHtml(p.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase())}</span>` : ''}
        ${p.number ? `<span class="player-number">#${escapeHtml(String(p.number))}</span>` : ''}
      </div>
      <div class="player-info">
        <strong class="player-name">${escapeHtml(p.name)}</strong>
        <span class="player-position">${escapeHtml(p.position || '')}</span>
      </div>
    </div>
  `).join('');
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
