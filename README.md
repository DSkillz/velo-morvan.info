# Vélo Morvan – Site web statique

Site web complet dédié au cyclisme dans le parc naturel du Morvan. Guides, randonnées, conseils d'équipement et entretien pour tous les niveaux.

## Caractéristiques techniques

- **HTML + CSS purs** : aucun framework, aucun générateur statique
- **JavaScript minimaliste** : uniquement pour includes header/footer et Google Analytics (GA4)
- **Aucun appel externe** (hors GA4) : toutes les ressources (CSS, images, fonts) sont locales
- **Images WEBP 85%** : toutes les images en format WEBP qualité 85%
- **SEO optimisé** : meta tags complets, Open Graph, Twitter Cards, JSON-LD
- **Charte graphique nature** : couleurs apaisantes, typographie senior-friendly (18px min)
- **Affiliation Amazon** : intégration propre et conforme avec images produits locales

## Structure du projet

```
/
├── index.html                       # Page d'accueil
├── assets/
│   ├── css/
│   │   └── style.css               # Styles complets (charte nature)
│   ├── js/
│   │   └── includes.js             # Injection header/footer
│   ├── img/                        # Images placeholders et assets
│   │   ├── og-placeholder.webp
│   │   ├── hero-morvan-*.webp
│   │   ├── rando-placeholder-*.webp
│   │   ├── product-placeholder.webp
│   │   └── products/               # Images produits Amazon (générées par script)
│   └── fonts/
│       └── crimson-pro/            # Fonts Crimson Pro locales (WOFF2)
├── partials/
│   ├── header.html                 # Header commun
│   └── footer.html                 # Footer commun
├── decouvrir/                      # Section "Découvrir"
├── randonnees/                     # Section "Randonnées"
├── entretien/                      # Section "Entretien"
├── equipement/                     # Section "Équipement"
├── sejour/                         # Section "Séjour"
├── blog/                           # Blog
├── a-propos/                       # À propos
├── contact/                        # Contact
├── mentions-legales/               # Mentions légales
├── politique-affiliation-amazon/   # Politique affiliation
├── data/
│   ├── amazon.json                 # Données produits Amazon
│   └── amazon.enriched.json        # Généré par script (URLs + images)
├── tools/
│   ├── requirements.txt            # Dépendances Python
│   ├── download_fonts.py           # Téléchargement fonts Crimson Pro
│   ├── generate_placeholders.py    # Génération images placeholders
│   └── amazon_assets_sync.py       # Sync assets Amazon (images + URLs)
├── robots.txt                      # Robots.txt
├── sitemap.xml                     # Sitemap XML
└── README.md                       # Ce fichier
```

## Installation et déploiement

### Prérequis

