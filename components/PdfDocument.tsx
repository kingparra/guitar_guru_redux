

import React, { forwardRef } from 'react';
import type { ScaleDetails, FontSizeKey } from '../types';
import { COLORS } from '../constants';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import ResourceList from './scaleExplorerSections/ResourceList';
import { SpotifyIcon, YouTubeIcon, LightbulbIcon, JamIcon } from './common/Icons';

interface PdfDocumentProps {
    scaleDetails: ScaleDetails;
    fontSize: FontSizeKey;
    rootNote: string;
    scaleName: string;
}

const PdfDocument = forwardRef<HTMLDivElement, PdfDocumentProps>(({ scaleDetails, fontSize, rootNote, scaleName }, ref) => {
    if (!scaleDetails.diagramData) return null;

    const wrapperStyles: React.CSSProperties = {
        position: 'absolute', left: '-9999px', top: 0, width: '1024px',
        backgroundColor: COLORS.bgPrimary, color: COLORS.textPrimary, padding: '20px',
        fontFamily: 'Poppins, sans-serif', zIndex: -1,
    };
    const h1Styles: React.CSSProperties = {
        fontSize: '32px', fontWeight: 700, margin: 0,
        background: `linear-gradient(to right, ${COLORS.accentCyan}, ${COLORS.accentMagenta})`,
        WebkitBackgroundClip: 'text', color: 'transparent',
    };
    const h2SectionStyles: React.CSSProperties = {
        fontSize: '28px', fontWeight: 600, marginBottom: '16px', paddingLeft: '12px',
        borderLeft: `4px solid ${COLORS.accentMagenta}`, color: COLORS.textPrimary,
    };

    return (
        <div ref={ref} style={wrapperStyles}>
            <header style={{ textAlign: 'center', padding: '20px', borderBottom: `1px solid ${COLORS.grid}`, marginBottom: '20px' }}>
                <h1 style={h1Styles}>Guitar Scale Guru</h1>
                <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '8px 0 0 0', color: COLORS.textPrimary }}>
                    {rootNote} {scaleName}
                </h2>
            </header>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <section>
                    <h2 style={h2SectionStyles}>Diagrams</h2>
                    <DiagramsSection
                        diagramData={scaleDetails.diagramData}
                        fontSize={fontSize}
                        rootNote={rootNote}
                        scaleName={scaleName}
                        highlightedNotes={[]}
                        highlightedPitch={null}
                        onNoteClick={() => {}}
                        clientData={scaleDetails as any}
                        clickedNote={null}
                        isSustainOn={false}
                        onSustainToggle={() => {}}
                        onPianoKeyClick={() => {}}
                        // FIX: Add missing props required by DiagramsSectionProps.
                        // For a static PDF, these interactive playback states are not relevant and can be set to null.
                        playbackNote={null}
                        activePath={null}
                    />
                </section>
                <section>
                    <h2 style={h2SectionStyles}>Resources</h2>
                    <ResourceSection>
                        {scaleDetails.listeningGuide && <ResourceList title="Listening Guide" items={scaleDetails.listeningGuide} icon={<SpotifyIcon />} />}
                        {scaleDetails.youtubeTutorials && <ResourceList title="YouTube Tutorials" items={scaleDetails.youtubeTutorials} icon={<YouTubeIcon />} />}
                        {scaleDetails.creativeApplication && <ResourceList title="Creative Application" items={scaleDetails.creativeApplication} icon={<LightbulbIcon />} />}
                        {scaleDetails.jamTracks && <ResourceList title="Jam Tracks" items={scaleDetails.jamTracks} icon={<JamIcon />} />}
                    </ResourceSection>
                </section>
            </div>
        </div>
    );
});

export default PdfDocument;
