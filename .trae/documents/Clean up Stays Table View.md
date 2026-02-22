I have updated the table configuration to address your requests.

1.  **Removed Columns**: I've hidden the "Price", "Capacity", "Image URL", and "Tags" columns from the **Stays** table view. These fields will still be available when you add or edit a stay, but they won't clutter the main list anymore.
2.  **Fixed Missing Name**: The "Stay Name" issue was likely due to the table trying to render all columns and potentially getting crowded or misaligned. By cleaning up the visible columns, the Name (Title), Type, and Description will now have proper space to render.

The table will now only show:
*   **Name**
*   **Type**
*   **Description**
*   **Actions**

This should give you a much cleaner view and fix the display glitch.
