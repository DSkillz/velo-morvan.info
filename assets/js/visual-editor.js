/**
 * VÉLO MORVAN - Éditeur Visuel Temps Réel
 * Édition HTML/CSS en direct avec drag & drop
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    overlayColor: 'rgba(33, 150, 243, 0.3)',
    overlayBorder: '2px solid #2196F3',
    selectedColor: 'rgba(76, 175, 80, 0.3)',
    selectedBorder: '3px solid #4CAF50',
    excludeSelectors: ['.visual-editor-overlay', '.visual-editor-panel', '.visual-editor-toolbar', '.ve-drop-indicator']
  };

  // État global
  let state = {
    enabled: false,
    hoveredElement: null,
    selectedElement: null,
    isDragging: false,
    dragElement: null,
    modifications: []
  };

  // Éléments UI
  let ui = {
    overlay: null,
    selectedOverlay: null,
    panel: null,
    toolbar: null
  };

  /**
   * Initialise l'éditeur visuel
   */
  function init() {
    createOverlays();
    createToolbar();
    createPanel();
    attachEventListeners();
    console.log('🎨 Visual Editor initialized! Press Ctrl+E to toggle.');
  }

  /**
   * Crée les overlays de survol et sélection
   */
  function createOverlays() {
    // Overlay de survol
    ui.overlay = document.createElement('div');
    ui.overlay.className = 'visual-editor-overlay';
    ui.overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 999998;
      display: none;
      background: ${CONFIG.overlayColor};
      border: ${CONFIG.overlayBorder};
      box-sizing: border-box;
    `;
    document.body.appendChild(ui.overlay);

    // Overlay de sélection
    ui.selectedOverlay = document.createElement('div');
    ui.selectedOverlay.className = 'visual-editor-overlay';
    ui.selectedOverlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 999997;
      display: none;
      background: ${CONFIG.selectedColor};
      border: ${CONFIG.selectedBorder};
      box-sizing: border-box;
    `;
    document.body.appendChild(ui.selectedOverlay);
  }

  /**
   * Crée la barre d'outils flottante
   */
  function createToolbar() {
    ui.toolbar = document.createElement('div');
    ui.toolbar.className = 'visual-editor-toolbar';
    ui.toolbar.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000000;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 12px 20px;
      border-radius: 50px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      display: none;
      gap: 15px;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: white;
      font-weight: 600;
      font-size: 14px;
    `;

    ui.toolbar.innerHTML = `
      <span>🎨 Visual Editor</span>
      <button id="ve-toggle-drag" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;">
        🔒 Drag OFF
      </button>
      <button id="ve-export" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;">
        💾 Export
      </button>
      <button id="ve-close" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;">
        ✕
      </button>
    `;

    document.body.appendChild(ui.toolbar);
  }

  /**
   * Crée le panneau d'édition
   */
  function createPanel() {
    ui.panel = document.createElement('div');
    ui.panel.className = 'visual-editor-panel';
    ui.panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 400px;
      max-height: 600px;
      z-index: 1000000;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    ui.panel.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px; color: white;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Element Editor</h3>
        <div id="ve-element-path" style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Select an element</div>
      </div>
      <div style="overflow-y: auto; flex: 1;">
        <div id="ve-editor-content" style="padding: 16px;">
          <p style="color: #999; font-size: 14px; text-align: center;">Click on any element to edit</p>
        </div>
      </div>
    `;

    document.body.appendChild(ui.panel);
  }

  /**
   * Attache les event listeners
   */
  function attachEventListeners() {
    // Toggle avec Ctrl+E
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditor();
      }
    });

    // Boutons toolbar
    document.getElementById('ve-close').addEventListener('click', () => {
      toggleEditor();
    });

    document.getElementById('ve-toggle-drag').addEventListener('click', (e) => {
      state.isDragging = !state.isDragging;
      e.target.textContent = state.isDragging ? '🔓 Drag ON' : '🔒 Drag OFF';
      e.target.style.background = state.isDragging ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255,255,255,0.2)';

      // Activer/désactiver draggable sur tous les éléments non-éditeur
      if (state.isDragging) {
        enableDragForAll();
      } else {
        disableDragForAll();
      }
    });

    document.getElementById('ve-export').addEventListener('click', exportModifications);

    // Survol et sélection
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    // Drag & drop
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('dragend', handleDragEnd);
  }

  /**
   * Obtient l'élément réel sous le curseur (ignore les overlays)
   */
  function getElementAtPoint(x, y) {
    // Cacher temporairement les overlays pour obtenir l'élément réel
    const overlayDisplay = ui.overlay.style.display;
    const selectedDisplay = ui.selectedOverlay.style.display;

    ui.overlay.style.display = 'none';
    ui.selectedOverlay.style.display = 'none';

    const element = document.elementFromPoint(x, y);

    ui.overlay.style.display = overlayDisplay;
    ui.selectedOverlay.style.display = selectedDisplay;

    return element;
  }

  /**
   * Gestion du mouvement de souris (survol)
   */
  function handleMouseMove(e) {
    if (!state.enabled) return;

    // Obtenir l'élément réel sous le curseur
    const target = getElementAtPoint(e.clientX, e.clientY);

    // Ignorer les éléments de l'éditeur
    if (!target || isEditorElement(target)) {
      ui.overlay.style.display = 'none';
      return;
    }

    state.hoveredElement = target;
    updateOverlay(ui.overlay, target);
  }

  /**
   * Gestion du clic (sélection)
   */
  function handleClick(e) {
    if (!state.enabled) return;

    // Obtenir l'élément réel sous le curseur
    const target = getElementAtPoint(e.clientX, e.clientY);

    if (!target || isEditorElement(target)) return;

    e.preventDefault();
    e.stopPropagation();

    state.selectedElement = target;
    updateOverlay(ui.selectedOverlay, target);
    updatePanel(target);
  }

  /**
   * Met à jour l'overlay sur un élément
   */
  function updateOverlay(overlay, element) {
    const rect = element.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.top = `${window.scrollY + rect.top}px`;
    overlay.style.left = `${window.scrollX + rect.left}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
  }

  /**
   * Met à jour le panneau d'édition
   */
  function updatePanel(element) {
    const path = getElementPath(element);
    document.getElementById('ve-element-path').textContent = path;

    const computedStyle = window.getComputedStyle(element);
    const styles = {
      'display': computedStyle.display,
      'position': computedStyle.position,
      'width': computedStyle.width,
      'height': computedStyle.height,
      'margin': computedStyle.margin,
      'padding': computedStyle.padding,
      'background': computedStyle.background || computedStyle.backgroundColor,
      'color': computedStyle.color,
      'font-size': computedStyle.fontSize,
      'font-weight': computedStyle.fontWeight,
      'text-align': computedStyle.textAlign,
      'border': computedStyle.border,
      'border-radius': computedStyle.borderRadius,
      'box-shadow': computedStyle.boxShadow
    };

    let html = '<div style="display: grid; gap: 12px;">';

    // Section HTML
    html += `
      <div>
        <h4 style="margin: 0 0 8px 0; font-size: 13px; color: #667eea; font-weight: 600;">HTML</h4>
        <input type="text" id="ve-tag" value="${element.tagName.toLowerCase()}"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 13px;">
        <textarea id="ve-content" placeholder="Inner HTML"
          style="width: 100%; margin-top: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 12px; resize: vertical; min-height: 60px;">${element.innerHTML}</textarea>
      </div>
    `;

    // Section CSS
    html += '<div><h4 style="margin: 12px 0 8px 0; font-size: 13px; color: #667eea; font-weight: 600;">CSS Properties</h4></div>';

    for (const [prop, value] of Object.entries(styles)) {
      html += `
        <div>
          <label style="display: block; font-size: 12px; color: #666; margin-bottom: 4px;">${prop}</label>
          <input type="text" data-css-prop="${prop}" value="${value}"
            style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-family: monospace; font-size: 12px;">
        </div>
      `;
    }

    html += `
      <button id="ve-delete-element" style="background: #f44336; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 8px;">
        🗑️ Delete Element
      </button>
    `;

    html += '</div>';

    const editorContent = document.getElementById('ve-editor-content');
    editorContent.innerHTML = html;

    // Event listeners pour les inputs
    editorContent.querySelectorAll('input[data-css-prop]').forEach(input => {
      input.addEventListener('input', (e) => {
        const prop = e.target.dataset.cssProp;
        const value = e.target.value;
        element.style[prop] = value;
        recordModification(element, 'style', prop, value);
        updateOverlay(ui.selectedOverlay, element);
      });
    });

    document.getElementById('ve-content').addEventListener('input', (e) => {
      element.innerHTML = e.target.value;
      recordModification(element, 'innerHTML', null, e.target.value);
    });

    document.getElementById('ve-delete-element').addEventListener('click', () => {
      if (confirm('Delete this element?')) {
        recordModification(element, 'deleted', null, null);
        element.remove();
        ui.selectedOverlay.style.display = 'none';
        document.getElementById('ve-editor-content').innerHTML = '<p style="color: #999; font-size: 14px; text-align: center;">Element deleted</p>';
      }
    });
  }

  /**
   * Drag & Drop handlers
   */
  function handleDragStart(e) {
    if (!state.enabled || !state.isDragging) return;
    if (isEditorElement(e.target)) return;

    state.dragElement = e.target;
    e.target.style.opacity = '0.4';
    e.target.style.cursor = 'grabbing';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);

    // Cacher les overlays pendant le drag
    ui.overlay.style.display = 'none';

    console.log('🔵 Drag started:', getElementPath(e.target));
  }

  function handleDragOver(e) {
    if (!state.enabled || !state.isDragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // Obtenir l'élément réel sous le curseur
    const target = getElementAtPoint(e.clientX, e.clientY);

    if (!target || isEditorElement(target)) return;
    if (target === state.dragElement) return;

    // Feedback visuel : ligne d'insertion
    document.querySelectorAll('.ve-drop-indicator').forEach(el => el.remove());

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const insertBefore = e.clientY < midY;

    const indicator = document.createElement('div');
    indicator.className = 've-drop-indicator';
    indicator.style.cssText = `
      position: absolute;
      left: ${rect.left}px;
      top: ${insertBefore ? rect.top : rect.bottom}px;
      width: ${rect.width}px;
      height: 3px;
      background: #4CAF50;
      z-index: 999999;
      pointer-events: none;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    `;
    document.body.appendChild(indicator);
  }

  function handleDrop(e) {
    if (!state.enabled || !state.isDragging) return;

    e.preventDefault();
    e.stopPropagation();

    // Enlever les indicateurs
    document.querySelectorAll('.ve-drop-indicator').forEach(el => el.remove());

    // Obtenir l'élément réel sous le curseur
    const target = getElementAtPoint(e.clientX, e.clientY);

    if (!target || isEditorElement(target)) return;

    if (state.dragElement && target !== state.dragElement && !state.dragElement.contains(target)) {
      // Insérer avant ou après selon la position
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (e.clientY < midY) {
        target.parentNode.insertBefore(state.dragElement, target);
      } else {
        target.parentNode.insertBefore(state.dragElement, target.nextSibling);
      }

      recordModification(state.dragElement, 'moved', null, getElementPath(state.dragElement));
      console.log('✅ Element moved:', getElementPath(state.dragElement));

      // Mettre à jour l'overlay de sélection
      if (state.selectedElement === state.dragElement) {
        updateOverlay(ui.selectedOverlay, state.dragElement);
      }
    }
  }

  function handleDragEnd(e) {
    if (!state.enabled) return;
    e.target.style.opacity = '';
    e.target.style.cursor = '';
    state.dragElement = null;

    // Enlever les indicateurs
    document.querySelectorAll('.ve-drop-indicator').forEach(el => el.remove());

    console.log('🔴 Drag ended');
  }

  /**
   * Enregistre une modification
   */
  function recordModification(element, type, property, value) {
    state.modifications.push({
      timestamp: new Date().toISOString(),
      element: getElementPath(element),
      type: type,
      property: property,
      value: value
    });
  }

  /**
   * Exporte les modifications
   */
  function exportModifications() {
    const exportData = {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      modifications: state.modifications,
      html: document.documentElement.outerHTML
    };

    // Créer un blob et télécharger
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-editor-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Aussi copier le HTML dans le presse-papier
    navigator.clipboard.writeText(document.documentElement.outerHTML).then(() => {
      alert('✅ Modifications exportées!\n\n• JSON téléchargé\n• HTML copié dans le presse-papier\n• Total: ' + state.modifications.length + ' modifications');
    });
  }

  /**
   * Obtient le chemin CSS d'un élément
   */
  function getElementPath(element) {
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => !c.startsWith('visual-editor'));
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  /**
   * Vérifie si un élément fait partie de l'éditeur
   */
  function isEditorElement(element) {
    if (!element) return false;

    return CONFIG.excludeSelectors.some(selector =>
      element.classList.contains(selector.slice(1)) ||
      element.closest(selector)
    );
  }

  /**
   * Active le drag pour tous les éléments
   */
  function enableDragForAll() {
    const allElements = document.querySelectorAll('body *:not(script):not(style):not(link)');
    allElements.forEach(el => {
      if (!isEditorElement(el)) {
        el.setAttribute('draggable', 'true');
        el.style.cursor = 'grab';
      }
    });
    console.log('🔓 Drag enabled for all elements');
  }

  /**
   * Désactive le drag pour tous les éléments
   */
  function disableDragForAll() {
    const allElements = document.querySelectorAll('[draggable="true"]');
    allElements.forEach(el => {
      if (!isEditorElement(el)) {
        el.removeAttribute('draggable');
        el.style.cursor = '';
      }
    });
    console.log('🔒 Drag disabled for all elements');
  }

  /**
   * Toggle l'éditeur
   */
  function toggleEditor() {
    state.enabled = !state.enabled;

    if (state.enabled) {
      ui.toolbar.style.display = 'flex';
      ui.panel.style.display = 'flex';
      document.body.style.cursor = 'crosshair';
    } else {
      ui.toolbar.style.display = 'none';
      ui.panel.style.display = 'none';
      ui.overlay.style.display = 'none';
      ui.selectedOverlay.style.display = 'none';
      document.body.style.cursor = '';

      // Désactiver le drag
      if (state.isDragging) {
        state.isDragging = false;
        disableDragForAll();
      }

      // Nettoyer les indicateurs de drop
      document.querySelectorAll('.ve-drop-indicator').forEach(el => el.remove());
    }
  }

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
