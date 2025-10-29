


import React from 'react';
import type {
    ScaleExplorerProps,
    SectionKey,
    SectionState,
    PathDiagramNote, // Import PathDiagramNote
} from '../types';
import Card from './common/Card';
import Section from './common/Section';
import { COLORS } from './../constants';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import SectionLoader from './common/SectionLoader';
import SectionPlaceholder from './common/SectionPlaceholder';
import {
    SpotifyIcon,
    YouTubeIcon,
    LightbulbIcon,
    JamIcon,
    SparklesIcon,
    GlobeIcon,
    DiagramsIcon,
    FireIcon,
} from './common/Icons';
import ResourceList from './scaleExplorerSections/ResourceList';
import NotationPanel from './common/NotationPanel';
import PianoKeyboard from './common/PianoKeyboard';
import CreativeExercisesSection from './scaleExplorerSections/CreativeExercisesSection';

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

const ScaleExplorer: React.FC<ScaleExplorerProps> = (props) => {
    const {
        loadingState,
        onGenerateSection,
        clientData,
        onChordHover,
        clickedNote,
        isSustainOn,
        onSustainToggle,
        onPianoKeyClick,
        playbackNote,
        activePath,
        onPlayExercise,
        onStopExercise,
        isPlayingExercise,
        playbackSpeed,
        onPlaybackSpeedChange,
    } = props;
    
    // Derived playback index from the playback note and active path
    const playbackIndex = React.useMemo(() => {
        if (!playbackNote || !activePath) return null;
        return activePath.findIndex(
            note => note.string === playbackNote.string && note.fret === playbackNote.fret
        );
    }, [playbackNote, activePath]);
    
    if (!clientData) {
        // FIX: Add type assertion to correctly type the result of Object.values on a mapped type.
        const firstError = (Object.values(loadingState.sections) as SectionState<any>[]).find(s => s.status === 'error');
        if (loadingState.status === 'error' && firstError) {
             return <Card><p className="text-red-400 text-center p-4">{firstError.error}</p></Card>;
        }
        return <WelcomeState />;
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
        arpeggioEtude: {
            title: 'Diatonic Arpeggiation Etude',
            description: 'A technical exercise to map out harmony within the scale.',
            icon: <FireIcon />,
            component: (data) => (
                <CreativeExercisesSection
                    exercise={data}
                    onPlayExercise={onPlayExercise}
                    onStopExercise={onStopExercise}
                    activePath={activePath}
                    playbackSpeed={playbackSpeed}
                    onPlaybackSpeedChange={onPlaybackSpeedChange}
                    playbackIndex={playbackIndex}
                />
            ),
        },
        motifEtude: {
            title: 'Melodic Motif Mutation Etude',
            description: 'A creative exercise in musical development.',
            icon: <SparklesIcon />,
            component: (data) => (
                <CreativeExercisesSection
                    exercise={data}
                    onPlayExercise={onPlayExercise}
                    onStopExercise={onStopExercise}
                    activePath={activePath}
                    playbackSpeed={playbackSpeed}
                    onPlaybackSpeedChange={onPlaybackSpeedChange}
                    playbackIndex={playbackIndex}
                />
            ),
        }
    };


    const { sections, isActive } = loadingState;

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
            <Section title="Fretboard Studio" icon={<DiagramsIcon />}>
                <DiagramsSection {...props} diagramData={clientData.diagramData} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <PianoKeyboard onKeyClick={onPianoKeyClick} clickedNote={clickedNote} playbackNote={playbackNote} />
                </div>
                <div className="lg:col-span-1">
                    <NotationPanel clickedNote={clickedNote} isSustainOn={isSustainOn} onSustainToggle={onSustainToggle} playbackNote={playbackNote} />
                </div>
            </div>

            <Section title="Creative Exercises" icon={<FireIcon />} id={props.sectionIds.creativeExercises}>
                <div className="space-y-8">
                    {renderSection('arpeggioEtude')}
                    {renderSection('motifEtude')}
                </div>
            </Section>

             <Section title="Resources" icon={<GlobeIcon />} id={props.sectionIds.resources}>
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
