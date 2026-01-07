#!/usr/bin/env python3
"""
Script pour ajouter navigation.js à tous les fichiers HTML
"""

import os
import sys
import re

def add_navigation_script(file_path):
    """Ajoute le script navigation.js si absent"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Vérifier si navigation.js est déjà présent
        if 'navigation.js' in content:
            return False  # Déjà présent

        # Pattern pour trouver includes.js
        pattern = r'(<script src="/assets/js/includes\.js" defer></script>)'
        replacement = r'\1\n\n  <!-- Navigation responsive -->\n  <script src="/assets/js/navigation.js" defer></script>'

        # Remplacer
        new_content, count = re.subn(pattern, replacement, content)

        if count > 0:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            return True
        else:
            print(f"  [SKIP] Pattern non trouve : {file_path}")
            return False

    except Exception as e:
        print(f"  [ERREUR] {file_path}: {e}")
        return False

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)

    print("="*60)
    print("Ajout du script navigation.js aux fichiers HTML")
    print("="*60)
    print()

    count_updated = 0
    count_skipped = 0
    count_total = 0

    # Parcourir tous les fichiers HTML
    for root, dirs, files in os.walk(project_root):
        # Ignorer le dossier tools
        if 'tools' in root:
            continue

        for file in files:
            if file.endswith('.html'):
                count_total += 1
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, project_root)

                if add_navigation_script(file_path):
                    print(f"[OK] {rel_path}")
                    count_updated += 1
                else:
                    count_skipped += 1

    print()
    print("="*60)
    print(f"Total fichiers HTML : {count_total}")
    print(f"Fichiers mis a jour : {count_updated}")
    print(f"Fichiers ignores    : {count_skipped}")
    print("="*60)

    return 0 if count_updated > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
