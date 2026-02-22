I have completely rebuilt the "Add Stop" functionality to ensure reliability and data persistence.

### Key Changes:

1.  **New "Save-As-You-Go" Workflow**:
    *   Previously, stops were held in a temporary state until you clicked "Finish". This caused issues with data loss and ID mismatches.
    *   **Now**, when you click "Save Stop", the stop is **immediately saved to the database**. This ensures that what you see in the list is always safely stored.

2.  **Redesigned Components**:
    *   **`StopsManagement.jsx`**: Now acts as a dashboard for stops. It lists all *saved* stops for the route and provides an "Add Stop" button.
    *   **`StopCard.jsx`**: Transformed into a dedicated **Add Stop Form**. It handles input, image upload, and saving for a single stop, then closes automatically upon success.

3.  **Simplified Logic**:
    *   Removed complex "temporary ID" logic that was causing bugs.
    *   Added a **Delete** button for each stop in the list, so you can easily remove mistakes.

### How to use it:
1.  Click **Add Stop**.
2.  Fill in the Name, Price, and Description.
3.  Click **Save Stop**.
    *   The form will verify the save, close, and the new stop will appear in the list below.
4.  Repeat for as many stops as you need.
5.  Click **Finish & Close** when you are done.

This approach guarantees that all your stop details are saved correctly.
