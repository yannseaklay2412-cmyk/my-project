MIDDLEWARE — cross-cutting concerns.
auth: verify token, attach user. rbac: check role.
validate: reject bad input before it reaches the controller.
error: catch everything and shape one consistent error response.
Error middleware is registered LAST, after all routes.
