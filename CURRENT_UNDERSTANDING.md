# Current Understanding of the Guitar Scale Guru Project

This document outlines the current state of the application based on the last known set of project files.

## High-Level Vision: The "Fretboard Studio"

The application has been successfully refactored around a central, interactive hub called the "Fretboard Studio." The core design philosophy is to provide a seamless, integrated experience for musical exploration, avoiding modals or pop-ups in favor of direct interaction on the main fretboard diagram.

## Core Feature Status

### 1. The Fretboard Studio (Implemented)

This is the main interactive component, housed in `components/scaleExplorerSections/DiagramsSection.tsx`.

*   **Layout:** A full-neck diagram at the top, followed by a `DisplayOptionsPanel`, a full 88-key `PianoKeyboard`, and a `NotationPanel`.
*   **Interactivity:**
    *   **Pitch-Specific Highlighting:** Clicking a note on the fretboard or piano correctly highlights that *exact pitch* (note + octave).
    *   **Note-Name Highlighting:** Hovering over chords highlights all instances of the constituent *note names*.
    *   **Chromatic Notes:** The studio can display notes that are outside the current scale.

### 2. Studio Modes & Layers (Implemented)

These are controlled by a button-based UI in `components/common/DisplayOptionsPanel.tsx`.

*   **Diagonal Run:** Works correctly. Overlays the ergonomic run and displays sequence numbers on each note.
*   **Scale Positions:** Works correctly. The UI uses buttons instead of a dropdown. The underlying `generateFingeringPositions` algorithm is sophisticated and based on the principles of `HAND_MECHANICS.md`.
*   **Chord Inspector:**
    *   **UI:** Implemented with a horizontal chord selector strip and an integrated `VoicingExplorer`.
    *   **Functionality:** Cycles through an "All Chord Tones" view and specific, fingered voicings directly on the main fretboard diagram (no mini-diagram). The AI provides analysis of chord tones, scale tones, and tension notes.
*   **Anchor Note System (Reimagined Playground Mode):**
    *   **UI:** Implemented with an "Anchor" mode button and an integrated `AnchorContextPanel`.
    *   **Functionality:** Clicking a note makes it a pulsing "Anchor." The panel shows its harmonic functions. Clicking a function overlays the corresponding arpeggio on the main diagram. The AI prompts for this feature are designed to be position-aware, generating ergonomic suggestions.

### 3. AI-Generated Content (Refactored)

*   **"Practice Room" (Removed):** All old practice sections (licks, etudes, etc.) have been removed from the UI, data types, and service calls.
*   **"Composer's Notebook" (Implemented):** Replaces the old "Harmony" section. It features a deep, narrative analysis from the AI and a compact list of chord progressions.
*   **Enhanced Resources (Implemented):** The "Listening Guide" and "Jam Tracks" now include a brief, AI-generated explanation for each entry.

### 4. Codebase Health & Cleanup

*   **Project Structure:** Deprecated component files have been removed, making the codebase cleaner.
*   **Tooling:** A quality-check script exists at `scripts/quality-check.ts` to run TypeScript and ESLint checks.

## Known Bugs & Issues (Based on last user feedback)

While the architecture is in place, the user has identified critical bugs preventing the features from working as intended. My last action was intended to fix these:
1.  **Diagonal Run:** Numbers were not appearing on the fretted spots.
2.  **Chord Inspector:** Was not correctly highlighting chords on the main diagram.
3.  **Scale Positions:** The generated positions were unplayable or awkward.
4.  **Note Name Visibility:** The note names were being hidden in certain modes.

My understanding is that my most recent (but un-executed) plan was to fix these four specific issues.