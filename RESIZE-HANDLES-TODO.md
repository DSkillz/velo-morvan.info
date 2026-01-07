# 🎯 TODO: Poignées de redimensionnement visuelles

## ✅ Ce qui est fait

1. **Structure des poignées créée**
   - `createResizeHandles()` → 8 poignées de redimensionnement (N, S, E, W, NE, NW, SE, SW)
   - `createBoxModelOverlay()` → Overlay margin/padding avec poignées
   - UI elements ajoutés à `ui.resizeHandles` et `ui.boxModelOverlay`

2. **DOM Inspector minimisable**
   - Bouton −/+ dans le header
   - Double-clic pour minimiser
   - Fonctionne parfaitement

## 🔨 Ce qu'il reste à implémenter

### Fonctions manquantes à ajouter dans `visual-editor.js` (avant `attachEventListeners()`)

```javascript
/**
 * Attache les listeners pour les poignées de redimensionnement
 */
function attachResizeHandleListeners() {
  ui.resizeHandles.querySelectorAll('.ve-resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      startResize(e, handle.dataset.position);
    });
  });
}

/**
 * Attache les listeners pour les poignées margin/padding
 */
function attachMarginPaddingHandleListeners() {
  // Margin handles
  ui.boxModelOverlay.querySelectorAll('.ve-margin-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      startMarginPaddingDrag(e, 'margin', handle.dataset.side);
    });
  });

  // Padding handles
  ui.boxModelOverlay.querySelectorAll('.ve-padding-handle').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      startMarginPaddingDrag(e, 'padding', handle.dataset.side);
    });
  });
}

/**
 * Démarre le redimensionnement
 */
function startResize(e, position) {
  if (!state.selectedElement) return;

  const element = state.selectedElement;
  const startX = e.clientX;
  const startY = e.clientY;
  const computedStyle = window.getComputedStyle(element);
  const startWidth = parseFloat(computedStyle.width);
  const startHeight = parseFloat(computedStyle.height);

  function onMouseMove(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;

    // Calculer selon la position de la poignée
    if (position.includes('e')) newWidth = startWidth + deltaX;
    if (position.includes('w')) newWidth = startWidth - deltaX;
    if (position.includes('s')) newHeight = startHeight + deltaY;
    if (position.includes('n')) newHeight = startHeight - deltaY;

    // Contraintes minimales
    newWidth = Math.max(10, newWidth);
    newHeight = Math.max(10, newHeight);

    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;

    updateAllOverlays(element);
  }

  function onMouseUp(e) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    const newWidth = element.style.width;
    const newHeight = element.style.height;
    recordStyleChange(element, 'width', `${startWidth}px`, newWidth);
    recordStyleChange(element, 'height', `${startHeight}px`, newHeight);

    console.log('✅ Resize completed:', newWidth, newHeight);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/**
 * Démarre le drag margin/padding
 */
function startMarginPaddingDrag(e, type, side) {
  if (!state.selectedElement) return;

  const element = state.selectedElement;
  const startX = e.clientX;
  const startY = e.clientY;
  const computedStyle = window.getComputedStyle(element);
  const property = `${type}-${side}`;
  const propName = `${type}${side.charAt(0).toUpperCase() + side.slice(1)}`;
  const startValue = parseFloat(computedStyle[propName]) || 0;

  function onMouseMove(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    let delta = 0;
    if (side === 'top') delta = deltaY;
    if (side === 'right') delta = deltaX;
    if (side === 'bottom') delta = deltaY;
    if (side === 'left') delta = deltaX;

    const newValue = Math.max(0, startValue + delta);
    element.style[propName] = `${newValue}px`;

    updateAllOverlays(element);
  }

  function onMouseUp(e) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    const finalValue = element.style[propName];
    recordStyleChange(element, property, `${startValue}px`, finalValue);

    console.log(`✅ ${type}-${side} updated:`, finalValue);
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
}

/**
 * Met à jour tous les overlays
 */
function updateAllOverlays(element) {
  if (!element) return;

  updateOverlay(ui.selectedOverlay, element);
  updateResizeHandles(element);
  updateBoxModelOverlay(element);
}

/**
 * Met à jour les poignées de redimensionnement
 */
function updateResizeHandles(element) {
  const rect = element.getBoundingClientRect();
  ui.resizeHandles.style.display = 'block';
  ui.resizeHandles.style.top = `${window.scrollY + rect.top}px`;
  ui.resizeHandles.style.left = `${window.scrollX + rect.left}px`;
  ui.resizeHandles.style.width = `${rect.width}px`;
  ui.resizeHandles.style.height = `${rect.height}px`;
}

/**
 * Met à jour l'overlay du box model (margin/padding)
 */
function updateBoxModelOverlay(element) {
  const rect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);

  const marginTop = parseFloat(computed.marginTop) || 0;
  const marginRight = parseFloat(computed.marginRight) || 0;
  const marginBottom = parseFloat(computed.marginBottom) || 0;
  const marginLeft = parseFloat(computed.marginLeft) || 0;

  const paddingTop = parseFloat(computed.paddingTop) || 0;
  const paddingRight = parseFloat(computed.paddingRight) || 0;
  const paddingBottom = parseFloat(computed.paddingBottom) || 0;
  const paddingLeft = parseFloat(computed.paddingLeft) || 0;

  ui.boxModelOverlay.style.display = 'block';

  // Margin overlay
  const marginOverlay = document.getElementById('ve-margin-overlay');
  marginOverlay.style.top = `${window.scrollY + rect.top - marginTop}px`;
  marginOverlay.style.left = `${window.scrollX + rect.left - marginLeft}px`;
  marginOverlay.style.width = `${rect.width + marginLeft + marginRight}px`;
  marginOverlay.style.height = `${rect.height + marginTop + marginBottom}px`;

  // Padding overlay
  const paddingOverlay = document.getElementById('ve-padding-overlay');
  paddingOverlay.style.top = `${window.scrollY + rect.top + paddingTop}px`;
  paddingOverlay.style.left = `${window.scrollX + rect.left + paddingLeft}px`;
  paddingOverlay.style.width = `${rect.width - paddingLeft - paddingRight}px`;
  paddingOverlay.style.height = `${rect.height - paddingTop - paddingBottom}px`;

  // Positionner les poignées margin
  const marginHandles = {
    top: document.querySelector('.ve-margin-top'),
    right: document.querySelector('.ve-margin-right'),
    bottom: document.querySelector('.ve-margin-bottom'),
    left: document.querySelector('.ve-margin-left')
  };

  marginHandles.top.style.top = `${window.scrollY + rect.top - marginTop / 2 - 4}px`;
  marginHandles.top.style.left = `${window.scrollX + rect.left + rect.width / 2 - 20}px`;

  marginHandles.right.style.top = `${window.scrollY + rect.top + rect.height / 2 - 20}px`;
  marginHandles.right.style.left = `${window.scrollX + rect.left + rect.width + marginRight / 2 - 4}px`;

  marginHandles.bottom.style.top = `${window.scrollY + rect.top + rect.height + marginBottom / 2 - 4}px`;
  marginHandles.bottom.style.left = `${window.scrollX + rect.left + rect.width / 2 - 20}px`;

  marginHandles.left.style.top = `${window.scrollY + rect.top + rect.height / 2 - 20}px`;
  marginHandles.left.style.left = `${window.scrollX + rect.left - marginLeft / 2 - 4}px`;

  // Positionner les poignées padding
  const paddingHandles = {
    top: document.querySelector('.ve-padding-top'),
    right: document.querySelector('.ve-padding-right'),
    bottom: document.querySelector('.ve-padding-bottom'),
    left: document.querySelector('.ve-padding-left')
  };

  paddingHandles.top.style.top = `${window.scrollY + rect.top + paddingTop / 2 - 4}px`;
  paddingHandles.top.style.left = `${window.scrollX + rect.left + rect.width / 2 - 20}px`;

  paddingHandles.right.style.top = `${window.scrollY + rect.top + rect.height / 2 - 20}px`;
  paddingHandles.right.style.left = `${window.scrollX + rect.left + rect.width - paddingRight / 2 - 4}px`;

  paddingHandles.bottom.style.top = `${window.scrollY + rect.top + rect.height - paddingBottom / 2 - 4}px`;
  paddingHandles.bottom.style.left = `${window.scrollX + rect.left + rect.width / 2 - 20}px`;

  paddingHandles.left.style.top = `${window.scrollY + rect.top + rect.height / 2 - 20}px`;
  paddingHandles.left.style.left = `${window.scrollX + rect.left + paddingLeft / 2 - 4}px`;
}
```

