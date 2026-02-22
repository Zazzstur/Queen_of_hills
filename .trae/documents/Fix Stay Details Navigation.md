I have fixed the navigation issue.

**The Problem:**
In `StayCard.jsx`, the button was calling `onNavigate(stay.id)`. However, `App.jsx` expects the first argument to be the page name (`'stay-details'`) and the second argument to be the ID. Because it received an ID as the first argument (e.g., `'123'`), it treated it as a page name, couldn't match it to any known route, and defaulted to rendering the home page (or fallback).

**The Fix:**
I updated `StayCard.jsx` to call `onNavigate('stay-details', stay.id)`.

Now, clicking "View Details" will correctly route you to the Stay Details page for that specific stay.
