The "blank page" issue was caused by the `routes` data array being undefined in the application state, which caused the table component to fail silently or crash when trying to read its length.

I have fixed this by:
1.  **Updating `AdminContext.jsx`**: Added `routes: []` to the initial state and the data loading logic. This ensures the table always receives a valid array, even if it's empty.
2.  **Improving Data Persistence**: Fixed a potential bug where saving to local storage was unreliable. Now, data is only saved after the initial load is complete, preventing accidental data loss.
3.  **Updating Fallback Data**: Updated `src/data/experiences.js` to include the empty `routes` array for new users.

Now, when you navigate to the **Routes** tab, instead of a blank page, you should see the "Routes Management" header and a "No records found" message (if you haven't added any routes yet), along with the "Add New" button.

You can now proceed to add routes using the button.
