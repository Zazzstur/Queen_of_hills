I have successfully implemented the requested features for the Stays listing and details pages.

### Key Changes:

1.  **Dynamic Stay Listing**:
    *   Updated `ExperiencesListing.jsx` to fetch real stay data from the admin backend (`stayService`) instead of using static mock data.
    *   Created a new `StayCard.jsx` component that matches your design system (consistent with the screenshot).
    *   **Price Logic**: The card now automatically calculates and displays the *minimum* price among all rooms available for that stay. If no rooms are listed, it falls back to the stay's base price or "On Request".

2.  **Detailed Room View**:
    *   Created a new `StayDetails.jsx` page.
    *   This page displays the stay's full description, amenities, and a list of all available rooms with their specific images, prices, and capacities.
    *   It includes a responsive "Back" navigation button to return to the main list.

3.  **Navigation & Routing**:
    *   Updated `App.jsx` to handle routing for the new "Stay Details" view.
    *   The "View Details" button on each card now seamlessly transitions to the detailed view, preserving the user's context.

### How to Verify:
1.  Go to the **Experiences** page (or click "Stays" in the nav).
2.  You should see your actual stays from the admin panel listed there.
3.  The price shown on the card should reflect the cheapest room you've added to that stay.
4.  Clicking **View Details** will open the new page showing all the rooms you've configured.

This implementation preserves your existing design aesthetic while making the frontend fully dynamic and connected to your admin data.
