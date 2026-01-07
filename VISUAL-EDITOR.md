# 🎨 Visual Editor - Guide d'utilisation

Éditeur visuel en temps réel pour modifier HTML et CSS directement dans le navigateur.

## 🚀 Activation

**Raccourci clavier** : `Ctrl + E`

Une fois activé, vous verrez :
- ✅ Barre d'outils violette en haut à droite
- ✅ Curseur en forme de croix
- ✅ Overlay bleu au survol des éléments

## ✨ Fonctionnalités

### 1. Survol d'éléments
- **Passez la souris** sur n'importe quel élément
- Un **overlay bleu** s'affiche pour indiquer l'élément survolé
- Les éléments de l'éditeur lui-même sont ignorés

### 2. Sélection d'éléments
- **Cliquez** sur un élément pour le sélectionner
- Un **overlay vert** s'affiche autour de l'élément sélectionné
- Le **panneau d'édition** s'ouvre en bas à droite

### 3. Édition CSS en temps réel
Dans le panneau d'édition, vous pouvez modifier :
- `display` - Type d'affichage
- `position` - Positionnement
- `width` / `height` - Dimensions
- `margin` / `padding` - Espacements
- `background` / `color` - Couleurs
- `font-size` / `font-weight` - Typographie
- `text-align` - Alignement du texte
- `border` / `border-radius` - Bordures
- `box-shadow` - Ombres

**Les modifications sont appliquées instantanément** dès que vous tapez !

### 4. Édition HTML
- Champ **Tag** : Nom de la balise HTML (lecture seule pour le moment)
- Zone **Inner HTML** : Modifiez le contenu HTML de l'élément
- Les modifications s'appliquent en temps réel

### 5. Drag & Drop
1. Cliquez sur **🔒 Drag OFF** dans la toolbar pour activer le mode drag
2. Le bouton devient **🔓 Drag ON** (fond vert)
3. **Cliquez et glissez** n'importe quel élément pour le déplacer
4. Déposez-le avant ou après un autre élément
5. Le DOM est réorganisé en temps réel

### 6. Suppression d'éléments
- Bouton **🗑️ Delete Element** en bas du panneau
- Confirmation avant suppression
- L'élément disparaît immédiatement du DOM

### 7. Export des modifications
Cliquez sur **💾 Export** pour :
- 📄 **Télécharger un JSON** avec toutes les modifications
- 📋 **Copier le HTML complet** dans le presse-papier
- 📊 Voir le nombre total de modifications

Le fichier JSON contient :
```json
{
  "url": "http://127.0.0.1:5500/",
  "timestamp": "2026-01-07T...",
  "modifications": [
    {
      "timestamp": "...",
      "element": "main > section > div.card",
      "type": "style",
      "property": "background",
      "value": "#ff0000"
    }
  ],
  "html": "<!DOCTYPE html>..."
}
```

## 🎯 Cas d'usage

### Design rapide
- Tester différentes couleurs, tailles, espacements
- Voir immédiatement le rendu
- Exporter le code une fois satisfait

### Prototypage
- Réorganiser les éléments par drag & drop
- Modifier le contenu HTML
- Créer des variantes rapidement

### Debug CSS
- Identifier les propriétés qui posent problème
- Tester des corrections en direct
- Voir l'impact immédiat des changements

### Formation
- Expliquer visuellement comment fonctionne le CSS
- Montrer l'effet de chaque propriété
- Manipuler le DOM de manière interactive

## ⌨️ Raccourcis

| Raccourci | Action |
|-----------|--------|
| `Ctrl + E` | Toggle l'éditeur visuel |
| Clic | Sélectionner un élément |
| Drag & Drop | Déplacer un élément (si activé) |

## 🎨 Interface

### Toolbar (en haut à droite)
```
🎨 Visual Editor  |  🔒 Drag OFF  |  💾 Export  |  ✕
```

### Panneau d'édition (en bas à droite)
```
┌─────────────────────────────┐
│ Element Editor              │
│ main > section > div.card   │
├─────────────────────────────┤
│ HTML                        │
│ Tag: div                    │
│ Inner HTML: [textarea]      │
├─────────────────────────────┤
│ CSS Properties              │
│ display: [input]            │
│ position: [input]           │
│ ...                         │
├─────────────────────────────┤
│ 🗑️ Delete Element           │
└─────────────────────────────┘
```

## 🔒 Sécurité

- Les modifications sont **locales** au navigateur
- Aucune modification n'est envoyée au serveur
- Les changements disparaissent au rechargement (sauf si exportés)
- L'éditeur ignore ses propres éléments UI

## 💡 Astuces

1. **Hover précis** : Zoomez dans le navigateur pour sélectionner de petits éléments
2. **Modifications multiples** : Toutes vos modifications sont enregistrées pour l'export
3. **Drag & Drop** : Désactivez le mode drag quand vous ne l'utilisez pas pour éviter les accidents
4. **Chemin CSS** : Le chemin affiché en haut du panneau vous aide à identifier l'élément
5. **Export régulier** : Exportez régulièrement pour sauvegarder votre travail

## 🐛 Limitations connues

- Ne modifie pas les fichiers source (modifications en mémoire uniquement)
- Certains éléments avec `pointer-events: none` peuvent être difficiles à sélectionner
- Les modifications de structure complexe peuvent nécessiter un export + intégration manuelle

## 📝 Historique des modifications

Chaque modification est enregistrée avec :
- **Timestamp** : Date et heure exacte
- **Element** : Chemin CSS de l'élément
- **Type** : `style`, `innerHTML`, `moved`, `deleted`
- **Property** : Propriété modifiée (pour style)
- **Value** : Nouvelle valeur

Cela permet de rejouer les modifications ou de les intégrer dans votre code source.

---

**Créé avec ❤️ pour Vélo Morvan**
Appuyez sur `Ctrl + E` et commencez à éditer !
