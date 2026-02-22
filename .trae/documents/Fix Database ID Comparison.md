I have applied a fix to the database logic.

**The Issue:**
The problem was likely a strict comparison check in the "Mock Database". It was looking for an exact match of the Route ID (e.g., checking if `"123"` equals `123`). If one was a text string and the other a number, the check failed, so it returned no stops even though they were saved.

**The Fix:**
I updated `mockDb.js` to be more flexible (using `==` instead of `===`), so it will correctly match the ID regardless of whether it's stored as a string or a number.

**Next Steps:**
Please try to **Add a Stop** one more time. It should now appear in the list immediately after saving.
