I have completely rebuilt the Route and Stop management system from scratch, implementing a modern, robust, and user-friendly architecture.

### What has been built:

1.  **Orchestrator (`AddRouteForm.jsx`)**:
    *   A clean **2-Step Wizard** interface with a visual progress stepper.
    *   Smooth transitions and a focused modal layout.

2.  **Step 1: Route Creation (`RouteDetailsForm.jsx`)**:
    *   **New Design**: A professional 2-column layout with grouped fields.
    *   **Validation**: Strict Zod validation for all fields (e.g., ensuring price > 0).
    *   **Image Uploader**: A beautiful drag-and-drop style image uploader with preview and delete functionality.
    *   **Feedback**: Clear error messages and "Processing" states.

3.  **Step 2: Stops Management (`StopsManagement.jsx`)**:
    *   **Dashboard View**: A dedicated dashboard for stops within the wizard.
    *   **Visual List**: Stops are now displayed as rich cards with visual indicators for "Included" vs "Paid" stops.
    *   **Empty States**: A friendly "No stops yet" state guiding the user to add their first stop.

4.  **Add Stop Form (`StopCard.jsx`)**:
    *   **Dedicated Form**: A slide-in form that focuses the user on the task.
    *   **Multi-Image**: Improved support for adding multiple images to a stop.
    *   **Robust Saving**: Direct integration with the database service with error handling.

### How to use it:
1.  Click **Routes** in the Admin Dashboard.
2.  Click **Add Route** (or Edit on an existing one).
3.  **Step 1**: Fill in the route details and upload a cover image. Click "Create & Continue".
4.  **Step 2**: You will see the new Stops Dashboard. Click **"Add New Stop"**.
5.  Fill in the stop details and click **"Save Stop"**. It will appear instantly in the list.
6.  When finished, click **"Finish & Close"**.

This implementation solves all previous data persistence issues while providing a significantly upgraded user experience.
