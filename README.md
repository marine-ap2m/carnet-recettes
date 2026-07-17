# 🍝 Mes Recettes — mes recettes Instagram

Une petite appli perso (PWA) pour sauvegarder ses recettes Instagram comme dans un livre de
cuisine, et générer automatiquement la liste de courses des recettes sélectionnées.

**100 % gratuit** : hébergée sur GitHub Pages, données stockées sur le téléphone
(localStorage), aucun serveur.

## Fonctionnalités

- 📖 **Livre de recettes** : grille avec photo (emoji), compte Instagram d'origine, temps,
  catégories (Plat, Dessert, Veggie, Rapide…), recherche.
- ➕ **Ajout depuis Instagram** : coller le lien du reel + la légende du post ; les
  ingrédients et les étapes sont détectés automatiquement (quantités, unités, rayon),
  puis on vérifie et on enregistre.
- 🍽️ **Fiche recette** : ingrédients avec ajustement du nombre de portions, étapes,
  lien vers le reel d'origine, modification et suppression.
- 🧺 **Liste de courses automatique** : on coche des recettes, la liste additionne les
  quantités entre recettes (3 recettes avec des œufs → « Œufs : 9 ») et les regroupe
  par rayon de magasin. Cases à cocher pendant les courses, partage/copie de la liste.
- 📵 **Hors ligne** : service worker, l'appli fonctionne sans connexion une fois ouverte.

## Installation sur téléphone

1. Ouvrir l'adresse GitHub Pages du projet dans le navigateur du téléphone :
   `https://marine-ap2m.github.io/carnet-recettes/`
2. Menu du navigateur → **« Ajouter à l'écran d'accueil »** (Android/Chrome) ou
   **Partager → « Sur l'écran d'accueil »** (iPhone/Safari).
3. Une icône « Carnet » apparaît : l'appli s'ouvre en plein écran, comme une vraie appli.

## Déploiement

Chaque push sur `main` déploie automatiquement sur GitHub Pages via
`.github/workflows/pages.yml`. Si le premier déploiement échoue, activer Pages une fois :
**Settings → Pages → Source : GitHub Actions**.

## Notes techniques

- Aucune dépendance, aucun build : HTML + CSS + JS vanilla.
- Les données restent dans le navigateur (`localStorage`). Vider les données du site =
  perdre les recettes ; une synchronisation Supabase (multi-appareils + sauvegarde)
  est prévue comme étape 2.
- L'analyse de légende est heuristique : elle repère les lignes « quantité + unité +
  ingrédient » et les sections « Ingrédients / Préparation » ; tout est éditable avant
  d'enregistrer.
