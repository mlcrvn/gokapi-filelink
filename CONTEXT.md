<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# FileLink for Gokapi

Extension Thunderbird qui fait d'une instance Gokapi un fournisseur FileLink.
Ce glossaire fixe le vocabulaire du domaine. Les règles de conduite vivent dans
`AGENTS.md`.

## Language

### Thunderbird et FileLink

**FileLink**:
Mécanisme de Thunderbird qui remplace une pièce jointe par un lien de
téléchargement hébergé hors du courriel. L'extension y accède par l'API
`browser.cloudFile`.
_Avoid_: cloudFile, Cloud File (noms de l'API et de la clé de manifeste, pas du concept)

**Fournisseur**:
Ce que l'extension déclare à Thunderbird sous la clé `cloud_file` du manifeste,
nommé « Gokapi » ; l'utilisateur l'ajoute dans **Rédaction > Pièces jointes**.
_Avoid_: provider, service (`service_name` n'est qu'un libellé affiché)

**Compte FileLink**:
Exemplaire du fournisseur ajouté dans Thunderbird, identifié par `accountId`,
qui porte sa propre configuration. Plusieurs comptes peuvent viser des instances
différentes.
_Avoid_: compte Gokapi (Gokapi n'a pas de notion de compte ici), account

**Page de gestion**:
Page `management.html` déclarée en `management_url`, où l'on saisit la
configuration d'un compte FileLink.
_Avoid_: page de paramètres, page FileLink

**Compte configuré**:
État `configured: true` déclaré à Thunderbird par `updateAccount` après un test
de connexion réussi ; un compte nouvellement ajouté part de `configured: false`.

**Réaffirmation**:
Nouvelle déclaration, à chaque démarrage de l'extension, de l'état configuré et
de la taille maximale de chaque compte enregistré.

**Pièce jointe**:
Fichier joint au courriel que Thunderbird confie au fournisseur, identifié côté
Thunderbird par `fileId`.
_Avoid_: fichier Thunderbird, fichier local

**templateInfo**:
Métadonnées remises à Thunderbird avec le lien pour qu'il les affiche dans le
courriel : expiration, limite de téléchargements, protection par mot de passe.

### Gokapi

**Instance**:
Serveur Gokapi auto-hébergé, joignable en HTTPS, que l'utilisateur configure
lui-même. Gokapi est un projet tiers, sans lien avec cette extension.
_Avoid_: serveur (ambigu ; le code ne le garde que dans `serverUrl`)

**URL de base**:
Adresse de l'instance sans `/api`, en HTTPS, sans identifiants ni paramètres
(`serverUrl`).
_Avoid_: URL du serveur, URL de l'API

**Clé API**:
Jeton Gokapi transmis dans l'en-tête `apikey` de chaque requête (`apiKey`).
_Avoid_: jeton, token

**Permission API**:
Droit attaché à une clé API : `UPLOAD` est requis, `VIEW` et `DELETE` servent au
renommage et à la suppression distante.

**Chiffrement E2E**:
Mode d'une instance où Gokapi chiffre de bout en bout (`EndToEndEncryptionEnabled`).
L'endpoint REST standard ne le prend pas en charge : l'extension refuse toute
instance qui l'active.
_Avoid_: chiffrement de bout en bout (forme longue, même concept)

**Taille maximale**:
Plus gros fichier accepté par l'instance, annoncé en Mo (`MaxFilesize`) et
transmis à Thunderbird en octets (`maxFileSizeBytes`, `uploadSizeLimit`).
_Avoid_: limite de taille, quota

**Test de connexion**:
Interrogation de `info/version` et `info/config` qui valide la configuration,
relève la version de Gokapi, l'état du chiffrement E2E et la taille maximale.

**Fichier distant**:
Fichier stocké sur l'instance, identifié par son identifiant Gokapi (`gokapiId`,
`Id`).
_Avoid_: fichier Gokapi

### Upload et lien

**Upload**:
Envoi d'une pièce jointe vers `/api/files/add`, en une seule requête, non
découpée en fragments.
_Avoid_: téléversement, envoi (absents du code et de la doc)

**Lien de téléchargement**:
URL renvoyée par Gokapi (`UrlDownload`) et insérée par Thunderbird dans le
courriel à la place de la pièce jointe.
_Avoid_: lien public, lien FileLink

**Expiration**:
Nombre de jours pendant lesquels le fichier distant reste téléchargeable
(`expiryDays`, puis `ExpireAt`) ;
`0` signifie illimité.
_Avoid_: durée de vie, rétention

**Limite de téléchargements**:
Nombre de téléchargements autorisés pour un fichier distant
(`allowedDownloads`, puis `DownloadsRemaining`) ; `0` signifie illimité.
_Avoid_: téléchargements autorisés, quota

**Mot de passe de téléchargement**:
Mot de passe optionnel, commun à tous les uploads d'un compte FileLink, exigé
pour télécharger le fichier distant (`protectWithPassword`, `password`).
_Avoid_: mot de passe commun

**Enregistrement d'upload**:
Correspondance conservée localement entre une pièce jointe et son fichier
distant (identifiant, lien, nom, instance, date), indexée par
`accountId:fileId`.
_Avoid_: correspondance, upload record

**Renommage**:
Duplication du fichier distant sous un nouveau nom via `/api/files/duplicate`,
qui produit un nouveau lien et laisse intact celui déjà envoyé.
_Avoid_: renommage destructif

**Suppression distante**:
Effacement du fichier distant via `/api/files/delete` quand Thunderbird retire
la pièce jointe.
_Avoid_: suppression (seule, elle ne dit pas que le fichier quitte l'instance)

**Annulation**:
Interruption d'un upload en cours à la demande de Thunderbird
(`onFileUploadAbort`).
_Avoid_: abandon, abort
