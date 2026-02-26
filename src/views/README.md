# Views Directory Architecture

This directory contains the main views (pages) for the application. To maintain a clean, predictable, and easily navigable codebase, please adhere to the following architectural guidelines:

## 1. Subdirectory per View
All individual view files must be located in their respective subdirectories (e.g., `transactions/`, `categories/`, `accounts/`).

## 2. Strictly Flat Structure
The subdirectories within `views/` must maintain a **flat structure**. No deeper subdirectories (such as `components/`, `hooks/`, or `utils/` inside a view folder) are allowed. 

## 3. View-Specific Files
Any file that is specific *only* to a given view should be stored directly alongside the main view file in its flat subdirectory. This includes:
- View-specific components
- View-specific hooks
- View-specific utility files

Keeping these files flat and co-located makes it immediately obvious what belongs to a specific view without having to dig through nested folders.

## 4. Global Shared Files
If a file is used across multiple views or is app-wide, it should be placed in the appropriate global directory at the `src/` level:
- **Common Components:** Shared UI elements (like dialogs, app-wide buttons, layout wrappers) belong in the global `src/components/` directory.
- **Shared Hooks/Utils:** App-wide hooks and utilities should reside in the global `src/hooks/`, `src/utils/`, or `src/lib/` directories.

## 5. State Management (Container/Presentational Pattern)
To keep the application predictable and easy to debug, follow the Container/Presentational pattern for state management within views:
- **Views (Containers):** The main view file (e.g., `TransactionsView.tsx`) is the *only* component that should manage state, dispatch actions, or interact directly with the global store (`useAppContext`).
- **Extracted Subcomponents (Presentational):** Subcomponents that are extracted into separate files (e.g., `TransactionsTable.tsx`, `CategoryDropdown.tsx`) should be purely presentational. They must not manage state or dispatch actions directly. Instead, they should receive data and callback functions (like `onChange` or `onUpdate`) via props from the parent view.
- **Inner Components (Same File):** It is allowed and encouraged to extract common HTML/JSX into "inner components" defined at the top of a file. This helps with readability by separating concerns. **Important:** The inner components still need to adhere to the presentational rule, *unless* these reside in the main view file (e.g., `BulkActions` inside `TransactionsView.tsx`). If they are in the main view file, they are allowed to have state and manage global state to help with encapsulation. They are kept in the same file because they are not conceptually large enough to warrant a separate file. If they grow significantly, they may be extracted to a separate file, at which point they must adhere to the presentational rule.
