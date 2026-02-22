The "Route not found" error is caused by a mismatch in the `localStorage` keys used by different parts of the application.

* The **Admin Dashboard** (via `AdminContext`) reads data from the key `adminData`.

* The **Mock Database** (`mockDb.js`) is currently hardcoded to use `adminData_DEBUG_FIXED`.

When you try to edit a route, the Dashboard loads it from `adminData`. However, when you save, the system tries to find that route in `adminData_DEBUG_FIXED`. Since the route doesn't exist in that separate database file, the update fails.

**Plan:**

1. Edit `src/services/mockDb.js` to restore the correct storage key configuration.

   * Remove the hardcoded `adminData_DEBUG_FIXED`.

   * Uncomment the standard logic that uses `adminData`.
2. This will align the database read/write operations to the same source (`adminData`), resolving the "Route not found" error.

