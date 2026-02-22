I have successfully implemented the "View Details" feature for Routes (Expert Cabs).

### Key Changes:

1.  **New `RouteDetails` Page**:
    *   Created `src/components/RouteDetails.jsx`.
    *   This page displays the full details of a route, including Origin, Destination, Base Price, Capacity, and Description.
    *   It fetches and lists all the **Stops** associated with that route, showing the stop name, time from origin, and description.

2.  **Navigation Logic**:
    *   Updated `App.jsx` to handle the `route-details` route.
    *   Updated `ExperiencesListing.jsx` and `TicketCard` to correctly handle the "View Details" click for routes, passing the user to the new details page.

### How to Verify:
1.  Go to the **Expert Cabs** section.
2.  Click **View Details** on any route card.
3.  You will be taken to a new page showing the trip details and a timeline of all the stops you added to that route.
4.  Click **Back to Cabs** to return to the list.

The page is fully responsive and matches the existing design system.
