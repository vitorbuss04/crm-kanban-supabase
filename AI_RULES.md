# AI Development Rules

This document outlines the rules and conventions for the AI assistant to follow when developing this application. The goal is to maintain code consistency, simplicity, and adhere to the established technology stack.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES Modules). This project does not use frameworks like React, Vue, or Svelte.
- **Backend & Database**: Supabase is the single source of truth for all data persistence.
- **Build Tool**: Vite is used for the development server and building the project.
- **Styling**: Plain, modern CSS using variables defined in `style.css`. No CSS frameworks (e.g., Tailwind, Bootstrap) are used.
- **HTML**: A single `index.html` file serves as the application's entry point.
- **State Management**: Application state is managed through simple, module-level variables within `main.js`.
- **Icons**: Inline SVGs are used for all icons to ensure performance and simplicity.

## Library and Framework Usage Rules

### General
- **Keep it Vanilla**: The core principle is to use vanilla web technologies (HTML, CSS, JS) whenever possible. Do not introduce new frameworks or large libraries.
- **Dependencies**: Before adding any new npm dependency, confirm if the functionality can be achieved with existing tools or plain JavaScript.

### Specific Rules
- **UI Components**: All UI components (cards, modals, buttons) must be created and manipulated using plain JavaScript and the standard DOM API. Do not introduce any UI component libraries.
- **Styling**: All styles must be written in `style.css`. Adhere to the existing conventions and use the defined CSS variables. Do not add utility class frameworks like Tailwind CSS.
- **Data Fetching**: All interactions with the database must go through the official `@supabase/supabase-js` client instance already configured in `main.js`.
- **State Management**: Continue managing the application state with the `clients` array in `main.js`. Avoid introducing complex state management patterns or libraries.
- **Icons**: When adding new icons, use inline SVGs, following the existing pattern in `index.html` and `main.js`. Do not install icon libraries.
- **Modals & Alerts**: Use the existing `showAlert`, `showConfirm`, and `toggleModal` functions for any user notifications, confirmations, or forms.