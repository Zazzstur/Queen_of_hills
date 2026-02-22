I have instrumented `mockDb.js` with detailed logging to diagnose why stops are not being found.

### Diagnosis Steps
The error `Found 0` means the database is returning no stops for the given Route ID. This could be because:
1.  The stop wasn't saved to `localStorage` (Save failure).
2.  The stop was saved with a mismatched Route ID.
3.  The filter logic is failing to match the ID.

### The Solution
I have added logs that will tell us exactly:
1.  **When saving**: "MockDB: Creating stop... Stop saved. Total stops: X".
2.  **When fetching**: "MockDB: Fetching stops for routeId: Y... Found Z stops".

If you try to add a stop now, the **Console (F12)** will show the full story.
*   If you see "Stop saved" but "Found 0", then the Route ID being saved is different from the one being fetched.
*   If you don't see "Stop saved", then the save operation crashed (and the logs will show the error).

This visibility allows us (or you) to pinpoint the exact break in the chain. I've also kept the previous fixes (safety delays, ID normalization) in place.
