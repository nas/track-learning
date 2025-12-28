# Implementation Plan - Add URL to Learning Items

## Phase 1: Data Model and Service Layer [checkpoint: 99ec301]
- [x] Task: Update Learning Item Schema and Service (c709988)
    - [x] Sub-task: Add 'url' field to Zod schema in `src/lib/schemas/learning-item.ts`
    - [x] Sub-task: Update `LearningItem` type
    - [x] Sub-task: Modify `addLearningItem` and `updateLearningItem` services to accept and save the URL
    - [x] Sub-task: Write tests for the updated `learningService` (CRUD operations with URL)
- [x] Task: Conductor - User Manual Verification 'Data Model and Service Layer' (Protocol in workflow.md) (99ec301)

## Phase 2: UI Integration for URL Input
- [ ] Task: Add URL input field to Add/Edit Item forms
    - [ ] Sub-task: Update `AddItemForm` to include URL input
    - [ ] Sub-task: Update `EditItemDialog` form to include URL input
    - [ ] Sub-task: Write tests for the updated forms
- [ ] Task: Conductor - User Manual Verification 'URL Input' (Protocol in workflow.md)

## Phase 3: Clickable Title and Navigation Logic
- [ ] Task: Make Item Title Clickable on Card
    - [ ] Sub-task: Modify `ItemCard` component to render title as a link
    - [ ] Sub-task: Implement logic to open URL in a 90% section of the page
    - [ ] Sub-task: Add external link icon for visual indication
    - [ ] Sub-task: Write tests for clickable title and navigation behavior
- [ ] Task: Conductor - User Manual Verification 'Clickable Title and Navigation' (Protocol in workflow.md)

## Phase 4: Layout Split and Refinement
- [ ] Task: Implement 10%/90% Page Frame Split
    - [ ] Sub-task: Design and implement the layout for URL display
    - [ ] Sub-task: Ensure content inside the 90% section is correctly rendered
- [ ] Task: Final UI/UX Polish (styling, transitions)
- [ ] Task: Conductor - User Manual Verification 'Layout Split and Refinement' (Protocol in workflow.md)