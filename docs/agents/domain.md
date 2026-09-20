<!-- SPDX-FileCopyrightText: 2026 Mathieu Lécrivain -->
<!-- SPDX-License-Identifier: MPL-2.0 -->

# Documentation de domaine

Comment les skills d'ingénierie doivent consommer la documentation de domaine
de ce dépôt en explorant le code.

## Avant d'explorer, lire ceci

- **`CONTEXT.md`** à la racine du dépôt, ou
- **`CONTEXT-MAP.md`** à la racine s'il existe : il pointe vers un
  `CONTEXT.md` par contexte. Lire chacun de ceux pertinents pour le sujet.
- **`docs/adr/`** : lire les ADR qui touchent la zone sur laquelle on va
  travailler. Dans un dépôt multi-contexte, vérifier aussi
  `src/<contexte>/docs/adr/` pour les décisions propres au contexte.

Si l'un de ces fichiers n'existe pas, **continuer silencieusement**. Ne pas
signaler leur absence, ne pas proposer de les créer par avance. La skill
`/domain-modeling` (atteinte via `/grill-with-docs` et
`/improve-codebase-architecture`) les crée paresseusement quand des termes ou
des décisions se résolvent réellement.

## Structure de fichiers

Dépôt à contexte unique (le cas de ce dépôt) :

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-....md
│   └── 0002-....md
└── ...
```

## Utiliser le vocabulaire du glossaire

Quand une sortie nomme un concept de domaine (titre d'issue, proposition de
refactor, hypothèse, nom de test), utiliser le terme tel que défini dans
`CONTEXT.md`. Ne pas dériver vers des synonymes que le glossaire évite
explicitement.

Si le concept nécessaire n'est pas encore dans le glossaire, c'est un signal :
soit on invente un vocabulaire que le projet n'utilise pas (reconsidérer),
soit il y a un vrai manque (le noter pour `/domain-modeling`).

## Signaler les conflits avec les ADR

Si une sortie contredit un ADR existant, le signaler explicitement plutôt que
de l'écraser silencieusement :

> _Contredit l'ADR-0007 (…), mais vaut la peine d'être rouvert parce que…_
