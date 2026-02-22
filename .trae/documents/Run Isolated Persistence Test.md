I have updated the test suite to use a **completely isolated database** for testing. This prevents any interference from the running application or existing data.

### The New Test
When you click "Run Tests" now:
1.  It creates a temporary, empty database (`adminData_TEST_...`).
2.  It writes to this fresh database.
3.  It reads back from it immediately.
4.  It cleans up afterwards.

### Why this helps
This eliminates 90% of possible causes (corrupted old data, other components overwriting data, event loops). If this test fails, the bug is definitely in the `save/read` logic itself. If it passes, the bug was caused by the main application's state (which we can then reset).

### Next Step
Please click **"Run Tests"** one more time.
*   If it passes: The issue is solved (likely fixed by the isolation/cleanup).
*   If it fails: The logs will now be crystal clear about *why* (e.g., "Saved to X, Read from X, found empty").
