#!/usr/bin/env python3
"""
Génération des images placeholders en WEBP qualité 85%
Crée des images de remplacement pour le site Vélo Morvan
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Erreur: PIL (Pillow) n'est pas installé.")
    print("Installation: pip install Pillow")
    sys.exit(1)


def create_placeholder(width, height, text, filename, output_dir):
    """Crée une image placeholder WEBP"""
    # Couleurs nature Morvan
    bg_color = (139, 142, 35)  # Vert olive nature
    text_color = (250, 250, 248)  # Blanc cassé

    # Créer l'image
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Ajouter un dégradé simple (deux rectangles)
    overlay = Image.new('RGB', (width, height), (74, 130, 44))
    img.paste(overlay, (0, height // 2), mask=None)
    img = Image.blend(img, overlay, alpha=0.3)
    draw = ImageDraw.Draw(img)

    # Texte
    try:
        # Essayer de charger une font système
        font_size = max(20, min(width, height) // 20)
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()

    # Centrer le texte
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    position = ((width - text_width) // 2, (height - text_height) // 2)

    draw.text(position, text, fill=text_color, font=font)

    # Dimensions en bas à droite
    dim_text = f"{width}×{height}"
    dim_bbox = draw.textbbox((0, 0), dim_text, font=font)
    dim_width = dim_bbox[2] - dim_bbox[0]
    dim_position = (width - dim_width - 20, height - 40)
    draw.text(dim_position, dim_text, fill=text_color, font=font)

    # Sauvegarder en WEBP qualité 85%
    output_path = os.path.join(output_dir, filename)
    img.save(output_path, 'WEBP', quality=85)
    print(f"[OK] Cree : {filename} ({width}x{height})")


def main():
    # Chemins
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    img_dir = os.path.join(project_root, 'assets', 'img')
    products_dir = os.path.join(img_dir, 'products')

    # Créer les dossiers si nécessaire
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(products_dir, exist_ok=True)

    print("="*60)
    print("Génération des images placeholders WEBP (qualité 85%)")
    print("="*60)

    # Images à créer
    placeholders = [
        # (largeur, hauteur, texte, nom fichier)
        (1200, 630, "Vélo Morvan\nOG Image", "og-placeholder.webp"),
        (1600, 900, "Vélo dans le Morvan\nPaysages et nature", "hero-morvan-1.webp"),
        (1600, 900, "Randonnées Morvan\nForêts et lacs", "hero-morvan-2.webp"),
        (800, 600, "Randonnée Morvan\nPlaceholder", "rando-placeholder-1.webp"),
        (800, 600, "Balade VTT\nPlaceholder", "rando-placeholder-2.webp"),
        (400, 400, "Produit Amazon\nPlaceholder", "product-placeholder.webp"),
    ]

    for width, height, text, filename in placeholders:
        create_placeholder(width, height, text, filename, img_dir)

    print()
    print("="*60)
    print(f"[OK] {len(placeholders)} images placeholders creees")
    print(f"  Repertoire : {img_dir}")
    print("="*60)
    print()
    print("Note : Remplacez ces placeholders par de vraies photos du Morvan")
    print("       pour un rendu professionnel.")

    return 0


if __name__ == '__main__':
    sys.exit(main())
