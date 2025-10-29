import React from 'react';
import type { SectionKey, SectionState, PathDiagramNote } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useTabPlayer } from '../hooks/useTabPlayer';
import { playNote, startSustainedNote, stopSustainedNote } from '../utils/audioUtils';
import Card from './common/Card';
import Section from './common/Section';
import { COLORS } from './../constants';
import DiagramsSection from './scaleExplorerSections/DiagramsSection';
import SectionLoader from './common/SectionLoader';
import SectionPlaceholder from './common/SectionPlaceholder';
import { SpotifyIcon, YouTubeIcon, LightbulbIcon, JamIcon, SparklesIcon, GlobeIcon, DiagramsIcon, FireIcon } from './common/Icons';
import ResourceList from './scaleExplorerSections/ResourceList';
import NotationPanel from './common/NotationPanel';
import PianoKeyboard from './common/PianoKeyboard';
import CreativeExercisesSection from './scaleExplorerSections/CreativeExercisesSection';

const WelcomeState = () => (
    <Card>
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">Welcome to Guitar Scale Guru!</h2>
            <p className="text-lg max-w-3xl mx-auto mb-6 text-center" style={{ color: COLORS.textSecondary }}>
                Select a root note and a scale, then click "Generate" to begin.
            </p>
        </div>
    </Card>
);

interface SectionConfig {
    title: string;
    description: string;
    icon: React.ReactNode;
    component: (data: any) => React.ReactNode;
    isList?: boolean;
}

const ScaleExplorer: React.FC<{ sectionIds: Record<string, string> }> = ({ sectionIds }) => {
    const {
        loadingState,
        scaleData,
        isSustainOn,
        dispatch,
        generateSection
    } = useAppContext();
    const { play, stop, activePath, playbackNote, isPlaying, playbackSpeed, setPlaybackSpeed } = useTabPlayer();


    const handleSustainToggle = () => {
        if (isSustainOn) stopSustainedNote();
        dispatch({ type: 'TOGGLE_SUSTAIN' });
    };

    const handlePlayExercise = (path: PathDiagramNote[]) => {
        if (activePath === path) {
            stop();
        } else {
            play(path);
        }
    };

    const handlePianoKeyClick = (noteName: string, octave: number) => {
        stop();
        const note = { noteName, octave };
        if (isSustainOn) {
            startSustainedNote(note.noteName, note.octave);
        } else {
            playNote(note.noteName, note.octave);
        }
        dispatch({ type: 'SET_CLICKED_NOTE', payload: note });
    };

    if (!scaleData) {
        const firstError = Object.values(loadingState.sections).find(s => s.status === 'error');
        if (loadingState.status === 'error' && firstError) {
            return <Card><p className="text-red-400 text-center p-4">{firstError.error}</p></Card>;
        }
        return <WelcomeState />;
    }

    const sectionConfig: Record<SectionKey, SectionConfig> = {
        listeningGuide: { title: 'Listening Guide', description: 'Discover songs that prominently feature this scale.', icon: <SpotifyIcon />, component: (data) => <ResourceList title="Listening Guide" items={data} icon={<SpotifyIcon />} />, isList: true },
        youtubeTutorials: { title: 'YouTube Tutorials', description: 'Find high-quality video lessons and tutorials.', icon: <YouTubeIcon />, component: (data) => <ResourceList title="YouTube Tutorials" items={data} icon={<YouTubeIcon />} />, isList: true },
        creativeApplication: { title: 'Creative Application', description: 'See how artists use this scale in solos and compositions.', icon: <LightbulbIcon />, component: (data) => <ResourceList title="Creative Application" items={data} icon={<LightbulbIcon />} />, isList: true },
        jamTracks: { title: 'Jam Tracks', description: 'Practice improvising with high-quality backing tracks.', icon: <JamIcon />, component: (data) => <ResourceList title="Jam Tracks" items={data} icon={<JamIcon />} />, isList: true },
        arpeggioEtude: { title: 'Diatonic Arpeggiation Etude', description: 'A technical exercise to map out harmony within the scale.', icon: <FireIcon />, component: (data) => <CreativeExercisesSection exercise={data} onPlayExercise={handlePlayExercise} onStopExercise={stop} activePath={activePath} playbackSpeed={playbackSpeed} onPlaybackSpeedChange={setPlaybackSpeed} isPlaying={isPlaying && activePath === data.path} playbackNote={playbackNote}/> },
        motifEtude: { title: 'Melodic Motif Etude', description: 'A creative exercise in musical development.', icon: <SparklesIcon />, component: (data) => <CreativeExercisesSection exercise={data} onPlayExercise={handlePlayExercise} onStopExercise={stop} activePath={activePath} playbackSpeed={playbackSpeed} onPlaybackSpeedChange={setPlaybackSpeed} isPlaying={isPlaying && activePath === data.path} playbackNote={playbackNote} /> }
    };

    const renderSection = (key: SectionKey) => {
        const config = sectionConfig[key];
        const state = loadingState.sections[key];
        const data = scaleData[key as keyof typeof scaleData];

        // Use cached data immediately if available, even if status is pending
        if (data) {
             if (config.isList && (!data || (Array.isArray(data) && data.length === 0))) return null;
             return config.component(data);
        }

        if (state.status === 'pending') {
            return <SectionPlaceholder title={config.title} description={config.description} icon={config.icon} onGenerate={() => generateSection(key)} disabled={loadingState.isActive} />;
        }
        if (state.status === 'loading' || state.status === 'error') {
            return <SectionLoader title={config.title} status={state.status} error={state.error} onRetry={() => generateSection(key)} retryCount={state.retryCount} />;
        }
        return null;
    };

    return (
        <div className="space-y-8">
            <Section title="Fretboard Studio" icon={<DiagramsIcon />}>
                <DiagramsSection scaleData={scaleData} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <PianoKeyboard onKeyClick={handlePianoKeyClick} />
                </div>
                <div className="lg:col-span-1">
                    <NotationPanel onSustainToggle={handleSustainToggle} />
                </div>
            </div>

            <Section title="Creative Exercises" icon={<FireIcon />} id={sectionIds.creativeExercises}>
                <div className="space-y-8">
                    {renderSection('arpeggioEtude')}
                    {renderSection('motifEtude')}
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