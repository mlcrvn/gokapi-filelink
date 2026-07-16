<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# Politique de confidentialité

Dernière mise à jour : 16 juillet 2026

FileLink for Gokapi est une extension Thunderbird communautaire et indépendante développée par Mathieu Lécrivain. Elle permet à l’utilisateur d’envoyer des pièces jointes vers l’instance Gokapi qu’il configure lui-même.

## Données conservées localement

L’extension enregistre dans le profil local de Thunderbird :

- l’URL de l’instance Gokapi ;
- la clé API ;
- la durée d’expiration et la limite de téléchargements ;
- l’activation éventuelle d’un mot de passe et ce mot de passe ;
- la version du serveur et sa limite de taille annoncée ;
- les correspondances entre les identifiants de fichiers Thunderbird et Gokapi, notamment l’identifiant distant, le lien public, le nom du fichier, le serveur et la date de création.

Ces informations utilisent `browser.storage.local`. Elles ne sont pas chiffrées séparément par l’extension et restent protégées selon les mécanismes du profil Thunderbird et du système de l’utilisateur.

## Données transmises

L’extension transmet uniquement à l’instance Gokapi HTTPS configurée par l’utilisateur :

- la clé API dans les requêtes d’API ;
- les demandes d’informations sur la version et la configuration du serveur ;
- le nom et le contenu des fichiers que l’utilisateur choisit d’envoyer ;
- les règles d’expiration, de téléchargement et le mot de passe éventuel ;
- les identifiants et noms nécessaires aux opérations de renommage et de suppression.

Gokapi renvoie un lien public que Thunderbird insère dans le courriel. La conservation et l’accès aux fichiers distants dépendent de l’instance Gokapi et de son administrateur.

## Absence de collecte par l’auteur

L’extension n’utilise ni télémétrie, ni outil d’analyse, ni publicité, ni code distant. L’auteur ne reçoit pas les fichiers, clés API, mots de passe, adresses de serveur ou statistiques d’utilisation. Aucune donnée n’est envoyée à GitHub du seul fait de l’utilisation de l’extension ; le dépôt officiel de Gokapi est uniquement la destination du lien d’information affiché par Thunderbird.

## Sécurité et chiffrement

Seules les instances HTTPS sont acceptées. L’extension refuse les uploads lorsque le chiffrement de bout en bout de Gokapi est actif, car l’API d’upload standard ne permettrait pas de préserver ce mode de chiffrement.

## Conservation et suppression

La suppression d’un compte FileLink efface sa configuration et ses correspondances locales. Lorsque l’autorisation Gokapi le permet, une demande de suppression de fichier dans Thunderbird est également transmise au serveur. L’expiration et la suppression effectives des fichiers distants restent régies par la configuration de Gokapi.

L’utilisateur peut cesser tout traitement en supprimant le compte FileLink ou en désinstallant l’extension. Les questions relatives à la confidentialité peuvent être déposées sur <https://github.com/mlcrvn/gokapi-filelink/issues>.
