ROUTES — URL + HTTP verb + which middleware runs.
router.post("/", protect, validate, controller.create)
Zero logic. If there is an if-statement here, it is in the wrong place.
