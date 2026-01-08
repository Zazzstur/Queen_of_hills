I have updated the plan to strictly follow a **mobile-first design strategy**, ensuring the "Queen of the Hills" application is optimized for small screens before scaling up.

### Phase 1: Project Setup & Mobile-First Configuration
1.  **Initialize Project**: Create a new React project using Vite.
2.  **Install Dependencies**: Install Tailwind CSS, `lucide-react`, and `clsx`/`tailwind-merge` for flexible class handling.
3.  **Mobile-First Tailwind Config**:
    *   Define the custom color palette (Deep Emerald, Misty Grey, etc.).
    *   Set base font sizes for mobile readability (Inter 16px base).
    *   Configure screens to prioritize `min-width` breakpoints (Tailwind default), ensuring styles apply to mobile first.
4.  **Global Mobile Styles**:
    *   Set touch-action defaults.
    *   Ensure all interactive elements have a minimum 48x48px touch target area.

### Phase 2: Mobile Layout Implementation (Base Styles)
1.  **Mobile Navigation**:
    *   Implement a simplified sticky header.
    *   Create a mobile menu (hamburger/drawer) for navigation links.
2.  **Vertical Hero Section**:
    *   Design the abstract landscape for portrait orientation.
    *   Ensure the glassmorphism search bar is full-width with large, touch-friendly inputs.
3.  **Stacked Service Cards**:
    *   Build the cards as a single-column stack.
    *   Use touch-friendly active states instead of hover effects for mobile.
4.  **Responsive Toy Train**:
    *   Implement the SVG divider to fit narrow screens.
    *   Optimize scroll animations for mobile hardware (using `transform`).
5.  **Packages List**:
    *   Display packages in a 1-column layout for easy scrolling.
6.  **Stacked Footer**:
    *   Layout content vertically for easy reading on small screens.

### Phase 3: Progressive Enhancement (Tablet & Desktop)
1.  **Responsive Breakpoints**:
    *   **Tablet (`md`)**: Expand grids to 2 columns, adjust font sizes.
    *   **Desktop (`lg`/`xl`)**:
        *   Convert mobile menu to horizontal navigation links.
        *   Switch Service Cards to 3-column grid.
        *   Switch Packages to 4-column grid.
        *   Enable desktop-specific hover effects (upward movement, shadows).
2.  **Desktop Hero**: Adjust landscape clip-paths for wide screens.

### Phase 4: Performance & Accessibility Polish
1.  **Performance**:
    *   Verify load times and interactivity on simulated mobile network.
    *   Ensure animations use hardware-accelerated properties (`transform`, `opacity`).
2.  **Accessibility**:
    *   Verify color contrast ratios (WCAG AA).
    *   Test keyboard navigation and screen reader compatibility.
    *   Audit touch target sizes.

### Verification
*   **Mobile View**: Use browser dev tools to simulate iPhone/Android viewports (375px - 414px).
*   **Responsive Testing**: progressively widen the viewport to check breakpoints.
