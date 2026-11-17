# Trame · site

Site de Trame : accueil et tarifs. HTML, CSS et JavaScript statiques, sans dépendance ni service tiers chargé.

C'est le site de Trame. Il remplace l'ancienne landing Trame (`trame-landing`), dont l'adresse redirige désormais ici. Il est séparé de l'application : on ne se connecte pas sur le site.

En ligne : https://balthaduchaffaut-dotcom.github.io/trame-site/ (page `noindex`). Aperçu local :

```bash
python3 -m http.server 8767 --directory .
```

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil (repris de la landing Trame), formulaire d'inscription, mentions légales et confidentialité. |
| `tarifs.html` | Trois formules, estimation selon le nombre d'arrivées, questions fréquentes, bandeau démo. |
| `site.css`, `site.js` | Styles et comportements communs (menu des petits écrans, mesure, formulaire, estimation, démo, survol du hero). |

## Mise en page

Sur ordinateur, chaque section de l'accueil tient dans la hauteur de l'écran (tailles en `svh`, testé à 1280×720, 1440×800 et 1920×1000) : l'ordinateur du hero apparaît en entier dès l'arrivée. Le visuel des intégrations est une recomposition de « trame konnect » (mêmes tuiles, fils redessinés) : un bandeau large et aplati sous le titre sur ordinateur (`trame-connect-large-*`, 3,6:1, le T plus petit au centre), une version verticale sur mobile et tablette (`trame-connect-portrait-*`). Les pictogrammes de la section « Pour l'arrivant » sont agrandis dans leur case (leur image a une large marge de papier).

## Sections ajoutées après l'analyse de Weloom (17 novembre 2026)

- **Vos données**, sous le hero : hébergement à Paris (Supabase et Vercel) et aucun entraînement d'IA sur les contenus, confirmés par l'équipe.
- **Comparatif** (`#comparatif`) : trois objections (« On a déjà ChatGPT / Notion / un LMS ») et un tableau ChatGPT, Notion, LMS, Trame. Les cases de Trame ne reprennent que ce que le site affirme déjà ; sur mobile, le tableau défile dans son cadre.
- **L'offre gratuite** dans la section Commencer : parti pris (le temps investi fait la qualité, pas la vitesse), ce que vous obtenez, ce que nous demandons, pour qui.

## Vérifier

Avec le site servi en local (`python3 -m http.server 8767 --directory .`) :

```bash
node outils/verifier.mjs http://127.0.0.1:8767/
node outils/mesurer.mjs http://127.0.0.1:8767/
```

`verifier.mjs` contrôle le débordement, le hero, les visuels, le comparatif, le formulaire, l'absence de requête externe et d'erreur ; `mesurer.mjs` donne la hauteur de chaque section face à l'écran (Chrome requis).

## À renseigner (en haut de `site.js`)

- `ENDPOINT` : identifiant Formspree du formulaire d'inscription. Tant que `VOTRE_ID` reste en place, le formulaire affiche un message d'aperçu et n'envoie rien.
- `DEMO_URL` : lien de prise de rendez-vous (Calendly, Cal.com, Google Agenda…). Vide, les boutons « Réserver une démo » mènent au bandeau Démo, qui invite à écrire à l'adresse de contact.
- `PRICE_PER_ARRIVAL` : prix par recrue accueillie, en euros HT. `null` : l'estimation affiche « N × prix par recrue ». Remplacer aussi « XX € » dans la formule Équipe de `tarifs.html`.
- `FREE_ARRIVALS` : nombre d'arrivées offertes (2).

## Tarifs : choix à valider

Le modèle retenu : à l'usage, par recrue accueillie, les deux premières offertes, plus une démo. Le reste a été décidé pour le prototype et reste à confirmer :

- prix affichés hors taxes, TVA en sus (usage B2B) ;
- facturation mensuelle selon les arrivées du mois, « un mois sans arrivée ne coûte rien » (pas d'abonnement fixe) ;
- une arrivée compte une fois, quelle que soit la durée de son parcours ; stagiaires, alternants, CDD et CDI comptent pareil ;
- formule Entreprise sur devis : prix adapté au volume, facturation annuelle possible, déploiement préparé avec le client ;
- au-delà de 60 arrivées par an, l'estimation oriente vers la formule Entreprise.

## Mesure

Mêmes points d'intégration que la landing : chaque événement est poussé dans `window.dataLayer` s'il existe, diffusé en `CustomEvent('landing:track')` et gardé dans `window.__landingEvents`. Chaque événement porte `site: 'trame'` et `page` (`accueil`, `tarifs`). Ajouter `?debug-track` à l'URL pour les voir dans la console.

| Événement | Quand | Paramètres |
|---|---|---|
| `page_view` | chargement d'une page | — |
| `signup_cta_click` | clic sur « Commencer gratuitement » | `placement` : `nav`, `hero`, `integrations`, `footer`, `tarifs-haut`, `tarifs-bas` |
| `plan_cta_click` | clic sur le bouton d'une formule | `plan` : `decouverte`, `equipe`, `entreprise` |
| `demo_click` | clic sur « Réserver une démo » | `placement`, `configured` (lien renseigné ou non) |
| `estimator_use` | première utilisation de l'estimation | — |
| `estimator_value` | valeur choisie, au relâchement | `arrivals` |
| `signup_form_start` | première saisie dans le formulaire | — |
| `signup_form_error` | erreur | `error_type` : `invalid_email`, `missing_consent`, `endpoint_not_configured`, `server` (+ `http_status`), `network` |
| `signup_form_success` | envoi accepté | — |

## Encore à compléter

- Mentions légales : identité de l'éditeur (retirée pour l'instant, obligatoire avant une diffusion publique), adresse, directeur de la publication, hébergeur (GitHub, Inc. pour GitHub Pages).
- Confidentialité : identité du responsable du traitement (retirée pour l'instant, exigée par le RGPD).
- Confidentialité : date, prestataires et transferts hors UE.
- Adresse de contact : `contact@votre-domaine.fr` partout.
- Promesses à confirmer côté produit : « Vos compétences et vos données restent chez vous », les intégrations du visuel, les chiffres de l'accueil (sources à préciser).

## Publication

Dépôt public `balthaduchaffaut-dotcom/trame-site`, publié par GitHub Pages depuis `main` (racine). Chaque poussée sur `main` met le site à jour en une à deux minutes.
