# Tech Stack - Learning Tracker

## Core Framework
- **Next.js (App Router):** The foundation for our application, providing routing, server components, and optimized performance.
- **TypeScript:** Ensuring type safety and a robust development experience across the entire codebase.

## Styling & UI Components
- **Tailwind CSS:** For efficient, utility-first styling.
- **Radix UI Primitives:** Providing the accessible, unstyled foundation for our UI components.
- **Shadcn UI:** Leveraged for high-level components, integrated with a focus on keeping the codebase lean and avoiding unnecessary file pollution.
- **Lucide React:** A clean and modern icon set used throughout the application.
- **Framer Motion:** Powering smooth, interactive animations and transitions.
- **clsx & tailwind-merge:** Utilities for clean, conflict-free conditional class management.

## State & Data Management
- **TanStack Query (React Query):** Managing asynchronous state, caching, and data synchronization, even when working with local file-based data.
- **Node.js `fs` (File System):** Direct access to the local file system for persisting learning data in JSON or Markdown format.

## Forms & Validation
- **React Hook Form:** A performant and flexible library for managing form state and validation.
- **Zod:** Schema-based validation for form inputs and ensuring data integrity for our storage files.

## Utilities & Feedback
- **date-fns:** For simple and powerful date manipulation and formatting.
- **Sonner:** Providing elegant and customizable toast notifications for user feedback.
- **next-themes:** Enabling seamless support for light and dark modes.

## Testing
- **Vitest:** A fast and modern unit testing framework.
- **React Testing Library:** Focused on testing components from the user's perspective to ensure reliability and accessibility.
