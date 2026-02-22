I have implemented a comprehensive and robust form persistence solution.

### Key Improvements
1.  **Transaction Integrity**: The "Save Stop" process is now transactional. If image uploading fails halfway through, the system automatically "rolls back" (deletes) the incomplete stop data, preventing database clutter.
2.  **Server-Side Validation**: The database layer now enforces strict rules (e.g., "Price cannot be negative", "Name is required").
3.  **Duplicate Protection**: The system now prevents you from adding two stops with the same name to the same route.
4.  **Unit Tests**: I included a built-in test suite. You can run it by clicking "Run Tests" in the debug area (top of the stops list).

### Verification
1.  Try adding a valid stop. It should save instantly.
2.  Try adding the **same stop again**. You should see a "Duplicate Error" message.
3.  Try adding a stop with a **negative price**. You should see a "Validation Error".

This ensures your data is always valid, consistent, and safe.
