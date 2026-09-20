<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# Issue tracker: GitHub

Issues et specs de ce dépôt vivent comme issues GitHub. Utiliser le CLI `gh`
pour toutes les opérations.

## Conventions

- **Créer une issue** : `gh issue create --title "..." --body "..."`. Utiliser
  un heredoc pour un corps multi-lignes.
- **Lire une issue** : `gh issue view <number> --comments`, en filtrant les
  commentaires avec `jq` et en récupérant aussi les labels.
- **Lister les issues** : `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`
  avec les filtres `--label` et `--state` appropriés.
- **Commenter une issue** : `gh issue comment <number> --body "..."`
- **Appliquer / retirer des labels** : `gh issue edit <number> --add-label "..."`
  / `--remove-label "..."`
- **Fermer** : `gh issue close <number> --comment "..."`

Le dépôt est déduit de `git remote -v` ; `gh` le fait automatiquement dans un
clone.

## Les PR comme surface de triage

**PRs comme surface de requête : non.** _(Passer à `yes` si ce dépôt traite
les PR externes comme des demandes de fonctionnalité ; `/triage` lit ce
drapeau.)_

Si activé à `yes`, les PR suivent les mêmes labels et états que les issues,
via les équivalents `gh pr` :

- **Lire une PR** : `gh pr view <number> --comments` et `gh pr diff <number>`
  pour le diff.
- **Lister les PR externes pour triage** : `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`
  puis ne garder que celles dont `authorAssociation` vaut `CONTRIBUTOR`,
  `FIRST_TIME_CONTRIBUTOR` ou `NONE` (écarter `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Commenter / labelliser / fermer** : `gh pr comment`,
  `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub partage un seul espace de numérotation entre issues et PR : un `#42`
isolé peut être l'un ou l'autre — résoudre avec `gh pr view 42` puis, à
défaut, `gh issue view 42`.

## Quand une skill dit « publier sur le tracker d'issues »

Créer une issue GitHub.

## Quand une skill dit « récupérer le ticket concerné »

Exécuter `gh issue view <number> --comments`.

## Opérations de wayfinding

Utilisées par `/wayfinder`. La **carte** (map) est une issue unique avec des
issues **enfants** comme tickets.

- **Carte** : une issue labellisée `wayfinder:map`, portant le corps
  Notes / Décisions-jusqu'ici / Zones d'ombre.
  `gh issue create --label wayfinder:map`.
- **Ticket enfant** : une issue liée à la carte comme sub-issue GitHub
  (`gh api` sur l'endpoint sub-issues). Si les sub-issues ne sont pas activées,
  ajouter l'enfant à une liste de tâches dans le corps de la carte et mettre
  `Part of #<map>` en tête du corps de l'enfant. Labels : `wayfinder:<type>`
  (`research`/`prototype`/`grilling`/`task`). Une fois revendiqué, le ticket
  est assigné au développeur qui le pilote.
- **Blocage** : les **dépendances natives d'issues** de GitHub, la
  représentation canonique visible dans l'UI. Ajouter une arête avec
  `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`,
  où `<blocker-db-id>` est l'**id de base de données** numérique du bloqueur
  (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, pas le `#numéro` ni le
  `node_id`). GitHub rapporte
  `issue_dependencies_summary.blocked_by` (bloqueurs ouverts seulement, la
  jauge en direct). Si les dépendances ne sont pas disponibles, se rabattre
  sur une ligne `Blocked by: #<n>, #<n>` en tête du corps de l'enfant. Un
  ticket est débloqué quand tous ses bloqueurs sont fermés.
- **Requête de frontière** : lister les enfants ouverts de la carte
  (`gh issue list --state open`, restreint aux sub-issues / à la liste de
  tâches de la carte), écarter ceux avec un bloqueur ouvert
  (`issue_dependencies_summary.blocked_by > 0`, ou une issue ouverte dans la
  ligne `Blocked by`) ou un assigné ; le premier dans l'ordre de la carte
  l'emporte.
- **Revendiquer** : `gh issue edit <n> --add-assignee @me`, la première
  écriture de la session.
- **Résoudre** : `gh issue comment <n> --body "<réponse>"`, puis
  `gh issue close <n>`, puis ajouter un pointeur de contexte (gist + lien) aux
  Décisions-jusqu'ici de la carte.
