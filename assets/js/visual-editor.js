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
    excludeSelectors: ['.visual-editor-overlay', '.visual-editor-panel', '.visual-editor-toolbar', '.visual-editor-dom-inspector', '.ve-drop-indicator', '.ve-dom-node']
  };

  // État global
  let state = {
    enabled: false,
    hoveredElement: null,
    selectedElement: null,
    isDragging: false,
    dragElement: null,
    modifications: [],
    history: [],
    historyIndex: -1
  };

  // Éléments UI
  let ui = {
    overlay: null,
    selectedOverlay: null,
    panel: null,
    toolbar: null,
    domInspector: null,
    resizeHandles: null,
    boxModelOverlay: null
  };

  /**
   * Initialise l'éditeur visuel
   */
  function init() {
    createOverlays();
    createToolbar();
    createPanel();
    createDOMInspector();
    createResizeHandles();
    createBoxModelOverlay();
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
      <button id="ve-undo" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;" disabled title="Undo (Ctrl+Z)">
        ↶ <span id="ve-undo-count">0</span>
      </button>
      <button id="ve-redo" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;" disabled title="Redo (Ctrl+Y)">
        ↷ <span id="ve-redo-count">0</span>
      </button>
      <button id="ve-toggle-dom" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 14px; border-radius: 20px; cursor: pointer; font-weight: 600;" title="Toggle DOM Inspector">
        🌳 DOM
      </button>
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
      transition: max-height 0.3s ease, width 0.3s ease;
    `;

    ui.panel.innerHTML = `
      <div id="ve-panel-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 16px; color: white; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Element Editor</h3>
          <div id="ve-element-path" style="font-size: 12px; opacity: 0.9; margin-top: 4px;">Select an element</div>
        </div>
        <button id="ve-panel-toggle" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 16px;" title="Minimize/Maximize">−</button>
      </div>
      <div id="ve-panel-body" style="overflow-y: auto; flex: 1;">
        <div id="ve-editor-content" style="padding: 16px;">
          <p style="color: #999; font-size: 14px; text-align: center;">Click on any element to edit</p>
        </div>
      </div>
    `;

    document.body.appendChild(ui.panel);

    // Event listener pour minimiser/maximiser
    document.getElementById('ve-panel-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanelMinimize();
    });

    // Double-clic sur le header pour minimiser/maximiser
    document.getElementById('ve-panel-header').addEventListener('dblclick', (e) => {
      if (e.target.id !== 've-panel-toggle') {
        togglePanelMinimize();
      }
    });
  }

  /**
   * Toggle la minimisation du panneau
   */
  function togglePanelMinimize() {
    const body = document.getElementById('ve-panel-body');
    const toggle = document.getElementById('ve-panel-toggle');
    const isMinimized = body.style.display === 'none';

    if (isMinimized) {
      // Maximiser
      body.style.display = 'block';
      ui.panel.style.maxHeight = '600px';
      ui.panel.style.width = '400px';
      toggle.textContent = '−';
      toggle.title = 'Minimize';
    } else {
      // Minimiser
      body.style.display = 'none';
      ui.panel.style.maxHeight = '60px';
      ui.panel.style.width = 'auto';
      toggle.textContent = '+';
      toggle.title = 'Maximize';
    }
  }

  /**
   * Crée le panneau DOM Inspector
   */
  function createDOMInspector() {
    ui.domInspector = document.createElement('div');
    ui.domInspector.className = 'visual-editor-panel visual-editor-dom-inspector';
    ui.domInspector.style.cssText = `
      position: fixed;
      top: 70px;
      left: 10px;
      width: 350px;
      max-height: 80vh;
      z-index: 1000000;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: 'Courier New', monospace;
      font-size: 12px;
    `;

    ui.domInspector.innerHTML = `
      <div id="ve-dom-header" style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 12px 16px; color: white; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🌳</span>
          <span style="font-weight: 600;">DOM Inspector</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button id="ve-dom-refresh" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Refresh">
            ↻
          </button>
          <button id="ve-dom-minimize" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="Minimize">
            −
          </button>
        </div>
      </div>
      <div id="ve-dom-body" style="overflow-y: auto; flex: 1; padding: 8px; background: #fafafa;">
        <div style="color: #999; text-align: center; padding: 20px;">Building tree...</div>
      </div>
    `;

    document.body.appendChild(ui.domInspector);

    // Event listener pour refresh
    document.getElementById('ve-dom-refresh').addEventListener('click', (e) => {
      e.stopPropagation();
      refreshDOMTree();
    });

    // Event listener pour minimize
    document.getElementById('ve-dom-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDOMMinimize();
    });

    // Double-clic sur header pour minimize
    document.getElementById('ve-dom-header').addEventListener('dblclick', () => {
      toggleDOMMinimize();
    });
  }

  /**
   * Toggle la minimisation du DOM Inspector
   */
  function toggleDOMMinimize() {
    const body = document.getElementById('ve-dom-body');
    const btn = document.getElementById('ve-dom-minimize');
    const isMinimized = body.style.display === 'none';

    if (isMinimized) {
      body.style.display = 'block';
      ui.domInspector.style.maxHeight = '80vh';
      ui.domInspector.style.width = '350px';
      btn.textContent = '−';
    } else {
      body.style.display = 'none';
      ui.domInspector.style.maxHeight = '48px';
      ui.domInspector.style.width = 'auto';
      btn.textContent = '+';
    }
  }

  /**
   * Construit l'arborescence DOM récursivement
   */
  function buildDOMTree(element, depth = 0) {
    if (!element || isEditorElement(element)) return '';

    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').filter(c => !c.startsWith('visual-editor')).join('.')}` : '';
    const hasChildren = element.children.length > 0;
    const isSelected = element === state.selectedElement;

    const indent = depth * 16;
    const elementId = `dom-node-${Math.random().toString(36).substr(2, 9)}`;

    let html = `
      <div class="ve-dom-node ${isSelected ? 'selected' : ''}"
           data-element-id="${elementId}"
           draggable="true"
           style="
             padding: 4px 8px;
             margin-left: ${indent}px;
             cursor: pointer;
             border-radius: 4px;
             background: ${isSelected ? '#e3f2fd' : 'transparent'};
             border-left: 2px solid ${isSelected ? '#2196F3' : 'transparent'};
             user-select: none;
             transition: background 0.1s;
           "
           onmouseover="this.style.background='#f0f0f0'"
           onmouseout="this.style.background='${isSelected ? '#e3f2fd' : 'transparent'}'">
        <span style="color: #666;">${hasChildren ? '▼' : '  '}</span>
        <span style="color: #1976d2; font-weight: bold;">&lt;${tagName}</span>
        <span style="color: #388e3c;">${id}</span>
        <span style="color: #f57c00;">${classes}</span>
        <span style="color: #1976d2; font-weight: bold;">&gt;</span>
      </div>
    `;

    // Stocker la référence élément <-> ID
    if (!window.veElementMap) window.veElementMap = new Map();
    window.veElementMap.set(elementId, element);

    // Ajouter les enfants
    if (hasChildren) {
      for (let child of element.children) {
        html += buildDOMTree(child, depth + 1);
      }
    }

    return html;
  }

  /**
   * Crée les poignées de redimensionnement
   */
  function createResizeHandles() {
    ui.resizeHandles = document.createElement('div');
    ui.resizeHandles.className = 'visual-editor-resize-handles';
    ui.resizeHandles.style.cssText = `
      position: absolute;
      display: none;
      pointer-events: none;
      z-index: 999996;
    `;

    const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    const cursors = {
      nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize', e: 'ew-resize',
      se: 'nwse-resize', s: 'ns-resize', sw: 'nesw-resize', w: 'ew-resize'
    };

    positions.forEach(pos => {
      const handle = document.createElement('div');
      handle.className = `ve-resize-handle ve-resize-${pos}`;
      handle.dataset.position = pos;
      handle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: #2196F3;
        border: 2px solid white;
        border-radius: 50%;
        cursor: ${cursors[pos]};
        pointer-events: auto;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;

      // Positionnement des poignées
      if (pos.includes('n')) handle.style.top = '-5px';
      if (pos.includes('s')) handle.style.bottom = '-5px';
      if (pos.includes('w')) handle.style.left = '-5px';
      if (pos.includes('e')) handle.style.right = '-5px';
      if (pos === 'n' || pos === 's') handle.style.left = 'calc(50% - 5px)';
      if (pos === 'w' || pos === 'e') handle.style.top = 'calc(50% - 5px)';

      ui.resizeHandles.appendChild(handle);
    });

    document.body.appendChild(ui.resizeHandles);
  }

  /**
   * Crée l'overlay du Box Model (margin/padding)
   */
  function createBoxModelOverlay() {
    ui.boxModelOverlay = document.createElement('div');
    ui.boxModelOverlay.className = 'visual-editor-box-model';
    ui.boxModelOverlay.style.cssText = `
      position: absolute;
      display: none;
      pointer-events: none;
      z-index: 999995;
    `;

    ui.boxModelOverlay.innerHTML = `
      <div id="ve-margin-overlay" style="position: absolute; box-sizing: border-box; border: 2px dashed #f9cc9d; background: rgba(249, 204, 157, 0.1);"></div>
      <div id="ve-padding-overlay" style="position: absolute; box-sizing: border-box; border: 2px dashed #c2e0c6; background: rgba(194, 224, 198, 0.1);"></div>

      <!-- Poignées margin -->
      <div class="ve-margin-handle ve-margin-top" data-side="top" style="position: absolute; width: 40px; height: 8px; background: #f9cc9d; cursor: ns-resize; pointer-events: auto; left: 50%; transform: translateX(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-margin-handle ve-margin-right" data-side="right" style="position: absolute; width: 8px; height: 40px; background: #f9cc9d; cursor: ew-resize; pointer-events: auto; top: 50%; transform: translateY(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-margin-handle ve-margin-bottom" data-side="bottom" style="position: absolute; width: 40px; height: 8px; background: #f9cc9d; cursor: ns-resize; pointer-events: auto; left: 50%; transform: translateX(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-margin-handle ve-margin-left" data-side="left" style="position: absolute; width: 8px; height: 40px; background: #f9cc9d; cursor: ew-resize; pointer-events: auto; top: 50%; transform: translateY(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>

      <!-- Poignées padding -->
      <div class="ve-padding-handle ve-padding-top" data-side="top" style="position: absolute; width: 40px; height: 8px; background: #c2e0c6; cursor: ns-resize; pointer-events: auto; left: 50%; transform: translateX(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-padding-handle ve-padding-right" data-side="right" style="position: absolute; width: 8px; height: 40px; background: #c2e0c6; cursor: ew-resize; pointer-events: auto; top: 50%; transform: translateY(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-padding-handle ve-padding-bottom" data-side="bottom" style="position: absolute; width: 40px; height: 8px; background: #c2e0c6; cursor: ns-resize; pointer-events: auto; left: 50%; transform: translateX(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
      <div class="ve-padding-handle ve-padding-left" data-side="left" style="position: absolute; width: 8px; height: 40px; background: #c2e0c6; cursor: ew-resize; pointer-events: auto; top: 50%; transform: translateY(-50%); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>

      <!-- Labels pour les valeurs -->
      <div id="ve-margin-labels" style="position: absolute; font-family: monospace; font-size: 10px; color: #f57c00; font-weight: bold; pointer-events: none;"></div>
      <div id="ve-padding-labels" style="position: absolute; font-family: monospace; font-size: 10px; color: #388e3c; font-weight: bold; pointer-events: none;"></div>
    `;

    document.body.appendChild(ui.boxModelOverlay);

    // TODO: Attacher les event listeners pour les poignées (à implémenter)
    // attachResizeHandleListeners();
    // attachMarginPaddingHandleListeners();
  }

  /**
   * Rafraîchit l'arborescence DOM
   */
  function refreshDOMTree() {
    const treeContainer = document.getElementById('ve-dom-body');
    if (!treeContainer) return;

    treeContainer.innerHTML = buildDOMTree(document.body, 0);

    // Attacher les event listeners aux nœuds
    treeContainer.querySelectorAll('.ve-dom-node').forEach(node => {
      const elementId = node.getAttribute('data-element-id');
      const element = window.veElementMap.get(elementId);

      if (!element) return;

      // Clic pour sélectionner
      node.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedElement = element;
        updateOverlay(ui.selectedOverlay, element);
        updatePanel(element);
        refreshDOMTree();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      // Drag & Drop dans l'arborescence
      node.addEventListener('dragstart', (e) => {
        e.stopPropagation();
        state.dragElement = element;
        node.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        console.log('🌳 Drag started from DOM tree:', element.tagName);
      });

      node.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        node.style.background = '#c8e6c9';
      });

      node.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        node.style.background = element === state.selectedElement ? '#e3f2fd' : 'transparent';
      });

      node.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        node.style.background = element === state.selectedElement ? '#e3f2fd' : 'transparent';

        if (state.dragElement && state.dragElement !== element && !state.dragElement.contains(element)) {
          // Sauvegarder pour l'historique
          const oldParent = state.dragElement.parentNode;
          const oldNextSibling = state.dragElement.nextSibling;

          // Déplacer l'élément
          element.appendChild(state.dragElement);

          const newParent = element;
          const newNextSibling = null;

          recordMove(state.dragElement, oldParent, oldNextSibling, newParent, newNextSibling);

          console.log('✅ Element moved in DOM tree');
          refreshDOMTree();

          if (state.selectedElement === state.dragElement) {
            updateOverlay(ui.selectedOverlay, state.dragElement);
          }
        }
      });

      node.addEventListener('dragend', (e) => {
        e.stopPropagation();
        node.style.opacity = '';
        state.dragElement = null;
      });
    });
  }

  /**
   * Attache les event listeners
   */
  function attachEventListeners() {
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
      // Ctrl+E : Toggle editor
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        toggleEditor();
      }

      // Ctrl+Z : Undo
      if (state.enabled && e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y ou Ctrl+Shift+Z : Redo
      if (state.enabled && e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    });

    // Boutons toolbar
    document.getElementById('ve-close').addEventListener('click', () => {
      toggleEditor();
    });

    document.getElementById('ve-undo').addEventListener('click', () => {
      undo();
    });

    document.getElementById('ve-redo').addEventListener('click', () => {
      redo();
    });

    document.getElementById('ve-toggle-dom').addEventListener('click', () => {
      toggleDOMInspector();
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

    // Event listeners pour les inputs CSS
    editorContent.querySelectorAll('input[data-css-prop]').forEach(input => {
      // Stocker la valeur initiale au focus pour pouvoir annuler
      let oldValue = null;

      input.addEventListener('focus', (e) => {
        oldValue = element.style[e.target.dataset.cssProp] || window.getComputedStyle(element)[e.target.dataset.cssProp];
      });

      input.addEventListener('change', (e) => {
        const prop = e.target.dataset.cssProp;
        const newValue = e.target.value;

        if (oldValue !== newValue) {
          recordStyleChange(element, prop, oldValue, newValue);
        }
        updateOverlay(ui.selectedOverlay, element);
      });

      // Appliquer en temps réel mais enregistrer seulement au change
      input.addEventListener('input', (e) => {
        const prop = e.target.dataset.cssProp;
        element.style[prop] = e.target.value;
        updateOverlay(ui.selectedOverlay, element);
      });
    });

    // Event listener pour le contenu HTML
    const contentTextarea = document.getElementById('ve-content');
    let oldHTML = element.innerHTML;

    contentTextarea.addEventListener('focus', () => {
      oldHTML = element.innerHTML;
    });

    contentTextarea.addEventListener('change', (e) => {
      const newHTML = e.target.value;
      if (oldHTML !== newHTML) {
        recordHTMLChange(element, oldHTML, newHTML);
      }
    });

    contentTextarea.addEventListener('input', (e) => {
      element.innerHTML = e.target.value;
    });

    // Event listener pour la suppression
    document.getElementById('ve-delete-element').addEventListener('click', () => {
      if (confirm('Delete this element?')) {
        const parent = element.parentNode;
        const nextSibling = element.nextSibling;

        recordDeletion(element, parent, nextSibling);

        element.remove();
        ui.selectedOverlay.style.display = 'none';
        document.getElementById('ve-editor-content').innerHTML = '<p style="color: #999; font-size: 14px; text-align: center;">Element deleted</p>';

        // Mettre à jour le DOM Inspector
        if (ui.domInspector.style.display === 'flex') {
          refreshDOMTree();
        }
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
      // Sauvegarder la position actuelle pour l'historique
      const oldParent = state.dragElement.parentNode;
      const oldNextSibling = state.dragElement.nextSibling;

      // Insérer avant ou après selon la position
      const rect = target.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      let newParent, newNextSibling;

      if (e.clientY < midY) {
        target.parentNode.insertBefore(state.dragElement, target);
        newParent = target.parentNode;
        newNextSibling = target;
      } else {
        target.parentNode.insertBefore(state.dragElement, target.nextSibling);
        newParent = target.parentNode;
        newNextSibling = target.nextSibling;
      }

      // Enregistrer dans l'historique
      recordMove(state.dragElement, oldParent, oldNextSibling, newParent, newNextSibling);
      console.log('✅ Element moved:', getElementPath(state.dragElement));

      // Mettre à jour l'overlay de sélection
      if (state.selectedElement === state.dragElement) {
        updateOverlay(ui.selectedOverlay, state.dragElement);
      }

      // Mettre à jour le DOM Inspector
      if (ui.domInspector.style.display === 'flex') {
        refreshDOMTree();
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
   * Ajoute une action à l'historique
   */
  function addToHistory(action) {
    // Supprimer tout l'historique après l'index actuel (pour les nouveaux chemins après undo)
    state.history = state.history.slice(0, state.historyIndex + 1);

    // Ajouter la nouvelle action
    state.history.push(action);
    state.historyIndex++;

    // Limiter l'historique à 50 actions
    if (state.history.length > 50) {
      state.history.shift();
      state.historyIndex--;
    }

    updateHistoryUI();
    console.log('📝 History added:', action.type, '| Index:', state.historyIndex);
  }

  /**
   * Met à jour l'interface de l'historique
   */
  function updateHistoryUI() {
    const undoBtn = document.getElementById('ve-undo');
    const redoBtn = document.getElementById('ve-redo');
    const undoCount = document.getElementById('ve-undo-count');
    const redoCount = document.getElementById('ve-redo-count');

    const canUndo = state.historyIndex >= 0;
    const canRedo = state.historyIndex < state.history.length - 1;

    undoBtn.disabled = !canUndo;
    redoBtn.disabled = !canRedo;

    undoBtn.style.opacity = canUndo ? '1' : '0.5';
    redoBtn.style.opacity = canRedo ? '1' : '0.5';

    undoCount.textContent = state.historyIndex + 1;
    redoCount.textContent = state.history.length - state.historyIndex - 1;
  }

  /**
   * Annule la dernière action (Undo)
   */
  function undo() {
    if (state.historyIndex < 0) {
      console.log('❌ Nothing to undo');
      return;
    }

    const action = state.history[state.historyIndex];
    console.log('↶ Undoing:', action.type);

    // Restaurer l'état précédent
    applyHistoryAction(action, true);

    state.historyIndex--;
    updateHistoryUI();
  }

  /**
   * Refait la dernière action annulée (Redo)
   */
  function redo() {
    if (state.historyIndex >= state.history.length - 1) {
      console.log('❌ Nothing to redo');
      return;
    }

    state.historyIndex++;
    const action = state.history[state.historyIndex];
    console.log('↷ Redoing:', action.type);

    // Appliquer l'action
    applyHistoryAction(action, false);

    updateHistoryUI();
  }

  /**
   * Applique une action de l'historique
   */
  function applyHistoryAction(action, isUndo) {
    const element = action.element;

    switch (action.type) {
      case 'style':
        if (isUndo) {
          element.style[action.property] = action.oldValue;
        } else {
          element.style[action.property] = action.newValue;
        }
        // Mettre à jour l'overlay si c'est l'élément sélectionné
        if (state.selectedElement === element) {
          updateOverlay(ui.selectedOverlay, element);
          updatePanel(element);
        }
        break;

      case 'innerHTML':
        if (isUndo) {
          element.innerHTML = action.oldValue;
        } else {
          element.innerHTML = action.newValue;
        }
        if (state.selectedElement === element) {
          updatePanel(element);
        }
        break;

      case 'moved':
        if (isUndo) {
          // Restaurer la position originale
          action.oldParent.insertBefore(element, action.oldNextSibling);
        } else {
          // Refaire le déplacement
          action.newParent.insertBefore(element, action.newNextSibling);
        }
        if (state.selectedElement === element) {
          updateOverlay(ui.selectedOverlay, element);
        }
        break;

      case 'deleted':
        if (isUndo) {
          // Restaurer l'élément supprimé
          action.oldParent.insertBefore(action.element, action.oldNextSibling);
          console.log('✅ Element restored');
        } else {
          // Re-supprimer l'élément
          action.element.remove();
          console.log('🗑️ Element re-deleted');
        }
        break;
    }
  }

  /**
   * Enregistre une modification de style
   */
  function recordStyleChange(element, property, oldValue, newValue) {
    addToHistory({
      type: 'style',
      element: element,
      property: property,
      oldValue: oldValue,
      newValue: newValue,
      timestamp: new Date().toISOString()
    });

    // Aussi enregistrer dans les modifications pour l'export
    state.modifications.push({
      timestamp: new Date().toISOString(),
      element: getElementPath(element),
      type: 'style',
      property: property,
      value: newValue
    });
  }

  /**
   * Enregistre une modification de contenu HTML
   */
  function recordHTMLChange(element, oldValue, newValue) {
    addToHistory({
      type: 'innerHTML',
      element: element,
      oldValue: oldValue,
      newValue: newValue,
      timestamp: new Date().toISOString()
    });

    state.modifications.push({
      timestamp: new Date().toISOString(),
      element: getElementPath(element),
      type: 'innerHTML',
      value: newValue
    });
  }

  /**
   * Enregistre un déplacement d'élément
   */
  function recordMove(element, oldParent, oldNextSibling, newParent, newNextSibling) {
    addToHistory({
      type: 'moved',
      element: element,
      oldParent: oldParent,
      oldNextSibling: oldNextSibling,
      newParent: newParent,
      newNextSibling: newNextSibling,
      timestamp: new Date().toISOString()
    });

    state.modifications.push({
      timestamp: new Date().toISOString(),
      element: getElementPath(element),
      type: 'moved',
      value: getElementPath(element)
    });
  }

  /**
   * Enregistre une suppression d'élément
   */
  function recordDeletion(element, parent, nextSibling) {
    addToHistory({
      type: 'deleted',
      element: element,
      oldParent: parent,
      oldNextSibling: nextSibling,
      timestamp: new Date().toISOString()
    });

    state.modifications.push({
      timestamp: new Date().toISOString(),
      element: getElementPath(element),
      type: 'deleted',
      value: null
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
   * Toggle le DOM Inspector
   */
  function toggleDOMInspector() {
    const isVisible = ui.domInspector.style.display === 'flex';

    if (isVisible) {
      ui.domInspector.style.display = 'none';
    } else {
      ui.domInspector.style.display = 'flex';
      refreshDOMTree();
    }
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
      ui.domInspector.style.display = 'none';
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
