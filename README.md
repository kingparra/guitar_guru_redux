# Guitar Scale Guru

An interactive, AI-powered learning tool for the modern 7-string guitarist. This application provides a "Fretboard Studio" for deep exploration of scales, including interactive diagrams, harmonic analysis, and AI-generated creative exercises.

![Fretboard Studio UI](./screenshots/studio-overview.png)

## Features In-Depth

### Interactive Fretboard Studio
The "Fretboard Studio" is the central hub of the application. It provides a seamless, integrated workspace for musical exploration without pop-ups or separate pages.

*   **Dynamic Scale Generation:** Generates diagrams and data for dozens of scales in any key on a 7-string, 24-fret guitar.
*   **Full Fretboard View:** Always see the entire neck to understand the context of patterns and positions.
*   **Interactive Piano & Notation:** Click a note on the fretboard, and see it instantly reflected on a full 88-key piano and in standard music notation.
*   **Audio Playback:** Hear any note you click, with an optional sustain mode for checking intervals and harmonies.

### Studio Modes: Layers of Insight
Activate different "Studio Modes" to overlay powerful, context-aware information directly onto the main fretboard diagram.

#### Anchor Note System
Click the "Anchor Note" button and then select any note on the fretboard. The app instantly reveals the harmonic function of that note within the current key, showing you which diatonic chords it belongs to and what its role is (root, third, fifth, etc.). Select a context to see the corresponding arpeggio highlighted.

![Anchor Note System](./screenshots/anchor-note.png)

#### Diagonal Run
Visualize a continuous, ergonomic path that traverses the entire fretboard, connecting every note of the scale. This feature helps break out of 'box' patterns and see the neck as a single, connected entity.

![Diagonal Run](./screenshots/diagonal-run.png)

#### Chord Inspector
Select any diatonic chord from the current key. The inspector highlights all of its chord tones across the neck. You can cycle through specific, playable voicings or view all available chord tones. The AI also provides an analysis of which notes from the parent scale can be used as tensions (e.g., 9ths, 13ths) over that chord.

![Chord Inspector](./screenshots/chord-inspector.png)

#### Scale Positions
Cycle through 5-7 standard, ergonomic fingering patterns ("positions" or "boxes") for the scale. Each position is displayed with clear fingering numbers, helping you master the scale all over the neck.

![Scale Positions](./screenshots/scale-positions.png)

#### AI Fretboard Assistant
Open a chat panel and talk directly to a music theory expert AI. Ask it to "show me a G major arpeggio," "label the scale degrees," or "create a simple melody using these three notes," and it will visualize the answer directly on the fretboard for you.

![AI Chat](./screenshots/ai-chat.png)

### AI-Generated Creative Exercises
Go beyond mechanical drills. The AI composes two unique, full-fretboard etudes for every scale, designed to be both musical and technically challenging.
*   **Diatonic Arpeggiation Etude:** Focuses on connecting scale positions using the notes of the underlying chords.
*   **Melodic Motif Etude:** Develops a short melodic idea and applies it systematically across the neck.
Both exercises come with interactive tablature, note playback, and speed controls.

![Creative Exercises](./screenshots/creative-exercises.png)

### Notation Analyzer
Have a piece of sheet music you want to improvise over? Upload a PDF or an image of the score. The AI will analyze the key signature, harmony, and melody to suggest the most appropriate scales to use, complete with theoretical justifications.

![Notation Analyzer](./screenshots/notation-analyzer.png)

### Comprehensive Resources & PDF Export
For each scale, the AI curates a list of relevant learning resources. When you're done, you can generate a clean, printable PDF "one-sheet" of the entire scale, including diagrams and resources, for offline practice.

![Resources and PDF Export](./screenshots/resources.png)

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
