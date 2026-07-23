MIGRATIONS — versioned, ordered schema changes.
001_create_users.sql, 002_add_status_to_orders.sql
Each file is applied once, in order, and never edited after it ships.
Need a change? Write a new migration. This is what lets a teammate
rebuild the exact same database from an empty one.
