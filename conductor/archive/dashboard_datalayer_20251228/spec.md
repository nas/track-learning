# Specification - Dashboard Core and Data Layer

## Overview
This track focuses on establishing the data foundation for the Learning Tracker and building the primary user interface: the Dashboard. We will implement the full lifecycle (Create, Read, Update) for learning items, persisting them to local files and displaying them in a searchable and filterable view.

## Functional Requirements
- **Data Layer:**
    - Implement service functions using Node.js `fs` to read and write learning items to a local JSON file (e.g., `data/learning-items.json`).
    - Define a Zod schema for learning items to ensure data integrity during both read and write operations.
- **Dashboard UI:**
    - Create a responsive dashboard layout using Tailwind CSS and Shadcn UI components.
    - Display a list or grid of learning items with their key metadata (Title, Author, Status, Progress, Dates).
- **Search & Filtering:**
    - Implement real-time text search for titles.
    - Implement filtering by media type (Book, Course, Article).
- **Item Management (CRUD):**
    - **Add Item:** Implement a modal/form (using React Hook Form + Zod) to create new learning items.
    - **Update Item:** Allow users to edit item details, specifically updating progress and status.
    - **Archive/Status Update:** Allow users to change an item's status to "Archived" or "Completed".
- **Data Integration:**
    - Use TanStack Query to manage data fetching and mutations (updates) to keep the UI in sync with the file storage.

## Non-Functional Requirements
- **Performance:** Data fetching and updates should feel instantaneous.
- **Accessibility:** Ensure all forms and interactive elements are accessible.
- **Maintainability:** Separate service logic, API routes (if needed for writes), and UI components.

## Acceptance Criteria
- The dashboard displays items read from the local file.
- Users can successfully add a new book, course, or article via the UI, and it persists to the file.
- Users can edit an item (e.g., update progress from 50% to 60%) and the change is saved.
- Users can filter and search the list effectively.
- All forms handle validation errors gracefully using Zod.

## Out of Scope
- Authentication.
- Deleting items permanently (we will use Archiving/Status changes instead).
