/**
 * Navigation responsive avec menu hamburger et dropdowns
 */
(function() {
  'use strict';

  // Attendre que le header soit chargé dynamiquement
  document.addEventListener('includeLoaded', function(e) {
    // Initialiser seulement après le chargement du header
    if (e.detail.url === '/partials/header.html') {
      initMobileMenu();
      initDropdowns();
    }
  });

  /**
   * Initialise le menu hamburger mobile
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.main-nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      // Toggle l'état
      toggle.setAttribute('aria-expanded', !isExpanded);
      toggle.classList.toggle('active');
      nav.classList.toggle('active');

      // Empêcher le scroll du body quand menu ouvert
      document.body.classList.toggle('menu-open', !isExpanded);
    });

    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        if (nav.classList.contains('active')) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('active');
          nav.classList.remove('active');
          document.body.classList.remove('menu-open');
        }
      }
    });

    // Fermer le menu au redimensionnement vers desktop
    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth > 768) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.remove('active');
          nav.classList.remove('active');
          document.body.classList.remove('menu-open');
          // Fermer tous les dropdowns
          document.querySelectorAll('.has-dropdown').forEach(function(item) {
            item.classList.remove('active');
          });
        }
      }, 250);
    });
  }

  /**
   * Initialise les dropdowns (clic sur mobile, survol sur desktop)
   */
  function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    dropdownToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function(e) {
        // Sur mobile uniquement (≤768px)
        if (window.innerWidth <= 768) {
          e.preventDefault();

          const parent = toggle.closest('.has-dropdown');
          const isActive = parent.classList.contains('active');

          // Fermer tous les autres dropdowns
          document.querySelectorAll('.has-dropdown').forEach(function(item) {
            if (item !== parent) {
              item.classList.remove('active');
            }
          });

          // Toggle le dropdown actuel
          parent.classList.toggle('active');
        }
        // Sur desktop, laisser le lien fonctionner normalement
      });
    });

    // Fermer les dropdowns si on clique en dehors
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!e.target.closest('.has-dropdown')) {
          document.querySelectorAll('.has-dropdown').forEach(function(item) {
            item.classList.remove('active');
          });
        }
      }
    });
  }
})();
