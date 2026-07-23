SERVICES — every call to the backend.
client.js: the http instance, base URL, auth header interceptor.
users.js, orders.js: one file per resource, one function per endpoint.
Components must never call fetch/axios directly. Change the API URL
once here instead of in forty components.
