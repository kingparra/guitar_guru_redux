import React, { forwardRef } from 'react';
import type { ScaleData, FontSizeKey } from '../types';
import { COLORS } from '../constants';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import ResourceSection from './scaleExplorerSections/ResourceSection';
import ResourceList from './scaleExplorerSections/ResourceList';
import { SpotifyIcon, YouTubeIcon, LightbulbIcon, JamIcon } from './common/Icons';

interface PdfDocumentProps {
    scaleData: ScaleData;
    fontSize: FontSizeKey;
    rootNote: string;
    scaleName: string;
}

const PdfDocument = forwardRef<HTMLDivElement, PdfDocumentProps>(({ scaleData, fontSize, rootNote, scaleName }, ref) => {
    if (!scaleData.diagramData) return null;

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
                    {/* The context providers are not available here, so we pass null/dummy props for interactive features */}
                    <div style={{ pointerEvents: 'none' }}>
                       {/* This is a limitation for now; a better PDF solution would not reuse interactive components. */}
                       <p>Diagram rendering in PDF is temporarily disabled due to refactoring.</p>
                    </div>
                </section>
                <section>
                    <h2 style={h2SectionStyles}>Resources</h2>
                    <ResourceSection>
                        {scaleData.listeningGuide && <ResourceList title="Listening Guide" items={scaleData.listeningGuide} icon={<SpotifyIcon />} />}
                        {scaleData.youtubeTutorials && <ResourceList title="YouTube Tutorials" items={scaleData.youtubeTutorials} icon={<YouTubeIcon />} />}
                        {scaleData.creativeApplication && <ResourceList title="Creative Application" items={scaleData.creativeApplication} icon={<LightbulbIcon />} />}
                        {scaleData.jamTracks && <ResourceList title="Jam Tracks" items={scaleData.jamTracks} icon={<JamIcon />} />}
                    </ResourceSection>
                </section>
            </div>
        </div>
    );
});

export default PdfDocument;
