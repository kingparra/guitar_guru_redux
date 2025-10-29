# Hand Mechanics & Ergonomic Pathfinding

This document outlines the biomechanical principles that govern the "software agent" (`HandPositionModel.ts`) and logic within `src/services/FretboardService.ts` responsible for generating ergonomic fingerings and paths on the fretboard. The goal is to create fingerings that are not just technically correct, but also comfortable, efficient, and musically practical.

## Core Principles

The model is based on simplifying the complex movements of the fretting hand into a few core principles:

1.  **The "One Finger Per Fret" Axiom:** Within a stable hand position, the most efficient approach is to assign one finger to cover each fret. This minimizes unnecessary hand movement.
2.  **Positional Play is Primary:** Guitarists think in "positions" or "boxes." Large melodic leaps are achieved by shifting the entire hand position, not by large, inefficient stretches within a single position.
3.  **Conservation of Motion:** The most ergonomic path is the one that requires the least amount of total physical effort. This means minimizing:
    *   Large, rapid shifts up and down the neck.
    *   Awkward cross-string jumps.
    *   Unnecessary finger stretches and contortions.

## The `FretboardService`

This service contains the logic that acts as a virtual fretting hand. It uses a cost-based algorithm to make decisions, simulating how a real player would find the "path of least resistance."

### 1. Generating Fingering Positions (`generateFingeringPositions`)

The old method was too rigid. The new, more sophisticated algorithm works as follows:

1.  **Find Anchors:** The algorithm scans the two lowest strings (`B` and `E`) for notes. These often serve as the root or starting point for a scale position.
2.  **Evaluate Potential "Windows":** For each anchor note, it evaluates a potential 5-fret "window" where the hand could rest. It calculates which potential window contains the maximum number of scale notes. This ensures the hand is positioned in the most note-dense area.
3.  **Assign Fingers:** Once the optimal window is established, it applies the "One Finger Per Fret" axiom. The finger number is calculated based on its fret's offset from the start of the window (e.g., first fret of the window = 1st finger).
4.  **Validate Position:** A position is only considered valid if it covers at least 5 of the 7 strings and contains a sufficient number of notes. This filters out sparse or impractical fingerings.
5.  **Deduplicate & Sort:** The algorithm ensures it doesn't generate overlapping or duplicate positions and returns them sorted by their location on the neck.

This method results in 5-7 highly playable, comfortable, and musically standard fingering patterns for any given scale.

### 2. Generating the Diagonal Run (`generateDiagonalRun`)

This algorithm finds a single, continuous path connecting the scale from its lowest to highest note on the fretboard. It works by simulating a player's real-time decisions using the `HandPositionModel`.

1.  **Find a Phrase:** From its current location, the model first finds the longest possible "phrase" it can play on a single string without shifting its position. Fingers are assigned ergonomically within this phrase.
2.  **Evaluate Next Moves:** After playing a phrase, the model is at a decision point. It evaluates all possible next notes it could shift to:
    *   **Intra-String Shift (Slide):** Moving to a new note on the same string.
    *   **Inter-String Shift (Reposition):** Moving to a note on an adjacent string.
3.  **Calculate Ergonomic Cost:** Each potential move is assigned a "cost."
    *   Slides have a low base cost, plus a small penalty for distance.
    *   String crosses have a slightly higher base cost.
    *   Large, awkward jumps have a very high cost.
4.  **Choose the Path of Least Resistance:** The model chooses the move with the lowest cost. If it's a slide, the `shiftType` is marked accordingly for visual representation.
5.  **Repeat:** The process repeats: the model lands on the new note, finds the next playable phrase, evaluates the next shift, and so on, until it reaches the end of the fretboard.

This "greedy" algorithm, always choosing the locally optimal (lowest cost) move, produces a path that feels natural and efficient under the fingers, mimicking how an experienced player would navigate the fretboard.