# Trame · site

Site de Trame : accueil, tarifs et à propos. HTML, CSS et JavaScript statiques, sans dépendance ni service tiers chargé.

Ce site est distinct de la landing du test A/B (`Landing/trame-landing`, variante B, et `Landing/lerenard`, variante A), qui restent inchangées. L'accueil reprend la landing Trame, avec le modèle gratuit à la place de la bêta.

En ligne : https://balthaduchaffaut-dotcom.github.io/trame-site/ (page `noindex`). Aperçu local :

```bash
python3 -m http.server 8767 --directory .
```

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil (repris de la landing Trame), formulaire d'inscription, mentions légales et confidentialité. |
| `tarifs.html` | Trois formules, estimation selon le nombre d'arrivées, questions fréquentes, bandeau démo. |
| `a-propos.html` | Pourquoi Trame, l'approche, les principes, l'équipe. |
| `site.css`, `site.js` | Styles et comportements communs (menu des petits écrans, mesure, formulaire, estimation, démo, survol du hero). |

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

## À propos

L'ancienne page « À propos » du Renard n'a pas été retrouvée (ni dans `Archives/le-renard-github.zip`, ni dans l'historique de `lerenard`). La page s'appuie sur ce qui est documenté : `PRODUCT.md` du MVP (principes), le document de vision (approche) et les mentions légales (porteurs du projet). Aucun chiffre, témoignage ou parcours personnel n'a été ajouté : à compléter quand le texte d'origine sera retrouvé.

## Mesure

Mêmes points d'intégration que la landing : chaque événement est poussé dans `window.dataLayer` s'il existe, diffusé en `CustomEvent('landing:track')` et gardé dans `window.__landingEvents`. Chaque événement porte `site: 'trame'` et `page` (`accueil`, `tarifs`, `a-propos`). Ajouter `?debug-track` à l'URL pour les voir dans la console.

| Événement | Quand | Paramètres |
|---|---|---|
| `page_view` | chargement d'une page | — |
| `signup_cta_click` | clic sur « Commencer gratuitement » | `placement` : `nav`, `hero`, `integrations`, `footer`, `tarifs-haut`, `tarifs-bas`, `a-propos` |
| `plan_cta_click` | clic sur le bouton d'une formule | `plan` : `decouverte`, `equipe`, `entreprise` |
| `demo_click` | clic sur « Réserver une démo » | `placement`, `configured` (lien renseigné ou non) |
| `estimator_use` | première utilisation de l'estimation | — |
| `estimator_value` | valeur choisie, au relâchement | `arrivals` |
| `signup_form_start` | première saisie dans le formulaire | — |
| `signup_form_error` | erreur | `error_type` : `invalid_email`, `missing_consent`, `endpoint_not_configured`, `server` (+ `http_status`), `network` |
| `signup_form_success` | envoi accepté | — |

## Encore à compléter

- Mentions légales : adresse, directeur de la publication, hébergeur (GitHub, Inc. pour GitHub Pages).
- Confidentialité : date, prestataires et transferts hors UE.
- Adresse de contact : `contact@votre-domaine.fr` partout.
- Promesses à confirmer côté produit : « Vos compétences et vos données restent chez vous », les intégrations du visuel, les chiffres de l'accueil (sources à préciser).

## Publication

Dépôt public `balthaduchaffaut-dotcom/trame-site`, publié par GitHub Pages depuis `main` (racine). Chaque poussée sur `main` met le site à jour en une à deux minutes.
