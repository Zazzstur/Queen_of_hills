I have fixed the issue where stops were not being saved.

**The Problem:**
1.  When you clicked "Save Stop" on a card, the parent component (`StopsManagement`) wasn't being told that the stop was successfully saved.
2.  If you clicked "Finish & Close" without manually saving each stop first, those unsaved stops were lost without warning.

**The Fix:**
1.  **Linked Save Action:** I updated `StopsManagement.jsx` to listen for the "Save Success" event from `StopCard`. Now, when you save a stop, it updates the main list with the saved data.
2.  **Unsaved Changes Warning:** I added a check to the "Finish & Close" button. If you try to close the window while there are stops that haven't been saved (stops that still have the "Save Stop" button active), it will show a confirmation alert warning you that those stops will be lost.

**How to Verify:**
1.  Go to **Admin -> Routes** and edit a route.
2.  Click **Add Stop**.
3.  Fill in the details and click the **Save Stop** button inside the card. You should see it change to "Saved".
4.  If you try to add another stop and click "Finish & Close" *without* saving it, you will now see a warning.
