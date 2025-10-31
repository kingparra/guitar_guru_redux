/// <reference types="vitest" />
import React from 'react';
import { render } from '@testing-library/react';
import ScaleExplorer, { NAV_SECTION_TITLES } from '../../../components/ScaleExplorer';

// Minimal mocks for props used when clientData is null
const baseProps: any = {
  loadingState: {
    status: 'idle',
    sections: {},
    isActive: false,
  },
  onGenerateSection: () => {},
  clientData: null,
  onChordHover: () => {},
  clickedNote: undefined,
  isSustainOn: false,
  onSustainToggle: () => {},
  onPianoKeyClick: () => {},
  playbackNote: undefined,
  activePath: undefined,
  onPlayExercise: () => {},
  onStopExercise: () => {},
  isPlayingExercise: false,
  playbackSpeed: 1,
  onPlaybackSpeedChange: () => {},
  isOctaveColorOn: false,
  onOctaveColorToggle: () => {},
  sectionIds: {
    fretboard: 'section-fretboard',
    creativeExercises: 'section-creative-exercises',
    resources: 'section-resources',
  },
};

describe('ScaleExplorer (TDD: section discovery)', () => {
  test('exports NAV_SECTION_TITLES including fretboard', () => {
    expect(NAV_SECTION_TITLES).toHaveProperty('fretboard');
    expect(NAV_SECTION_TITLES.fretboard).toMatch(/Fretboard/i);
  });

  test('renders hidden Fretboard anchor with data-section-title when clientData is not present', () => {
    render(<ScaleExplorer {...baseProps} />);
    const anchor = document.getElementById(baseProps.sectionIds.fretboard);
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('data-section-title')).toBe('Fretboard Studio');
    expect(anchor?.getAttribute('style') || '').toContain('display: none');
  });
});
