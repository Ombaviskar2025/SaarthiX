/**
 * SaarthiX Theme Engine (Light & Dark Mode)
 * - Persists theme preference to localStorage ('saarthix_theme')
 * - Automatically initializes on page load (zero flicker)
 * - Automatically injects or binds the theme toggle button in the header
 * - Dispatches 'saarthix_theme_change' event for live components
 */

(function () {
  'use strict';

  var THEME_KEY = 'saarthix_theme';

  function getSavedTheme() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      // Default to dark mode (matches reference UI)
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  }

  function applyTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') theme = 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    updateToggleButtons(theme);

    window.dispatchEvent(
      new CustomEvent('saarthix_theme_change', { detail: { theme: theme } })
    );
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function updateToggleButtons(theme) {
    var buttons = document.querySelectorAll('.sx-theme-toggle-btn');
    buttons.forEach(function (btn) {
      var isDark = theme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
      btn.setAttribute('title', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');

      var icon = btn.querySelector('.material-symbols-outlined') || btn.querySelector('span');
      if (icon) {
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        icon.style.transform = isDark ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  }

  // 1. Instant execution before render to prevent FOUC (Flash of Unstyled Content)
  var initialTheme = getSavedTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);
  if (initialTheme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }

  // 2. Global functions
  window.SaarthiTheme = {
    get: function () {
      return document.documentElement.getAttribute('data-theme') || initialTheme;
    },
    set: applyTheme,
    toggle: toggleTheme
  };
  window.toggleTheme = toggleTheme;

  // 3. Mount theme toggle in DOM once ready
  function initToggleInDOM() {
    // Check if toggle already exists
    if (document.getElementById('sx-theme-toggle')) {
      updateToggleButtons(document.documentElement.getAttribute('data-theme') || initialTheme);
      return;
    }

    // Try finding header action containers
    var header = document.querySelector('header');
    if (!header) return;

    // Look for notification bell container or user avatar container
    var notifContainer = document.getElementById('dash-notif-container') ||
      document.querySelector('header [title*="Notification"]') ||
      document.getElementById('dash-user-container') ||
      header.querySelector('.flex.items-center.gap-5') ||
      header.querySelector('.flex.items-center.gap-4') ||
      header.lastElementChild;

    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'sx-theme-toggle';
    toggleBtn.className = 'sx-theme-toggle-btn';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('title', initialTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    toggleBtn.setAttribute('aria-label', 'Toggle Dark / Light Theme');
    toggleBtn.onclick = toggleTheme;
    toggleBtn.innerHTML =
      '<span class="material-symbols-outlined" style="transition:transform 0.3s ease;font-size:18px;">' +
      (initialTheme === 'dark' ? 'light_mode' : 'dark_mode') +
      '</span>';

    if (notifContainer && notifContainer.parentNode) {
      // Insert right before notification or user avatar
      notifContainer.parentNode.insertBefore(toggleBtn, notifContainer);
    } else {
      header.appendChild(toggleBtn);
    }

    updateToggleButtons(document.documentElement.getAttribute('data-theme') || initialTheme);
    initSxUserAccount();
  }

  // ── Unified User Account Management (Syncs session across all pages) ──
  function initSxUserAccount() {
    if (window.currentUser && typeof window.updateUserUI === 'function') {
      window.updateUserUI(window.currentUser);
      return;
    }
  }

  window.initSxUserAccount = initSxUserAccount;

  window.toggleSxUserMenu = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    var menu = document.getElementById('dash-user-menu');
    if (menu) menu.classList.toggle('hidden');
    var notif = document.getElementById('dash-notif-menu');
    if (notif) notif.classList.add('hidden');
  };
  window.toggleDashUserMenu = window.toggleSxUserMenu;

  window.logoutSxUser = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    if (typeof window.handleLogout === 'function') {
      window.handleLogout(e);
      return;
    }
    window.location.href = 'login.html';
  };

  // Close user dropdown menu when clicking anywhere outside
  document.addEventListener('click', function (e) {
    var userContainer = document.getElementById('dash-user-container');
    var userMenu = document.getElementById('dash-user-menu');
    if (userMenu && !userMenu.classList.contains('hidden')) {
      if (userContainer && !userContainer.contains(e.target)) {
        userMenu.classList.add('hidden');
      }
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initToggleInDOM();
      initSxUserAccount();
    });
  } else {
    initToggleInDOM();
    initSxUserAccount();
  }

  // Keyboard shortcut: Ctrl + Shift + D or Cmd + Shift + D
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      toggleTheme();
    }
  });
})();
