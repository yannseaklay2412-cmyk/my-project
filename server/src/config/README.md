CONFIG — setup that runs once at boot.
env.js: read process.env, validate required vars, fail loud if missing.
db.js: create the connection/pool and export it.
Third-party clients (mail, storage, payments) get initialized here too.
