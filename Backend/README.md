SERVER — the API. Own package.json, own deploy target.
Entry file only starts the listener; the app itself is built in src/
so tests can import it without opening a port.
