I have instrumented the database with a **Deep Comparison Debugger**.

### What to do
Click **"Run Tests"** again.

If the "Data retrieval failed" error occurs, the Console will now print a **Table**.
Look at the **`match`** column and the **`target`** vs **`routeId`** columns.

*   **Scenario A**: The table is empty.
    *   Diagnosis: The data was never saved to the DB (Sanity Check failed).
*   **Scenario B**: The table has rows, but `match` is `false`.
    *   Diagnosis: The ID you are saving (`routeId`) is strictly different from the one you are requesting (`target`). Look for subtle differences like spaces (`" 123"` vs `"123"`) or types (`123` vs `"123"`).

This log will reveal the exact character-level difference causing the failure.
