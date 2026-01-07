#!/usr/bin/env python3
"""
Amazon Assets Sync - Synchronisation des assets Amazon
Télécharge les images produits Amazon et génère les URLs d'affiliation
"""

import os
import sys
import json
import time
import argparse
from urllib.parse import urljoin

try:
    import requests
    from bs4 import BeautifulSoup
    from PIL import Image
    from io import BytesIO
except ImportError as e:
    print(f"Erreur: Dependances manquantes - {e}")
    print("Installation: pip install -r tools/requirements.txt")
    sys.exit(1)


class AmazonAssetsSync:
    """Synchronisation des assets produits Amazon"""

    def __init__(self, data_file, output_dir, force=False):
        self.data_file = data_file
        self.output_dir = output_dir
        self.force = force
        self.products_dir = os.path.join(output_dir, 'products')
        self.enriched_file = os.path.join(
            os.path.dirname(data_file), 'amazon.enriched.json'
        )

        # User-Agent pour simuler un navigateur
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        }

        # Stats
        self.stats = {
            'total': 0,
            'success': 0,
            'skipped': 0,
            'failed': 0
        }

    def load_products(self):
        """Charge les produits depuis amazon.json"""
        print(f"Chargement des produits depuis {self.data_file}...")
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                products = json.load(f)
            print(f"[OK] {len(products)} produits charges")
            return products
        except Exception as e:
            print(f"[ERREUR] Impossible de charger {self.data_file}: {e}")
            sys.exit(1)

    def build_affiliate_url(self, asin, tag, marketplace='FR'):
        """Construit l'URL d'affiliation Amazon"""
        domain_map = {
            'FR': 'amazon.fr',
            'UK': 'amazon.co.uk',
            'DE': 'amazon.de',
            'ES': 'amazon.es',
            'IT': 'amazon.it',
        }
        domain = domain_map.get(marketplace, 'amazon.fr')
        return f"https://www.{domain}/dp/{asin}/?tag={tag}"

    def fetch_product_image(self, asin, marketplace='FR'):
        """Récupère l'URL de l'image principale du produit via scraping"""
        domain_map = {
            'FR': 'amazon.fr',
            'UK': 'amazon.co.uk',
            'DE': 'amazon.de',
        }
        domain = domain_map.get(marketplace, 'amazon.fr')
        url = f"https://www.{domain}/dp/{asin}"

        try:
            print(f"  Recuperation image depuis {url}...")
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Stratégie 1 : image principale (#landingImage)
            img_tag = soup.find('img', {'id': 'landingImage'})
            if img_tag and img_tag.get('src'):
                return img_tag['src']

            # Stratégie 2 : image principale alternative
            img_tag = soup.find('img', {'data-old-hires': True})
            if img_tag:
                return img_tag.get('data-old-hires') or img_tag.get('src')

            # Stratégie 3 : chercher dans les données JSON-LD
            scripts = soup.find_all('script', {'type': 'application/ld+json'})
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if 'image' in data:
                        img_url = data['image']
                        if isinstance(img_url, list):
                            return img_url[0]
                        return img_url
                except:
                    pass

            # Stratégie 4 : première image trouvée dans #imageBlock
            img_block = soup.find('div', {'id': 'imageBlock'})
            if img_block:
                img_tag = img_block.find('img')
                if img_tag and img_tag.get('src'):
                    return img_tag['src']

            print("  [WARNING] Impossible de trouver l'image produit")
            return None

        except requests.RequestException as e:
            print(f"  [ERREUR] Echec recuperation: {e}")
            return None
        except Exception as e:
            print(f"  [ERREUR] Erreur parsing HTML: {e}")
            return None

    def download_and_convert_image(self, image_url, output_path):
        """Télécharge une image et la convertit en WEBP qualité 85%"""
        try:
            print(f"  Telechargement image...")
            response = requests.get(image_url, headers=self.headers, timeout=15)
            response.raise_for_status()

            # Ouvrir l'image avec PIL
            img = Image.open(BytesIO(response.content))

            # Convertir en RGB si nécessaire (WEBP ne supporte pas RGBA dans tous les cas)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Sauvegarder en WEBP qualité 85%
            img.save(output_path, 'WEBP', quality=85)
            print(f"  [OK] Image sauvegardee: {os.path.basename(output_path)}")
            return True

        except Exception as e:
            print(f"  [ERREUR] Echec telechargement/conversion: {e}")
            return False

    def process_product(self, product):
        """Traite un produit : télécharge image et enrichit les données"""
        asin = product['asin']
        tag = product['tag']
        marketplace = product.get('marketplace', 'FR')

        print(f"\n--- Produit: {product['title']} (ASIN: {asin}) ---")

        # Construire l'URL d'affiliation
        affiliate_url = self.build_affiliate_url(asin, tag, marketplace)

        # Chemin de l'image locale
        local_image_path = os.path.join(self.products_dir, f"{asin}.webp")
        local_image_relative = f"/assets/img/products/{asin}.webp"

        # Vérifier si l'image existe déjà
        if os.path.exists(local_image_path) and not self.force:
            print(f"  [SKIP] Image deja existante (utiliser --force pour retelecharger)")
            self.stats['skipped'] += 1
            return {
                **product,
                'affiliate_url': affiliate_url,
                'local_image': local_image_relative
            }

        # Récupérer l'URL de l'image
        image_url = self.fetch_product_image(asin, marketplace)

        if not image_url:
            print(f"  [FAIL] Impossible de recuperer l'image pour {asin}")
            self.stats['failed'] += 1
            return {
                **product,
                'affiliate_url': affiliate_url,
                'local_image': '/assets/img/product-placeholder.webp'  # Fallback
            }

        # Télécharger et convertir
        if self.download_and_convert_image(image_url, local_image_path):
            self.stats['success'] += 1
            return {
                **product,
                'affiliate_url': affiliate_url,
                'local_image': local_image_relative
            }
        else:
            self.stats['failed'] += 1
            return {
                **product,
                'affiliate_url': affiliate_url,
                'local_image': '/assets/img/product-placeholder.webp'  # Fallback
            }

    def run(self):
        """Lance la synchronisation"""
        print("="*70)
        print("Amazon Assets Sync - Synchronisation des assets produits")
        print("="*70)

        # Créer le dossier de sortie
        os.makedirs(self.products_dir, exist_ok=True)

        # Charger les produits
        products = self.load_products()
        self.stats['total'] = len(products)

        # Traiter chaque produit
        enriched_products = []
        for i, product in enumerate(products, 1):
            print(f"\n[{i}/{self.stats['total']}]")
            enriched = self.process_product(product)
            enriched_products.append(enriched)

            # Pause pour éviter de surcharger Amazon
            if i < self.stats['total']:
                time.sleep(2)  # 2 secondes entre chaque requête

        # Sauvegarder le fichier enrichi
        print(f"\n{'='*70}")
        print(f"Sauvegarde du fichier enrichi: {self.enriched_file}")
        try:
            with open(self.enriched_file, 'w', encoding='utf-8') as f:
                json.dump(enriched_products, f, indent=2, ensure_ascii=False)
            print("[OK] Fichier enrichi sauvegarde")
        except Exception as e:
            print(f"[ERREUR] Impossible de sauvegarder {self.enriched_file}: {e}")

        # Afficher les statistiques
        print(f"\n{'='*70}")
        print("STATISTIQUES")
        print(f"{'='*70}")
        print(f"Total produits     : {self.stats['total']}")
        print(f"Succes             : {self.stats['success']}")
        print(f"Deja existantes    : {self.stats['skipped']}")
        print(f"Echecs             : {self.stats['failed']}")
        print(f"{'='*70}")

        if self.stats['failed'] > 0:
            print("\n[WARNING] Certaines images n'ont pas pu etre recuperees.")
            print("Les produits utilisent l'image placeholder de fallback.")

        return 0 if self.stats['failed'] == 0 else 1


def main():
    parser = argparse.ArgumentParser(
        description='Synchronisation des assets produits Amazon'
    )
    parser.add_argument(
        '--force',
        action='store_true',
        help='Force le retelechargeement des images existantes'
    )
    args = parser.parse_args()

    # Chemins
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    data_file = os.path.join(project_root, 'data', 'amazon.json')
    output_dir = os.path.join(project_root, 'assets', 'img')

    # Vérifier que amazon.json existe
    if not os.path.exists(data_file):
        print(f"[ERREUR] Fichier {data_file} introuvable")
        print("Assurez-vous que data/amazon.json existe")
        return 1

    # Lancer la synchronisation
    sync = AmazonAssetsSync(data_file, output_dir, force=args.force)
    return sync.run()


if __name__ == '__main__':
    sys.exit(main())
