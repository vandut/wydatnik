# Analytics Page Implementation Plan

This document serves as the orchestration file for implementing the new Analytics Page and System Categories. It is divided into phases so that an AI agent can implement it step-by-step.

## Phase 1: System Categories Foundation

**Objective:** Introduce "Income" and "Investment" as system-level categories that cannot be deleted or edited, but allow custom subcategories.

**Implementation Steps:**
1. **Define System Categories:**
   - Create constants for system categories (e.g., `SYSTEM_CATEGORY_INCOME`, `SYSTEM_CATEGORY_INVESTMENT`).
   - Add a new property to the `Category` type: `isSystem?: boolean`.
   - Ensure "Investment" has `isNotExpense: true` permanently.
2. **Update Store Initialization & Data Loading:**
   - Modify the category initialization logic in the global store (e.g., Zustand store or Context).
   - **Migration/Tamper-Proofing:** When loading data from a file (e.g., importing a backup from an older version or a manually tampered file), run a validation step:
     - Check if the system categories exist (by ID or `isSystem` flag).
     - If missing, inject them into the imported categories array.
     - If present but tampered with (e.g., `isNotExpense` removed from Investment, or name changed), force-override their properties to the required system defaults.
3. **UI Restrictions:**
   - Update the Categories management view (e.g., `/src/views/categories/`) to disable "Edit" and "Delete" buttons for categories where `isSystem === true`.
   - Allow users to create subcategories where the `parentId` is a system category.

## Phase 2: Analytics Page & Date Picker

**Objective:** Create a dedicated "Analytics" tab with a custom Month/Year range picker.

**Implementation Steps:**
1. **Routing & Navigation:**
   - Create `/src/views/analytics/AnalyticsPage.tsx`.
   - Add the "Analytics" link to the main navigation menu/layout.
2. **Date Range Picker Component:**
   - Build a custom Month/Year range picker.
   - Default the selection to the last 12 months (e.g., Start: March 2025, End: March 2026).
3. **Data Processing Utility:**
   - Create a utility function that takes the selected date range and the raw transactions.
   - Generate a continuous timeline of months (e.g., `['2025-03', '2025-04', ..., '2026-03']`).
   - Group transactions by these months.
   - Fill in any months without transactions with zero values to ensure the timeline remains continuous.

## Phase 3: Category Filter Table

**Objective:** Build a table below the charts to control chart visibility and show totals.

**Implementation Steps:**
1. **Table Component Structure:**
   - Create a table component in the Analytics view showing all categories and their expanded subcategories.
   - Display the total amount for each category/subcategory within the selected date range.
2. **Checkbox Logic:**
   - Add a checkbox next to each category and subcategory.
   - Add a "Select/Deselect All" checkbox at the top.
   - **Parent/Child Sync:** Implement logic so that checking/unchecking a parent category automatically checks/unchecks all of its subcategories.
3. **State Management:**
   - Wire the table's selection state to act as the master filter for the charts above it.

## Phase 4: Charts Implementation

**Objective:** Implement the visual summaries (Pie Chart and Monthly Bar Chart) using the filtered data.

**Implementation Steps:**
1. **Pie Chart:**
   - Render expenses based on the categories selected in the Filter Table.
   - Exclude the "Income" system category entirely.
   - Add a toggle UI: "Include Investments" (or "Include non-expenses"). When toggled, include categories marked as `isNotExpense: true`.
2. **Monthly Bar Chart:**
   - Render side-by-side bars for each month in the continuous timeline.
   - **Bar 1 (Income):** Total Income for the month (rendered as a separate bar, e.g., in the background or side-by-side).
   - **Bar 2 (Expenses):** Stacked expenses for the month.
   - Add an option to color-code the stacked expense bar by category.
   - Add the same toggle UI as the Pie Chart to include/exclude "not an expense" (Investments) in the expense bar.
