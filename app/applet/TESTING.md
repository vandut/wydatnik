# Testing Strategy & Guidelines

This document outlines the testing strategy for the Wydatnik application, specifically focusing on the use of `data-testid` attributes to ensure robust and maintainable component tests.

## Why `data-testid`?

When writing component tests (e.g., using `vitest` and `@testing-library/react`), relying solely on display text or labels can lead to brittle tests. This is especially true in a multi-lingual (i18n) application where text changes based on the selected language. While querying by role or label is a best practice for accessibility, adding `data-testid` attributes to key structural and interactive elements provides robust "handles" for test scripts to easily locate complex or dynamic components without breaking when copy changes.

## Rules for Defining `data-testid` Attributes

To maintain consistency across the codebase, follow these rules when adding `data-testid` attributes:

1. **Naming Convention (Kebab-Case):**
   Use `kebab-case` for all test IDs.
   *Good:* `data-testid="submit-button"`
   *Bad:* `data-testid="submitButton"`, `data-testid="Submit_Button"`

2. **Component/Context Prefixing:**
   Prefix the test ID with the component or context name to avoid collisions and provide clarity.
   *Example:* In the `ImportModal` component, use `import-modal`, `import-proceed-btn`, `import-file-input`.

3. **Dynamic Elements:**
   For elements rendered in a list or map, append a unique identifier (like an ID) to the test ID.
   *Example:* `data-testid={\`transaction-row-\${transaction.id}\`}` or `data-testid={\`category-card-\${category.id}\`}`.

4. **Target Interactive Elements:**
   Always add test IDs to interactive elements that tests will need to interact with:
   - Buttons (`-btn` suffix)
   - Inputs (`-input` suffix)
   - Selects/Dropdowns (`-select` or `-dropdown` suffix)
   - Links (`-link` suffix)

5. **Target Key Containers:**
   Add test IDs to major structural containers to allow scoping queries using `within(element).getBy...`.
   - Modals (`-modal` suffix)
   - Views/Pages (`-view` suffix)
   - Tables/Lists (`-table` or `-list` suffix)

6. **Avoid Over-Testing:**
   Do not add `data-testid` to every single DOM element (like decorative `div`s or `span`s). Only add them to elements that are necessary for assertions or interactions in your tests.

## Usage in Tests

When writing tests, prefer `getByTestId`, `queryByTestId`, and `findByTestId` for elements that have a `data-testid` attribute.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('example test', async () => {
  render(<MyComponent />);
  
  // Scoping within a container
  const modal = screen.getByTestId('import-modal');
  const proceedBtn = within(modal).getByTestId('import-proceed-btn');
  
  await userEvent.click(proceedBtn);
});
```

## List of Components with `data-testid`

Here is a summary of the components and the locations where `data-testid` attributes have been implemented:

### Core Components
- **`CategoryDropdown`**: `category-dropdown-trigger`, `category-dropdown-desktop`, `category-dropdown-mobile`, `category-option-uncategorized`, `category-option-main-{id}`, `category-option-sub-{id}`
- **`Drawer`**: `drawer`, `drawer-close-btn`
- **`Modal`**: `modal`, `modal-close-btn`

### Layout
- **`Layout`**: `desktop-sidebar`, `mobile-header`, `mobile-bottom-nav`, `save-btn`, `load-btn`, `nav-link-{path}`, `mobile-load-btn`, `mobile-save-btn`, `mobile-nav-link-{path}`
- **`ErrorModal`**: `error-modal-ok-btn`

### Views
- **`AccountsView`**: `currency-input`
- **`AnalyticsPage`**: `analytics-view`
- **`CategoriesView`**: `categories-view`, `add-category-btn`, `category-card-{id}`, `edit-category-btn-{id}`, `delete-category-btn-{id}`
- **`TransactionsView`**: `transactions-view`, `import-btn`, `search-input`, `date-navigation`

### Categories
- **`CategoryModal`**: `save-category-btn`, `cancel-category-btn`, `category-name-input`, `category-parent-select`, `category-emoji-input`, `category-exclude-checkbox`
- **`ConfirmDeleteCategoryModal`**: `confirm-delete-category-btn`, `cancel-delete-category-btn`

### Analytics
- **`CategoryFilterTable`**: `category-filter-table`, `toggle-all-categories`, `toggle-category-uncategorized`, `toggle-category-{id}`
- **`Charts`**: `include-investments-checkbox`, `pie-chart-container`, `bar-chart-container`
- **`MonthRangePicker`**: `start-month-input`, `end-month-input`

### Transaction Modals & Sub-components
- **`ImportModal`**: `import-modal`, `import-format-select`, `import-dropzone`, `import-file-input`, `import-error-msg`, `import-summary-view`, `import-proceed-btn`, `import-cancel-btn`, `import-reset-btn`
- **`TransactionsTable`**: `transactions-table`, `header-checkbox`, `transaction-row-{id}`, `category-dropdown`, `edit-btn`, `split-btn`, `merge-btn`, `delete-btn`
- **`ConfirmDeleteModal`**: `confirm-delete-btn`, `cancel-delete-btn`
- **`EditTransactionModal`**: `save-edit-btn`, `cancel-edit-btn`, `edit-date-input`, `edit-title-input`
- **`MergeTransactionsModal`**: `confirm-merge-btn`, `cancel-merge-btn`
- **`MonthDropdown`**: `month-dropdown-trigger`, `month-dropdown-desktop`, `month-dropdown-mobile`, `month-option-{monthStr}`
- **`SplitTransactionModal`**: `save-split-btn`, `cancel-split-btn`, `split-title-input`, `split-from-month`, `split-from-year`, `split-to-month`, `split-to-year`
- **`TransactionCategories`**: `sidebar-category-{id}`, `sidebar-toggle-all`, `sidebar-expand-{id}`
