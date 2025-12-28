# Implementation Plan - Dashboard Core and Data Layer

## Phase 1: Project Foundation & Data Layer [checkpoint: a4e2888]
- [x] Task: Initialize project with required dependencies (TanStack Query, Zod, date-fns, sonner, framer-motion, lucide-react, next-themes, clsx, tailwind-merge) [d92b6fc]
- [x] Task: Setup `data/` directory and create initial `learning-items.json` with sample data [17c6979]
- [x] Task: Define Zod schemas for `LearningItem`, `LearningItemType`, and `LearningItemStatus` [f677ae9]
- [x] Task: Implement Data Access Layer (services/learningService.ts) [afc440f]
    - [x] Sub-task: Write Tests for `learningService` (Reading/Writing JSON files)
    - [x] Sub-task: Implement `learningService`
- [x] Task: Conductor - User Manual Verification 'Foundation & Data Layer' (Protocol in workflow.md) [a4e2888]

## Phase 2: Dashboard UI & Read Integration [checkpoint: 03f22c2]
- [x] Task: Setup Main Dashboard Layout and Responsive Shell [10cabaf]
- [x] Task: Create Dashboard Item Card component [bccaffb]
    - [x] Sub-task: Write Tests for `ItemCard`
    - [x] Sub-task: Implement `ItemCard` using Tailwind and Shadcn
- [x] Task: Integrate TanStack Query for Dashboard Data Fetching [4abd756]
    - [x] Sub-task: Write Tests for `useLearningItems` hook
    - [x] Sub-task: Implement `useLearningItems` hook and integrate into Dashboard
- [x] Task: Conductor - User Manual Verification 'Dashboard UI & Read Integration' (Protocol in workflow.md) [03f22c2]

## Phase 3: Item Management (Add, Update, Archive)
- [x] Task: Implement "Add Item" Modal and Form (React Hook Form + Zod) [0142223]
    - [x] Sub-task: Write Tests for `AddItemForm`
    - [x] Sub-task: Implement `AddItemForm` and Mutation logic
    - [ ] Sub-task: Implement `AddItemForm` and Mutation logic
- [x] Task: Implement Item Editing (Status and Progress updates) [29fd235]
    - [x] Sub-task: Write Tests for Update logic
    - [x] Sub-task: Implement UI and Mutation for updating items
- [x] Task: Implement Archiving functionality [29fd235]
    - [x] Sub-task: Write Tests for Archiving logic
    - [x] Sub-task: Implement Archive action in UI
- [ ] Task: Conductor - User Manual Verification 'Item Management' (Protocol in workflow.md)

## Phase 4: Search, Filtering & Polishing
- [ ] Task: Implement Search Bar and Category Filtering
    - [ ] Sub-task: Write Tests for Search/Filter logic
    - [ ] Sub-task: Implement UI controls and filter state in Dashboard
- [ ] Task: Implement Dark Mode support using `next-themes`
- [ ] Task: Final UI/UX Polish and Animation implementation (Framer Motion)
- [ ] Task: Conductor - User Manual Verification 'Search, Filtering & Polishing' (Protocol in workflow.md)
