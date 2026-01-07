#!/usr/bin/env python3
"""
Script de téléchargement des fonts Crimson Pro (WOFF2)
Utilise google-webfonts-helper pour obtenir les URLs correctes
"""

import os
import sys
import urllib.request
import json

def download_font(url, destination):
    """Télécharge un fichier de font"""
    print(f"Telechargement : {os.path.basename(destination)}...", end=' ')
    try:
        urllib.request.urlretrieve(url, destination)
        print("[OK]")
        return True
    except Exception as e:
        print(f"[ERREUR] : {e}")
        return False

def main():
    # Chemins
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    fonts_dir = os.path.join(project_root, 'assets', 'fonts', 'crimson-pro')

    # Créer le dossier si nécessaire
    os.makedirs(fonts_dir, exist_ok=True)

    print("="*60)
    print("Telechargement des fonts Crimson Pro (WOFF2)")
    print("="*60)

    # URLs correctes depuis google-webfonts-helper
    # Ces URLs sont stables et pointent vers les fichiers WOFF2
    fonts = {
        'CrimsonPro-Regular.woff2': 'https://fonts.gstatic.com/s/crimsonpro/v23/q5uUsoa5M_tv7IihmnkabC5XiXCAlXGks1WZTm18OJE_VNWoyQ.woff2',
        'CrimsonPro-Italic.woff2': 'https://fonts.gstatic.com/s/crimsonpro/v23/q5uSsoa5M_tv7IihmnkabC5XiXCAlXGks1WZzm1DOJc_fdWoybxw.woff2',
        'CrimsonPro-SemiBold.woff2': 'https://fonts.gstatic.com/s/crimsonpro/v23/q5uUsoa5M_tv7IihmnkabC5XiXCAlXGks1WZKmh8OJE_VNWoyQ.woff2',
        'CrimsonPro-Bold.woff2': 'https://fonts.gstatic.com/s/crimsonpro/v23/q5uUsoa5M_tv7IihmnkabC5XiXCAlXGks1WZSmh8OJE_VNWoyQ.woff2',
    }

    # Alternative : télécharger depuis le dépôt GitHub de la font
    # Si les URLs Google Fonts ne fonctionnent pas
    github_fonts = {
        'CrimsonPro-Regular.woff2': 'https://github.com/Fonthausen/CrimsonPro/raw/master/fonts/webfonts/CrimsonPro-Regular.woff2',
        'CrimsonPro-Italic.woff2': 'https://github.com/Fonthausen/CrimsonPro/raw/master/fonts/webfonts/CrimsonPro-Italic.woff2',
        'CrimsonPro-SemiBold.woff2': 'https://github.com/Fonthausen/CrimsonPro/raw/master/fonts/webfonts/CrimsonPro-SemiBold.woff2',
        'CrimsonPro-Bold.woff2': 'https://github.com/Fonthausen/CrimsonPro/raw/master/fonts/webfonts/CrimsonPro-Bold.woff2',
    }

    success_count = 0
    total = len(fonts)

    for filename, url in fonts.items():
        destination = os.path.join(fonts_dir, filename)

        # Vérifier si le fichier existe déjà
        if os.path.exists(destination):
            print(f"Fichier existant : {filename} (passage)")
            success_count += 1
            continue

        # Essayer d'abord avec les URLs Google Fonts
        if download_font(url, destination):
            success_count += 1
        else:
            # Si échec, essayer avec GitHub
            print(f"  Nouvelle tentative depuis GitHub...")
            github_url = github_fonts.get(filename)
            if github_url and download_font(github_url, destination):
                success_count += 1

    print()
    print("="*60)
    print(f"Resultat : {success_count}/{total} fichiers disponibles")

    if success_count == total:
        print("[OK] Toutes les fonts sont installees !")
    else:
        print()
        print("Certaines fonts n'ont pas pu etre telechargees.")
        print("Solution manuelle :")
        print("  1. Aller sur https://fonts.google.com/specimen/Crimson+Pro")
        print("  2. Telecharger les variantes necessaires")
        print("  3. Convertir en WOFF2 si necessaire")
        print(f"  4. Placer dans : {fonts_dir}")

    print("="*60)

    return 0 if success_count == total else 1

if __name__ == '__main__':
    sys.exit(main())