- Python 3.8+ (pour les scripts d'outils uniquement)
- Un serveur web (Apache, Nginx) ou hébergement FTP/Plesk
- Aucune dépendance côté serveur (site 100% statique)

### Étape 1 : Installation des dépendances Python (optionnel)

Les scripts Python sont des outils offline pour préparer le site. Le site déployé n'a aucune dépendance Python.

```bash
pip install -r tools/requirements.txt
```

### Étape 2 : Télécharger les fonts Crimson Pro

Les fonts Crimson Pro doivent être présentes localement.

**Option 1 - Script automatique (recommandé) :**

```bash
python tools/download_fonts.py
```

**Option 2 - Téléchargement manuel :**

1. Aller sur [Google Fonts - Crimson Pro](https://fonts.google.com/specimen/Crimson+Pro)
2. Télécharger Regular, Italic, SemiBold (600), Bold (700)
3. Convertir en WOFF2 si nécessaire
4. Renommer et placer dans `assets/fonts/crimson-pro/`

### Étape 3 : Générer les images placeholders

Créer les images placeholders WEBP :

```bash
python tools/generate_placeholders.py
```

Cela génère :
- `og-placeholder.webp`
- `hero-morvan-1.webp`, `hero-morvan-2.webp`
- `rando-placeholder-1.webp`, `rando-placeholder-2.webp`
- `product-placeholder.webp`

**Important :** Remplacez ces placeholders par de vraies photos du Morvan pour un rendu professionnel.

### Étape 4 : Synchroniser les assets Amazon (optionnel)

Le script `amazon_assets_sync.py` télécharge les images produits Amazon et génère les URLs d'affiliation.

```bash
python tools/amazon_assets_sync.py
```

**Options :**
- `--force` : Force le retéléchargement des images existantes

**Ce que fait le script :**
1. Lit `data/amazon.json`
2. Pour chaque produit :
   - Construit l'URL d'affiliation : `https://www.amazon.fr/dp/{ASIN}/?tag=jack59-21`
   - Scrape la page Amazon pour récupérer l'image principale
   - Télécharge et convertit en WEBP 85%
   - Sauvegarde dans `assets/img/products/{ASIN}.webp`
3. Génère `data/amazon.enriched.json`

**Note :** Le script est un outil offline. Le site déployé ne fait aucun appel vers Amazon.

### Étape 5 : Configurer Google Analytics (GA4)

Remplacer le placeholder `G-XXXXXXXXXX` par votre vrai Measurement ID GA4 :

1. Créer une propriété GA4 sur [Google Analytics](https://analytics.google.com/)
2. Récupérer votre Measurement ID (format : `G-XXXXXXXXXX`)
3. Rechercher et remplacer dans **tous les fichiers HTML** :
   ```
   G-XXXXXXXXXX
   ```
   par votre vrai ID.

**Méthode rapide (rechercher/remplacer) :**

Sur Windows (PowerShell) :
```powershell
Get-ChildItem -Recurse -Filter *.html | ForEach-Object {
    (Get-Content $_.FullName) -replace 'G-XXXXXXXXXX', 'G-VOTRE-ID-ICI' | Set-Content $_.FullName
}
```

Sur Linux/Mac :
```bash
find . -name "*.html" -type f -exec sed -i 's/G-XXXXXXXXXX/G-VOTRE-ID-ICI/g' {} \;
```

### Étape 6 : Personnaliser les URLs du site

Remplacer `https://www.votredomaine.fr` par votre vrai domaine dans :
- Tous les fichiers HTML (meta OG, Twitter Cards, JSON-LD)
- `sitemap.xml`

### Étape 7 : Déployer via FTP

Le site est prêt à être déployé. Aucune étape de build nécessaire.

**Via FTP :**
1. Se connecter à votre hébergement via FTP (FileZilla, WinSCP, etc.)
2. Uploader **tous les fichiers et dossiers** à la racine de votre site
3. Vérifier les permissions (755 pour dossiers, 644 pour fichiers)

**Via Plesk :**
1. Aller dans "Gestionnaire de fichiers"
2. Uploader le contenu du dossier à la racine `httpdocs/`

**Via SSH/rsync :**
```bash
rsync -avz --progress ./ user@votreserveur.fr:/chemin/vers/site/
```

Le site est maintenant en ligne !

## Utilisation

### Ajouter une nouvelle page

1. Créer un dossier avec un fichier `index.html` :
   ```
   /ma-nouvelle-page/index.html
   ```

2. Utiliser le template de base (copier depuis une page existante) :
   - Head complet avec SEO
   - `<header data-include="header"></header>`
   - Breadcrumbs
   - Contenu principal
   - `<footer data-include="footer"></footer>`
   - Scripts includes.js et GA4

3. Ajouter l'URL dans `sitemap.xml`

### Ajouter une fiche de randonnée

1. Créer le fichier dans `/randonnees/fiche/nom-rando/index.html`
2. Utiliser la structure de fiche technique (voir exemple dans `exemple-boucle-saint-honore`)
3. Inclure :
   - Fiche technique (distance, dénivelé, durée, niveau, etc.)
   - Description du parcours
   - Points d'intérêt
   - Disclaimer
   - Au moins 1 image avec `border-radius: 20px` (automatique via CSS)

### Ajouter un produit Amazon

1. **Ajouter dans `data/amazon.json` :**

```json
{
  "slug": "mon-produit",
  "title": "Titre du produit",
  "asin": "B0XXXXXXXXX",
  "tag": "jack59-21",
  "marketplace": "FR",
  "usage": "Description de l'usage pour le Morvan",
  "tags": ["categorie", "type"]
}
```

2. **Lancer le script de sync :**

```bash
python tools/amazon_assets_sync.py
```

3. **Intégrer le CTA dans une page HTML :**

```html
<aside class="cta-amazon">
  <img
    class="cta-amazon__img"
    src="/assets/img/products/B0XXXXXXXXX.webp"
    alt="Description du produit"
    width="160"
    height="160"
    loading="lazy"
    decoding="async">
  <div class="cta-amazon__content">
    <h3>Titre du produit</h3>
    <ul>
      <li>Avantage 1</li>
      <li>Avantage 2</li>
      <li>Avantage 3</li>
    </ul>
    <a href="https://www.amazon.fr/dp/B0XXXXXXXXX/?tag=jack59-21"
       rel="nofollow sponsored"
       target="_blank">Voir sur Amazon</a>
    <p class="cta-amazon__note">Lien partenaire Amazon. Vérifie les compatibilités.</p>
  </div>
</aside>
```

**Règles CTA Amazon :**
- Maximum 1 à 3 CTA par page
- Jamais en haut de page
- Toujours contextualiser (répondre à un besoin)
- Toujours `rel="nofollow sponsored"`
- Image locale obligatoire (fallback sur `product-placeholder.webp`)

### Modifier le tag d'affiliation Amazon

Le tag actuel est `jack59-21`. Pour le remplacer par votre tag :

1. Modifier dans `data/amazon.json` (champ `tag`)
2. Relancer `python tools/amazon_assets_sync.py`
3. Mettre à jour manuellement les liens dans les pages HTML existantes

## Rappels importants

### Appels externes

**Le site ne fait AUCUN appel externe, sauf Google Analytics (GA4).**

- ❌ Pas de CSS distant (pas de Google Fonts CDN)
- ❌ Pas de JS distant (hors gtag GA4)
- ❌ Pas d'images distantes
- ❌ Pas d'API externes
- ✅ UNIQUEMENT GA4 : `googletagmanager.com`

**Tous les assets sont locaux** : CSS, fonts, images, JS (includes).

### Images

- **Toutes les images DOIVENT être en WEBP qualité 85%**
- **Toutes les images ont `border-radius: 20px`** (appliqué par CSS)
- Toujours renseigner `width`, `height` et `alt`
- Utiliser `loading="lazy"` (sauf hero)
- Utiliser `decoding="async"`

### SEO

Chaque page DOIT avoir :
- `<title>` unique incluant "Morvan"
- `<meta name="description">` unique
- Open Graph complet (og:type, og:title, og:description, og:url, og:image, og:locale)
- Twitter Card (twitter:card, twitter:title, twitter:description, twitter:image)
- JSON-LD BreadcrumbList
- JSON-LD Article (pour pages conseils et blog)

### Charte graphique

- **Base font-size : 18px minimum**
- **Line-height : 1.6 à 1.8**
- **Contraste AA minimum**
- **Couleurs nature** : verts forêt, lacs, terre
- **Border-radius 20px** pour toutes les images (automatique)
- **Layout aéré** : padding et margins généreux

## Scripts Python disponibles

### `download_fonts.py`

Télécharge les fonts Crimson Pro (WOFF2) depuis Google Fonts.

```bash
python tools/download_fonts.py
```

### `generate_placeholders.py`

Génère les images placeholders WEBP 85%.

```bash
python tools/generate_placeholders.py
```

### `amazon_assets_sync.py`

Synchronise les assets Amazon : télécharge images produits et génère URLs d'affiliation.

```bash
python tools/amazon_assets_sync.py [--force]
```

Options :
- `--force` : Force le retéléchargement des images existantes

## Maintenance

### Mettre à jour le contenu

1. Modifier les fichiers HTML directement
2. Re-uploader via FTP les fichiers modifiés
3. Vider le cache du navigateur pour voir les changements

### Mettre à jour le sitemap

Après ajout de nouvelles pages :
1. Modifier `sitemap.xml`
2. Ajouter les nouvelles URLs avec priorité et changefreq
3. Re-uploader `sitemap.xml`

### Ajouter de vraies photos

Remplacer les placeholders par de vraies photos du Morvan :
1. Prendre des photos (ou acheter des photos libres de droits)
2. Convertir en WEBP qualité 85% :
   ```bash
   cwebp -q 85 input.jpg -o output.webp
   ```
3. Remplacer dans `assets/img/`

## Support et contact

Pour toute question sur le projet :
- Email : contact@votredomaine.fr
- Voir la page [/contact/](/contact/)

## Licence

Tous les contenus de ce site (textes, images générées, structure) sont protégés. Voir [/mentions-legales/](/mentions-legales/) pour plus d'informations.

---

**Site généré le 5 janvier 2026**
**Vélo Morvan** – Découvrez le Morvan à vélo
