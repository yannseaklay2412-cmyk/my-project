DATABASE — the code that defines your data, not the data itself.
The database is a separate running service, not a folder in your repo.

NOTE: many projects fold this into server/db/ instead, since only the
backend touches it. Keep it top-level when a DBA owns the schema, when
several services share the database, or when migrations run from CI.
