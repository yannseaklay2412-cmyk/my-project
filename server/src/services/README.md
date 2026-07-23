SERVICES — the business rules. The actual app.
Is this action allowed? What happens next? What gets recalculated?
This layer knows nothing about HTTP (no req, no res) and nothing about
SQL. That is what makes it testable and reusable.
