# Pages juridiques bilingues

## Objectif
Ajouter les mentions légales et la politique de confidentialité en français et en anglais, dans le style éditorial existant, puis les inclure dans l’export statique OVH.

## Mise en œuvre
- Créer `/mentions-legales` et `/confidentialite` avec l’intégralité des contenus français fournis.
- Créer `/en/legal-notice` et `/en/privacy` avec une traduction anglaise naturelle et fidèle.
- Ajouter une mise en page juridique sobre reprenant Archivo, les fonds ivoire/noir, le menu, le pied de page et la gestion des cookies du site.
- Relier les liens juridiques des pieds de page aux pages de la langue correspondante et ajouter la mention de confidentialité sous chaque formulaire.
- Ajouter les quatre pages au pré-rendu, au plan du site et aux contrôles de l’export OVH.
- Conserver visibles les mentions « À compléter » du document source, traduites en anglais, sans inventer les informations manquantes.

## Vérification
- Contrôler les quatre pages et tous leurs liens sur ordinateur et mobile.
- Vérifier les métadonnées propres à chaque page et la langue du document.
- Reconstruire `ovh-dist` et confirmer la présence des quatre fichiers HTML pré-rendus.
