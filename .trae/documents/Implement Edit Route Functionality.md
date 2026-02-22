I have successfully implemented the "Edit Route" functionality.

### Key Changes:

1.  **Admin Dashboard (`AdminDashboard.jsx`)**:
    *   Updated the `handleEdit` function to open the `AddRouteForm` with the selected route's data (`initialData`) instead of showing an "alert".

2.  **Add Route Form (`AddRouteForm.jsx`)**:
    *   Modified the component to accept `initialData`.
    *   If editing, it now sets the header to "Edit Route" or "Route Updated".
    *   It passes the existing route data down to the details form.

3.  **Route Details Form (`RouteDetailsForm.jsx`)**:
    *   Now pre-fills all fields (Origin, Destination, Price, etc.) with the existing data.
    *   Shows the existing cover image if available.
    *   When submitting, it detects if it's an update (has an ID) and calls `routeService.updateRoute` instead of creating a new one.

4.  **Stops Management (`StopsManagement.jsx`)**:
    *   Added logic to fetch and display the *existing stops* for the route when the component loads.
    *   This allows you to see, add, or delete stops for an existing route.

### How to Verify:
1.  Go to the **Admin Dashboard** -> **Routes**.
2.  Click the **Edit (Pencil)** icon on any route.
3.  The form should open with all the route's details pre-filled.
4.  You can change the price, description, or image and click **"Update Route & Continue"**.
5.  On the next screen, you will see the existing stops for that route. You can add new ones or remove old ones.
6.  Click **"Finish & Close"** to save everything.
