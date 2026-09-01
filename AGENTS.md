<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# Instructions pour les agents

`README.md` couvre les prérequis, l'installation, la configuration, les
fonctionnalités, la publication et les tests. Le lire avant d'intervenir ; ne
rien recopier ici.

Ce fichier ne porte que ce qu'un agent doit s'interdire.

## Ce dépôt est public

C'est le seul dépôt public de Mathieu. Tout ce qui y est commité est
définitivement lisible par n'importe qui, y compris après suppression.

Ne jamais y écrire, dans le code comme dans un test, un exemple, un message de
commit ou une capture :

- l'URL de son instance Gokapi, ni aucun nom d'hôte, sous-domaine, adresse IP
  ou nom de VM de son infrastructure auto-hébergée — la liste vit dans
  `infrastructure-personnelle`, elle n'a pas à être recopiée ici ;
- une clé API Gokapi, même expirée, même tronquée ;
- une adresse de courriel personnelle autre que celle déjà publiée dans les
  métadonnées du dépôt.

Les exemples utilisent des valeurs manifestement fictives (`https://exemple.tld`,
`CLE_API_FICTIVE`). Si une valeur réelle est nécessaire pour tester, elle reste
locale et hors dépôt.

## L'extension est publiée

Elle est en ligne sur addons.thunderbird.net avec l'identifiant
`gokapi-filelink@mlcrvn.net`. Publier est une action de sortie de version, pas
une tâche d'agent :

- **ne pas incrémenter de version** de sa propre initiative. `manifest.json` et
  `package.json` doivent rester d'accord ; les désynchroniser casse la
  construction silencieusement ;
- **ne rien soumettre** à addons.thunderbird.net, ne pas signer de XPI, ne pas
  toucher `ATN_LISTING.md` sans demande explicite ;
- les artefacts de construction (`*.xpi`, `*.zip`, `*-SHA256.txt`) sont ignorés
  par git. `dist/` existe en local et n'est pas versionné — ne pas l'y ajouter.

## Le projet est dormant, et c'est un état, pas un retard

Dernier commit en juillet 2026, version 1.0.1 en production. Il n'y a **aucune
dépendance npm** : ni runtime, ni développement. C'est délibéré — une extension
Thunderbird MV3 de cette taille n'en a pas besoin, et une extension publiée qui
n'a pas de chaîne de dépendances n'a pas de maintenance de sécurité à subir.

Ne pas proposer d'ajouter un bundler, un linter, un framework de test, ni de
« moderniser » quoi que ce soit. `npm test` (`node tests/run.js`) et
`npm run check` (`node --check`) suffisent et doivent rester exécutables sans
`npm install`.

## Deux comportements à ne pas « corriger »

1. **Le refus des instances à chiffrement E2E actif.** L'endpoint REST standard
   de Gokapi ne prend pas en charge le bout-en-bout ; l'extension refuse donc de
   configurer une telle instance, pour ne pas stocker des fichiers en clair à
   l'insu de l'utilisateur. Ce n'est pas une limitation à lever, c'est la
   décision de sécurité du projet.
2. **La mention d'indépendance.** Le README énonce que le projet est
   communautaire, sans affiliation ni approbation de Gokapi ni de Thunderbird,
   et renvoie au projet officiel. Cette mention est une obligation de bonne foi
   envers deux projets tiers : ne pas l'alléger, ne pas la déplacer en bas de
   page.

## Licence

MPL-2.0. Tout fichier créé porte son en-tête SPDX, dans le commentaire de son
langage :

```
SPDX-FileCopyrightText: 2026 Mathieu Lécrivain
SPDX-License-Identifier: MPL-2.0
```

`manifest.json` en est dépourvu — JSON n'admet pas de commentaire. C'est normal,
ne pas tenter de l'y ajouter.
