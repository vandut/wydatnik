# Application Requirements Specification: Wydatnik

## 1. Application Goal and Vision
* A Single Page Application (SPA) designed for tracking, categorizing, and analyzing personal expenses based on imported bank transaction histories. The main goal of the application is to provide the user with a flexible, fully local tool for organizing finances without the need to create an account or connect to external servers (beyond the initial loading of the application).

## 2. Architecture and Platform
* **Platform:** Web (Desktop & Mobile - fully responsive SPA)
* **Backend Architecture:** Client-side application without a backend (Frontend-only). Application state and data are stored in the browser's memory (in-memory) with the ability to manually save/load to a local file.
* **Suggested Technologies:** React, TypeScript, Vite, Tailwind CSS, React Router (HashRouter). The application must be written using the dependency injection/factory pattern (separation of the visual layer from business logic and data access). The architecture must support internationalization (i18n) from the ground up.

## 3. User Personas
* **P1:** Individual User - A person managing their home finances who downloads transaction histories from their bank and wants to categorize and analyze them independently on their own device, valuing data privacy.

## 4. Functional Requirements (FR)

---
**FR1: Account and currency configuration**
* **Description:** As an Individual User, I want to be able to specify the currency of my account on the "Accounts" screen so that all amounts are displayed with the correct symbol.
* **Acceptance Criteria (AC):**
    * AC1.1: Upon the first launch, the system automatically sets the default account currency based on the browser's language (PLN for Polish, USD for English).
    * AC1.2: The user can manually change the currency by typing any three-letter abbreviation in a text field on the "Accounts" subpage.
    * AC1.3: Changing the currency immediately updates the display across all views in the application.

---
**FR2: Navigation and responsive user interface**
* **Description:** As an Individual User, I want to navigate freely through the application using a modern and responsive interface (inspired by the Monarch app style) to comfortably use it on both desktop and smartphone.
* **Acceptance Criteria (AC):**
    * AC2.1: On desktop devices, the main navigation is located in the left sidebar and contains links: Accounts, Transactions, Categories.
    * AC2.2: On mobile devices, the main navigation moves to a Bottom Navigation Bar.
    * AC2.3: The default page upon entering the application (base route) is the "Transactions" view. Hash-based routing (HashRouter) is used.

---
**FR3: Importing and parsing transaction history (CSV)**
* **Description:** As an Individual User, I want to import a CSV file containing my bank transaction history to load my data into the application.
* **Acceptance Criteria (AC):**
    * AC3.1: The application has an "Import transactions" button that opens a popup where the user selects a local file and the target format from a dropdown list (initially, only the mBank CSV format is available).
    * AC3.2: The system parses the file, ignoring unnecessary headers/metadata, and correctly interprets the date and amount formats (including removing currency suffixes from the mBank file).
    * AC3.3: New transactions are appended to the current memory state without automatic deduplication. By default, they receive the "Uncategorized" status.

---
**FR4: Browsing and filtering transactions**
* **Description:** As an Individual User, I want to browse the list of imported transactions divided by months and filter them by categories to analyze my expenses.
* **Acceptance Criteria (AC):**
    * AC4.1: Transactions are displayed in a clear table format (Date, Name, Category, Amount). The transaction data itself (except for the category) is locked for editing (read-only).
    * AC4.2: Above the table, there is a month selection dropdown. Only months for which uploaded transactions exist appear on the list.
    * AC4.3: On the side of the transactions view (or as an additional navigation element), there is a panel with a list of main categories and their current financial balance. Clicking a category filters the main table.

---
**FR5: Managing the category tree**
* **Description:** As an Individual User, I want to create hierarchical categories on a dedicated "Categories" subpage so that I can accurately describe my expenses.
* **Acceptance Criteria (AC):**
    * AC5.1: The "Categories" subpage contains a list of created categories and a button to add a new one.
    * AC5.2: Creating/editing a category takes place in a popup where the name and, optionally, the parent (for subcategories) are defined.
    * AC5.3: Only parent (main) categories can and must have an assigned emoji (selected from suggestions or using the user's system keyboard). Subcategories have the emoji selection disabled.

---
**FR6: Categorization and mass operations on transactions**
* **Description:** As an Individual User, I want to be able to quickly categorize transactions and perform mass actions (deleting, merging) to keep my data organized.
* **Acceptance Criteria (AC):**
    * AC6.1: In each table row, within the "Category" column, there is a dropdown that allows for instant category assignment (it expands the full tree of parent and nested subcategories).
    * AC6.2: Each row has a checkbox. After selecting multiple transactions, they can be deleted in bulk from the application's memory.
    * AC6.3: After selecting multiple transactions, an automatic "fusion" (merge) can be performed: the system creates one transaction with the newest date, sums the amounts, concatenates the original descriptions into one string, and sets the status to "Uncategorized" (unless all selected items had the exact same category prior to merging).

---
**FR7: Saving and loading application state**
* **Description:** As an Individual User, I want to save my current work progress to a local file on my disk and load it in the future so as not to lose data after closing the browser.
* **Acceptance Criteria (AC):**
    * AC7.1: The application has a "Save" button that instantly downloads a JSON file from the browser containing a snapshot of the full state (transactions, accounts, categories).
    * AC7.2: The "Open" button allows loading a previously generated JSON file, instantly replacing and refreshing the entire visible application state (clearing the previous memory state).

---

## 5. Non-Functional Requirements (NFR)
* **NFR1 (Security and Privacy):** The save file exported by the application is a standard, unencrypted text file (JSON). Total responsibility for the security and storage of this file on the local drive rests with the user. The application does not send any financial data over the network.
* **NFR2 (Internationalization - i18n):** The application must be written with full support for multiple languages. All strings must be extracted into text dictionaries. Initially supported languages are Polish and English, automatically selected based on the user's browser language preferences.
* **NFR3 (Architectural Extensibility):** The code responsible for parsing bank files must be based on a common input/output interface. Adding support for a new bank format should only require implementing a new parser and registering it in the factory, without needing changes to the application's core services.
* **NFR4 (UX/UI):** The application interface must be designed in a light color palette, emphasizing modern design patterns (ample white space, soft shadows, clear typography), similar to the standards set by applications like Monarch.
