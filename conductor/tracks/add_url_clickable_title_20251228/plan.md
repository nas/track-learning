# Implementation Plan - Add URL to Learning Items

## Phase 1: Data Model and Service Layer [checkpoint: 99ec301]
- [x] Task: Update Learning Item Schema and Service (c709988)
    - [x] Sub-task: Add 'url' field to Zod schema in `src/lib/schemas/learning-item.ts`
    - [x] Sub-task: Update `LearningItem` type
    - [x] Sub-task: Modify `addLearningItem` and `updateLearningItem` services to accept and save the URL
    - [x] Sub-task: Write tests for the updated `learningService` (CRUD operations with URL)
- [x] Task: Conductor - User Manual Verification 'Data Model and Service Layer' (Protocol in workflow.md) (99ec301)

## Phase 2: UI Integration for URL Input [checkpoint: 440e2df]
- [x] Task: Add URL input field to Add/Edit Item forms (c47dec6)
    - [x] Sub-task: Update `AddItemForm` to include URL input
    - [x] Sub-task: Update `EditItemDialog` form to include URL input
    - [x] Sub-task: Write tests for the updated forms
- [x] Task: Conductor - User Manual Verification 'URL Input' (Protocol in workflow.md) (440e2df)

## Phase 3: Clickable Title and Navigation Logic [checkpoint: c9064d5]
- [x] Task: Make Item Title Clickable on Card (26c2260)
    - [x] Sub-task: Modify `ItemCard` component to render title as a link
    - [x] Sub-task: Implement logic to open URL in a 90% section of the page
    - [x] Sub-task: Add external link icon for visual indication
    - [x] Sub-task: Write tests for clickable title and navigation behavior
- [x] Task: Conductor - User Manual Verification 'Clickable Title and Navigation' (Protocol in workflow.md) (c9064d5)

## Phase 4: Layout Split and Refinement [checkpoint: 926edcc]
- [x] Task: Implement 10%/90% Page Frame Split (7292dce)
    - [x] Sub-task: Design and implement the layout for URL display
    - [x] Sub-task: Ensure content inside the 90% section is correctly rendered
- [x] Task: Final UI/UX Polish (styling, transitions) (7292dce)
- [x] Task: Conductor - User Manual Verification 'Layout Split and Refinement' (Protocol in workflow.md) (926edcc)