### Modifier la fonction updatePanel()

Dans `updatePanel(element)`, à la fin, ajouter :
```javascript
// Afficher les poignées de redimensionnement
updateAllOverlays(element);
```

### Modifier handleClick()

Dans `handleClick(e)`, après `updatePanel(target);`, ajouter :
```javascript
// Afficher les poignées pour l'élément sélectionné
updateAllOverlays(target);
```

### Modifier toggleEditor()

Dans `toggleEditor()`, dans le `else` (quand on ferme l'éditeur), ajouter :
```javascript
ui.resizeHandles.style.display = 'none';
ui.boxModelOverlay.style.display = 'none';
```

## 🎨 Ce que ça va donner

- **8 poignées bleues** autour de l'élément sélectionné pour resize
- **Overlay orange** pour visualiser les margins
- **Overlay vert** pour visualiser les padding
- **4 poignées oranges** pour ajuster les margins (haut, droite, bas, gauche)
- **4 poignées vertes** pour ajuster les padding
- **Tout en drag & drop temps réel !**
- **Intégré avec undo/redo !**

## 🚀 Test

1. Sélectionnez un élément
2. Les poignées apparaissent automatiquement
3. **Glissez les poignées bleues** → redimensionne l'élément
4. **Glissez les poignées oranges** → ajuste les margins
5. **Glissez les poignées vertes** → ajuste les padding
6. **Ctrl+Z** pour annuler !

C'est comme Figma mais pour le web ! 🎉
