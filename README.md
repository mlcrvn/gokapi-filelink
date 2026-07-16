<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# FileLink for Gokapi

Extension Thunderbird Manifest V3 qui utilise une instance Gokapi configurable comme fournisseur FileLink.

Projet communautaire indépendant, sans affiliation ni approbation de Gokapi ou de Thunderbird. Le projet Gokapi officiel est disponible sur <https://github.com/Forceu/Gokapi>.

- Code source : <https://github.com/mlcrvn/gokapi-filelink>
- Questions et anomalies : <https://github.com/mlcrvn/gokapi-filelink/issues>

## Prérequis

- Thunderbird 128 ou version ultérieure ;
- une instance Gokapi accessible en HTTPS ;
- une clé API Gokapi avec la permission `UPLOAD` ;
- les permissions `VIEW` et `DELETE` sont recommandées pour le renommage et la suppression automatique.

> L’endpoint REST standard de Gokapi ne prend pas en charge le chiffrement de bout en bout. Pour éviter de stocker silencieusement des fichiers en clair, l’extension refuse de configurer une instance dont le chiffrement E2E est activé.

## Installation du paquet XPI

1. Ouvrir le gestionnaire de modules complémentaires de Thunderbird.
2. Dans le menu avec l’icône d’engrenage, choisir **Installer un module depuis un fichier**.
3. Sélectionner le fichier `FileLinkForGokapi-<version>.xpi` téléchargé.
4. Dans les paramètres de Thunderbird, ouvrir **Rédaction > Pièces jointes**, puis ajouter le fournisseur Gokapi.

Le paquet construit localement n’est ni publié ni audité par addons.thunderbird.net. Pour le développement, la page **Déboguer les modules complémentaires** permet aussi de charger temporairement le fichier `manifest.json` depuis les sources.

## Configuration

La page FileLink demande :

- l’URL de base de l’instance, sans `/api` ;
- la clé API ;
- le nombre de jours avant expiration (`0` = illimité) ;
- le nombre de téléchargements (`0` = illimité) ;
- un éventuel mot de passe commun aux uploads.

L’URL, la clé et les autres réglages sont enregistrés dans `browser.storage.local`, séparément pour chaque compte FileLink. Consultez [PRIVACY.md](PRIVACY.md) pour le détail des données traitées.

## Fonctionnalités

- test de connexion et détection de la version Gokapi ;
- récupération de la taille maximale autorisée ;
- upload vers `/api/files/add` ;
- affichage dans Thunderbird de l’expiration, de la limite de téléchargements et de la protection par mot de passe ;
- absence de lien promotionnel ajouté au courriel par Thunderbird ;
- lien vers le projet Gokapi officiel dans la page de paramètres de l’extension ;
- annulation d’un upload en cours ;
- suppression distante via `/api/files/delete` ;
- renommage non destructif via `/api/files/duplicate`, afin de préserver les liens déjà envoyés.

L’upload standard de Gokapi n’est pas découpé en fragments. La limite annoncée par Gokapi est appliquée dans Thunderbird, mais un reverse proxy peut imposer une limite plus basse pour les très gros fichiers.

## Publication

- [ATN_LISTING.md](ATN_LISTING.md) : textes français et anglais pour addons.thunderbird.net ;
- [PRIVACY.md](PRIVACY.md) : politique de confidentialité ;
- [NOTICE.md](NOTICE.md) : attribution et indépendance du projet.

## Licence

FileLink for Gokapi est distribué sous la **Mozilla Public License 2.0** (`MPL-2.0`). Le texte complet figure dans [LICENSE](LICENSE).

## Tests et construction

```powershell
npm test
npm run check
./build.ps1
```

Le script produit un XPI installable et une archive séparée contenant les sources, les tests et les instructions de construction.
