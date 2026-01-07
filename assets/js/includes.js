/**
 * VÉLO MORVAN - Includes dynamiques
 * Charge header.html et footer.html dans les éléments marqués
 */

(function() {
  'use strict';

  /**
   * Charge un fichier HTML et l'insère dans un élément
   * @param {string} url - URL du fichier à charger
   * @param {HTMLElement} element - Élément cible
   */
  function loadInclude(url, element) {
    fetch(url)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Erreur de chargement: ' + url);
        }
        return response.text();
      })
      .then(function(html) {
        element.innerHTML = html;

        // Émettre un événement personnalisé après insertion du contenu
        var event = new CustomEvent('includeLoaded', {
          detail: { url: url, element: element }
        });
        document.dispatchEvent(event);
      })
      .catch(function(error) {
        console.error('Erreur includes.js:', error);
      });
  }

  /**
   * Initialise les includes au chargement de la page
   */
  function initIncludes() {
    // Header
    var headerElement = document.querySelector('header[data-include="header"]');
    if (headerElement) {
      loadInclude('/partials/header.html', headerElement);
    }

    // Footer
    var footerElement = document.querySelector('footer[data-include="footer"]');
    if (footerElement) {
      loadInclude('/partials/footer.html', footerElement);
    }
  }

  // Lancer au chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIncludes);
  } else {
    initIncludes();
  }
})();
