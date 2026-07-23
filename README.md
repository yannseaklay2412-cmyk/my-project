# Full-Stack Project Template

Generic starting structure. Framework-agnostic — the folder names and the
layering hold whether you use Express, Django, Laravel, or Rails.

```
project/
├── client/      browser code        (own package.json, own deploy)
├── server/      API code            (own package.json, own deploy)
├── database/    migrations + seeds  (see database/README.md)
├── shared/      code both sides use
└── docs/
```

Every folder has a README.md explaining what belongs in it and — more
useful — what does NOT. Read those as you go; delete them once the
structure is second nature.

## The one rule that matters

Each layer talks only to the layer directly below it:

    routes → controllers → services → models → database

Two tests to check you got it right:

- Swap your database for a different one → only `models/` should change.
- Replace HTTP with a CLI → only `routes/` and `controllers/` change.

When either test fails, logic has leaked upward or downward. The usual
symptom is a SQL query sitting inside a controller.

## When to reorganize

This is grouped by **type** (all controllers together, all components
together). That is the easier structure to learn and the right choice
while the project is small.

Once a folder passes roughly 15 files, switch that part to grouping by
**feature** instead:

    server/src/features/auth/     routes, controller, service, model
    client/src/features/auth/     components, hooks, api

Most mature codebases end up mixed: shared things by type, domain things
by feature. Do not do this on day one — it is a fix for a problem you do
not have yet.

## Setup

1. `cp .env.example .env` and fill in the values
2. `cd server && npm install`
3. `cd client && npm install`
4. Run the migrations in `database/migrations/` in order
