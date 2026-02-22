I have identified the issue: there was a mismatch between the data structure used in the **Add Stay Form** (`name`) and the one expected by the **Table** (`title`).

I have fixed this by updating `AddStayForm.jsx` to:
1.  Use `title` instead of `name` for the stay's name field.
2.  Correctly map the initial data when editing (loading `title` instead of `name`).
3.  Ensure compatibility for the image field (`image` vs `thumbnail_url`).
4.  Add a default `price` value ("On Request") if it's missing, to prevent validation errors.

**Note:** This fix applies to *newly* created or updated stays. For the existing "broken" entries (like "bknjll", "rtdfy") that you see in the table, you may need to delete them and recreate them, or edit them (if the edit form loads correctly) to fix the missing name. Since they were saved with the wrong key (`name` instead of `title`), the table cannot display them until they are corrected.
