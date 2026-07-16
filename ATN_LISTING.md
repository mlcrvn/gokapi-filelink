<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# Fiche addons.thunderbird.net

## Métadonnées

- **Nom :** FileLink for Gokapi
- **Auteur :** Mathieu Lécrivain
- **Identifiant technique :** `gokapi-filelink@mlcrvn.net`
- **Version initiale :** 1.0.0
- **Compatibilité minimale :** Thunderbird 128
- **Catégorie suggérée :** Outils / Pièces jointes
- **Licence :** Mozilla Public License 2.0 (`MPL-2.0`)
- **Code source et site du projet :** <https://github.com/mlcrvn/gokapi-filelink>
- **Assistance et anomalies :** <https://github.com/mlcrvn/gokapi-filelink/issues>

## Résumé court — français

Utilisez votre instance Gokapi comme fournisseur FileLink pour les pièces jointes de Thunderbird.

## Description complète — français

FileLink for Gokapi relie Thunderbird à votre propre instance Gokapi. Lorsque vous joignez un fichier volumineux, Thunderbird peut l’envoyer vers Gokapi et insérer automatiquement son lien de téléchargement dans le message.

L’adresse du serveur et la clé API sont configurables pour chaque compte FileLink : aucune instance n’est imposée par l’extension. Vous pouvez également choisir la durée de conservation, limiter le nombre de téléchargements et protéger les fichiers avec un mot de passe.

Fonctionnalités principales :

- instance Gokapi entièrement configurable ;
- test de connexion et prise en compte de la limite de taille du serveur ;
- expiration, limite de téléchargements et mot de passe facultatif ;
- annulation, suppression distante et renommage des fichiers ;
- refus de l’upload si le chiffrement E2E de Gokapi est actif, afin d’éviter un stockage non chiffré inattendu ;
- aucun lien promotionnel ajouté au courriel ; le projet Gokapi officiel est référencé uniquement dans les paramètres de l’extension.

Ce module est un projet communautaire indépendant. Il n’est ni affilié à Gokapi ou Thunderbird, ni approuvé par ces projets.

## Short summary — English

Use your own Gokapi instance as a Thunderbird FileLink provider for email attachments.

## Full description — English

FileLink for Gokapi connects Thunderbird to your own Gokapi instance. When you attach a large file, Thunderbird can upload it to Gokapi and automatically insert its public download link into the message.

The server address and API key are configurable for each FileLink account; the extension does not impose any hosted service. You can also choose the retention period, limit the number of downloads, and protect uploaded files with a password.

Main features:

- fully configurable Gokapi instance;
- connection test and server upload-size limit detection;
- expiration, download limit, and optional password;
- upload cancellation, remote deletion, and file renaming;
- uploads are refused when Gokapi end-to-end encryption is enabled, preventing unexpected plaintext storage;
- no promotional link is added to the email; the official Gokapi project is referenced only in the extension settings.

This add-on is an independent community project. It is not affiliated with or endorsed by Gokapi or Thunderbird.

## Justification des permissions

### `storage`

Cette permission conserve localement, dans le profil Thunderbird, la configuration de chaque compte FileLink et la correspondance nécessaire entre les fichiers Thunderbird et Gokapi. Elle inclut l’URL du serveur, la clé API, les options d’upload et les identifiants des fichiers déjà envoyés.

### Accès à `https://*/*`

L’utilisateur peut indiquer n’importe quelle instance Gokapi auto-hébergée. L’adresse ne peut donc pas être connue au moment de la publication. L’extension limite néanmoins les connexions aux adresses HTTPS et ne contacte que l’instance configurée par l’utilisateur, à l’exception du lien d’information statique vers le dépôt officiel de Gokapi.

## Notes pour l’équipe de validation

1. Disposer d’une instance Gokapi accessible en HTTPS avec le chiffrement E2E désactivé.
2. Créer une clé API avec la permission `UPLOAD`. `VIEW` et `DELETE` permettent de tester respectivement le renommage et la suppression distante.
3. Dans Thunderbird, créer un compte FileLink Gokapi puis ouvrir sa configuration.
4. Saisir l’URL de base sans `/api`, la clé API et les options souhaitées.
5. Cliquer sur **Enregistrer et tester** ; la version de Gokapi doit être confirmée.
6. Joindre un fichier à un message et utiliser FileLink. Le lien public doit être inséré dans le courriel.
7. Vérifier que le bloc FileLink du courriel ne contient pas de ligne « En savoir plus » et que le lien Gokapi présent dans les paramètres ouvre <https://github.com/Forceu/Gokapi>.

La politique de confidentialité complète figure dans `PRIVACY.md`. Si un accès de test temporaire est nécessaire pour la validation ATN, le fournir uniquement dans le champ privé destiné aux évaluateurs.
