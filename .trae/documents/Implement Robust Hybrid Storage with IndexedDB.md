I have analyzed the storage implementation and identified that storing Base64 images directly in `localStorage` is causing the "Quota Exceeded" errors and likely data corruption.

### The Solution: Hybrid Storage
I will implement a robust hybrid storage mechanism within `mockDb.js`:

1.  **IndexedDB for Images**: I will implement a lightweight IndexedDB adapter to store binary image data. IndexedDB handles large files (GBs) easily, unlike LocalStorage (5MB).
2.  **LocalStorage for Metadata**: JSON data (routes, stops, text) will remain in `localStorage` for simplicity, but I will strip out the heavy image data.
3.  **Automatic Rehydration**:
    *   When you upload an image, it will be saved to IndexedDB, and a unique reference ID will be returned.
    *   When you fetch data (e.g., `getRoutes`), the system will automatically look up these IDs, create temporary Blob URLs, and inject them into the response.
    *   This ensures the UI works exactly as before (seeing images), but the underlying storage is scalable and crash-proof.

### Implementation Steps
1.  **Modify `mockDb.js`**:
    *   Add `initImageDB()`, `saveImage()`, and `getImage()` using native IndexedDB API.
    *   Update `uploadImage` to use this new system instead of Base64.
    *   Update all `get` methods (`getRoutes`, `getStops`, etc.) to "rehydrate" image URLs before returning data.
2.  **Add Error Barriers**:
    *   Wrap `JSON.parse` in `getDb` to gracefully recover from corrupted `localStorage` data (e.g., reset to empty state instead of crashing the app).

This solution completely eliminates the storage limit errors while maintaining the "local database" experience.
