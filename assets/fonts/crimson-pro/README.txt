FONTS CRIMSON PRO - Installation requise
========================================

Les fichiers de fonts Crimson Pro doivent être placés dans ce dossier.

OPTION 1 - Script automatique (recommandé) :
---------------------------------------------
Exécuter depuis la racine du projet :
  python tools/download_fonts.py

OPTION 2 - Téléchargement manuel :
-----------------------------------
1. Aller sur Google Fonts : https://fonts.google.com/specimen/Crimson+Pro
2. Télécharger les variantes Regular, Italic, SemiBold (600), Bold (700)
3. Convertir en WOFF2 si nécessaire (via https://cloudconvert.com/ttf-to-woff2)
4. Renommer les fichiers comme suit :
   - CrimsonPro-Regular.woff2
   - CrimsonPro-Italic.woff2
   - CrimsonPro-SemiBold.woff2
   - CrimsonPro-Bold.woff2
5. Placer les fichiers dans ce dossier

Les fonts sont déjà déclarées dans assets/css/style.css
