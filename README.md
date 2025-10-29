# Guitar Scale Guru

An interactive, AI-powered learning tool for the modern 7-string guitarist. This application provides a "Fretboard Studio" for deep exploration of scales, including interactive diagrams, harmonic analysis, and AI-generated creative exercises.

## Core Features

-   **Dynamic Scale Generation:** Generates diagrams and data for any standard scale in any key on a 7-string, 24-fret guitar.
-   **Interactive Fretboard Studio:** A central hub for visualizing scales, positions, chord voicings, and melodic paths.
-   **AI-Powered Content:** Utilizes the Gemini API to generate:
    -   Listening guides, tutorials, and jam tracks.
    -   Comprehensive, musical, and technically exhaustive creative etudes.
    -   Harmonic analysis of chords within the scale's context.
-   **Notation Analyzer:** Upload an image or PDF of sheet music, and the AI will identify the key and suggest relevant scales.
-   **Robust Fallback System:** Includes a procedural fallback generator that creates high-quality, systematic etudes for any scale if the AI is unavailable.
-   **PDF Export:** Save a complete-scale "one-sheet" for offline practice.

## Tech Stack

-   **Frontend:** React, TypeScript, Vite
-   **Styling:** TailwindCSS
-   **AI:** Google Gemini API (`@google/genai`)
-   **Testing:** Vitest, Testing Library
-   **Code Quality:** ESLint, TypeScript

---

## Project Structure

The codebase is organized with a strong emphasis on a "Functional Core, Imperative Shell" architecture:

-   **/src/services**: The "Functional Core." These modules contain all the core business logic of the application (music theory, harmony, fretboard ergonomics) as pure, testable functions.
-   **/src/hooks**: The "Imperative Shell." Custom React hooks that consume services and manage the application's state and side effects.
-   `/src/components`: Reusable UI components, designed to be as "dumb" as possible, receiving their data from hooks.
-   `/src/contexts`: React Context providers for global state management.
-   `/src/models`: Classes that model complex concepts, like the `HandPositionModel`.
-   `/src/types.ts`: A single source of truth for all TypeScript type definitions.
-   `/scripts`: Node scripts for internal tooling, such as the `quality-check.ts` script.

---

## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   `pnpm` (or `npm`/`yarn`)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd guitar-scale-guru
    ```

2.  Install dependencies:
    ```bash
    pnpm install
    ```

3.  Set up your Gemini API Key:
    -   Create a file named `.env` in the project root.
    -   Add your API key to this file:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```

### Running the Development Server

To start the Vite development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Quality Assurance

This project includes a comprehensive suite of tools to maintain code quality.

### Testing

The project uses **Vitest** for unit and integration testing of services and hooks.

-   **Run all tests once:**
    ```bash
    pnpm test
    ```

-   **Run tests in watch mode:**
    ```bash
    pnpm test:watch
    ```

-   **Run tests with UI:**
    ```bash
    pnpm test:ui
    ```

### Code Quality Script

A custom script runs all quality checks sequentially: TypeScript type checking, ESLint, and all tests. This is the recommended command to run before committing code.

```bash
pnpm quality
```

This script will exit with a non-zero code if any of the checks fail.