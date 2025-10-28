
import React from 'react';
import type {
    ScaleExplorerProps,
    PracticeMaterial,
    SectionKey,
    SectionState,
} from './types';
import Card from './components/common/Card';
import Section from './components/common/Section';
import { COLORS } from './constants';
import DiagramsSection from './components/scaleExplorerSections/DiagramsSection';
import SectionLoader from './components/common/SectionLoader';
import SectionPlaceholder from './components/common/SectionPlaceholder';
import KeyChordsSection from './components/practiceSections/KeyChordsSection';
import TabbedPracticeItemList from './components/practiceSections/TabbedPracticeItemList';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
    SparklesIcon,
    FireIcon,
    GlobeIcon,
} from './components/common/Icons';
import ResourceList from './components/scaleExplorerSections/ResourceList';

const WelcomeState = () => (
    <Card>
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">
                Welcome to Guitar Scale Guru!
            </h2>
            <p
                className="text-lg max-w-3xl mx-auto mb-6 text-center"
                style={{ color: COLORS.textSecondary }}
            >
                Select a root note and a scale, then click "Generate Materials"
                to begin.
            </p>
        </div>
    </Card>
);


interface SectionConfig {
    title: string;
    description: string;
    icon: React.ReactNode;
    component: (data: any, props?: any) => React.ReactNode;
    isList?: boolean;
}

const sectionConfig: Record<SectionKey, SectionConfig> = {
    listeningGuide: {
        title: 'Listening Guide',
        description: 'Discover songs that prominently feature this scale.',
        icon: <SpotifyIcon />,
        component: (data) => <ResourceList title="Listening Guide" items={data} icon={<SpotifyIcon />} />,
        isList: true,
    },
    youtubeTutorials: {
        title: 'YouTube Tutorials',
        description: 'Find high-quality video lessons and tutorials.',
        icon: <YouTubeIcon />,
        component: (data) => <ResourceList title="YouTube Tutorials" items={data} icon={<YouTubeIcon />} />,
        isList: true,
    },
    creativeApplication: {
        title: 'Creative Application',
        description: 'See how artists use this scale in solos and compositions.',
        icon: <LightbulbIcon />,
        component: (data) => <ResourceList title="Creative Application" items={data} icon={<LightbulbIcon />} />,
        isList: true,
    },
    jamTracks: {
        title: 'Jam Tracks',
        description: 'Practice improvising with high-quality backing tracks.',
        icon: <JamIcon />,
        component: (data) => <ResourceList title="Jam Tracks" items={data} icon={<JamIcon />} />,
        isList: true,
    },
    licks: {
        title: 'Classic Licks',
        description: 'Learn some classic licks and phrases that use this scale.',
        icon: <FireIcon />,
        component: (data: PracticeMaterial[]) => <TabbedPracticeItemList items={data} />,
        isList: true,
    },
    advancedHarmonization: {
        title: 'Advanced Harmonization',
        description: 'Explore advanced concepts like harmonizing in thirds and sixths.',
        icon: <FireIcon />,
        component: (data: PracticeMaterial[]) => <TabbedPracticeItemList items={data} />,
        isList: true,
    },
    etudes: {
        title: 'Comprehensive Etudes',
        description: 'Challenge yourself with full musical pieces designed to master the scale.',
        icon: <FireIcon />,
        component: (data: PracticeMaterial[]) => <TabbedPracticeItemList items={data} />,
        isList: true,
    },
};

const ScaleExplorer: React.FC<ScaleExplorerProps> = (props) => {
    const {
        loadingState,
        fontSize,
        onGenerateSection,
        rootNote,
        scaleName,
        clientData,
        highlightedNotes,
        highlightedPitch,
        onChordHover,
        onNoteClick,
        sectionIds,
        clickedNote,
        isSustainOn,
        onSustainToggle,
        onPianoKeyClick,
    } = props;
    
    if (!clientData) {
        // Use a more specific error check
        const firstError = Object.values(loadingState.sections).find((s: SectionState<any>) => s.status === 'error');
        if (loadingState.status === 'error' && firstError) {
             return <Card><p className="text-red-400 text-center p-4">{firstError.error}</p></Card>;
        }
        return <WelcomeState />;
    }

    const { sections, isActive } = loadingState;
    const { diagramData, keyChords } = clientData;

    const renderSection = (key: SectionKey) => {
        const config = sectionConfig[key];
        const state = sections[key];

        if (state.status === 'pending') {
            return (
                <SectionPlaceholder
                    title={config.title}
                    description={config.description}
                    icon={config.icon}
                    onGenerate={() => onGenerateSection(key)}
                    disabled={isActive}
                />
            );
        }
        if (state.status === 'loading' || state.status === 'error') {
            return (
                <SectionLoader
                    title={config.title}
                    status={state.status as 'loading' | 'error'}
                    error={state.error}
                    onRetry={() => onGenerateSection(key)}
                    retryCount={state.retryCount}
                />
            );
        }
        if (state.status === 'success') {
            if (config.isList && (!state.data || (Array.isArray(state.data) && state.data.length === 0))) {
                return null; // Don't show empty lists
            }
            if (state.data) {
                return config.component(state.data);
            }
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <DiagramsSection
                diagramData={diagramData}
                fontSize={fontSize}
                rootNote={rootNote}
                scaleName={scaleName}
                highlightedNotes={highlightedNotes}
                highlightedPitch={highlightedPitch}
                onNoteClick={onNoteClick}
                clientData={clientData}
                clickedNote={clickedNote}
                isSustainOn={isSustainOn}
                onSustainToggle={onSustainToggle}
                onPianoKeyClick={onPianoKeyClick}
            />

            <Section title="Core Theory & Harmony" icon={<SparklesIcon />} id={sectionIds.harmony}>
                <KeyChordsSection
                    keyChords={keyChords}
                    rootNote={rootNote}
                    scaleName={scaleName}
                    onChordHover={onChordHover}
                    onNoteClick={onNoteClick}
                />
            </Section>

            <Section title="Practice Room" icon={<FireIcon />} id={sectionIds.practice}>
                <div className="space-y-8">
                    {renderSection('licks')}
                    {renderSection('etudes')}
                    {renderSection('advancedHarmonization')}
                </div>
            </Section>

             <Section title="Resources" icon={<GlobeIcon />} id={sectionIds.resources}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {renderSection('listeningGuide')}
                    {renderSection('youtubeTutorials')}
                    {renderSection('creativeApplication')}
                    {renderSection('jamTracks')}
                </div>
            </Section>
        </div>
    );
};

export default ScaleExplorer;
