CONTROLLERS — the HTTP translation layer.
Read req.body / req.params, call ONE service, send the response with
a status code. No SQL, no business rules.
If a controller is over ~15 lines, logic leaked in from the service.
