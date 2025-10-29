



import React, { useState, useRef, useEffect } from 'react';
import type {
    SongAnalysisResult,
    FontSizeKey,
    SectionKey,
    ScaleDetails,
    ClientData,
    AppCache,
    ClickedNote,
    DiagramNote,
    PathDiagramNote,
} from './types';
import { COLORS, FONT_SIZES } from './constants';
import { useScaleGenerator } from './hooks/useScaleGenerator';
import { useNotationAnalyzer } from './hooks/useNotationAnalyzer';
import { usePdfGenerator } from './hooks/usePdfGenerator';
import ControlPanel from './components/ControlPanel';
import NotationAnalyzer from './components/NotationAnalyzer';
import ScaleExplorer from './components/ScaleExplorer';
import PdfDocument from './components/PdfDocument';
import Footer from './components/common/Footer';
import { playNote, startSustainedNote, stopSustainedNote } from './utils/audioUtils';
// FIX: Import getOctaveForNote utility
import { getOctaveForNote } from './utils/musicUtils';

const sectionIds: Record<string, string> = {
    resources: 'section-resources',
    creativeExercises: 'section-creative-exercises',
};

const App: React.FC = () => {
    const [fontSize, setFontSize] = useState<FontSizeKey>('M');
    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.style.fontSize = FONT_SIZES[fontSize];
    }, [fontSize]);

    const [clientData, setClientData] = useState<ClientData | null>(null);
    const [highlightedNotes, setHighlightedNotes] = useState<string[]>([]);
    const [highlightedPitch, setHighlightedPitch] = useState<ClickedNote | null>(null);
    const [isAnalyzerVisible, setIsAnalyzerVisible] = useState(false);
    const [cache, setCache] = useState<AppCache>({});
    const [clickedNote, setClickedNote] = useState<ClickedNote | null>(null);
    const [isSustainOn, setIsSustainOn] = useState(false);
    const [isOctaveColorOn, setIsOctaveColorOn] = useState(false);

    // Tab Player State
    const [activePath, setActivePath] = useState<PathDiagramNote[] | null>(null);
    const [playbackIndex, setPlaybackIndex] = useState<number | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const isPlayingExercise = playbackIndex !== null;
    const playbackNote = isPlayingExercise && activePath ? activePath[playbackIndex] : null;

    const {
        rootNote,
        scaleName,
        setRootNote,
        setScaleName,
        loadingState,
        generate,
        generateSection,
    } = useScaleGenerator(setClientData, cache, setCache);
        
    const {
        analysisResults,
        isAnalyzing,
        error: analysisError,
        analyze,
        ...notationAnalyzerProps
    } = useNotationAnalyzer();

    const scaleDetails = React.useMemo(() => {
        if (!clientData) {
            return null;
        }

        const finalDetails: Partial<ScaleDetails> = {
            ...clientData,
        };

        (Object.keys(loadingState.sections) as SectionKey[]).forEach((key) => {
            const sectionState = loadingState.sections[key];
            if (sectionState.status === 'success' && sectionState.data) {
                finalDetails[key] = sectionState.data as any;
            }
        });

        return finalDetails as ScaleDetails;
    }, [clientData, loadingState.sections]);

    const { isSavingPdf, pdfError, generatePdf } = usePdfGenerator(
        pdfContentRef,
        scaleDetails,
        rootNote,
        scaleName
    );
    
    const handleStopExercise = () => {
        setActivePath(null);
        setPlaybackIndex(null);
    };

    const handlePlayExercise = (path: PathDiagramNote[]) => {
        if (isPlayingExercise) {
            handleStopExercise();
        } else {
            setActivePath(path);
            setPlaybackIndex(0);
        }
    };

    // Main playback loop for the creative exercise etude
    useEffect(() => {
        if (playbackIndex === null || !activePath) return;

        if (playbackIndex >= activePath.length) {
            handleStopExercise();
            return;
        }

        const noteToPlay = activePath[playbackIndex];
        if (noteToPlay.noteName) {
            const fret = typeof noteToPlay.fret === 'number' ? noteToPlay.fret : 0;
            const octave = getOctaveForNote(noteToPlay.string, fret);
            playNote(noteToPlay.noteName, octave, 600 / playbackSpeed / 1000);
        }

        const timer = setTimeout(() => {
            setPlaybackIndex(prev => (prev === null ? null : prev + 1));
        }, 600 / playbackSpeed);

        return () => clearTimeout(timer);
    }, [playbackIndex, activePath, playbackSpeed]);


    const handleGenerate = async (note: string, scale: string) => {
        handleStopExercise();
        setIsAnalyzerVisible(false);
        await generate(note, scale);
    };

    const handleGenerateSection = async (sectionKey: SectionKey) => {
        if (!clientData) return;
        await generateSection(sectionKey, { rootNote, scaleName, clientData });
    };

    const handleSustainToggle = () => {
        if (isSustainOn) {
            stopSustainedNote();
        }
        setIsSustainOn(!isSustainOn);
    };

    const handleOctaveColorToggle = () => {
        setIsOctaveColorOn(prev => !prev);
    };

    const handleChordHover = (notes: string[]) => {
        setHighlightedPitch(null);
        setHighlightedNotes(notes);
    };

    const handleNoteClick = (note: DiagramNote) => {
        if (!note.noteName) return; 
        
        handleStopExercise(); // Stop playback if user interacts with diagram
        const fret = typeof note.fret === 'number' ? note.fret : 0;
        const octave = getOctaveForNote(note.string, fret);
        const newClickedNote: ClickedNote = { noteName: note.noteName, octave };

        if (isSustainOn) {
            startSustainedNote(newClickedNote.noteName, newClickedNote.octave);
        } else {
            playNote(newClickedNote.noteName, newClickedNote.octave);
        }
        setClickedNote(newClickedNote);
        setHighlightedNotes([]);
        setHighlightedPitch(newClickedNote);
    };

    const handlePianoKeyClick = (noteName: string, octave: number) => {
        handleStopExercise(); // Stop playback
        const note = { noteName, octave };
        if (isSustainOn) {
            startSustainedNote(note.noteName, note.octave);
        } else {
            playNote(note.noteName, note.octave);
        }
        setClickedNote(note);
        setHighlightedNotes([]);
        setHighlightedPitch(note);
    };

    const handleGenerateFromAnalysis = (result: SongAnalysisResult) => {
        setRootNote(result.rootNote);
        setScaleName(result.scaleName);
        handleGenerate(result.rootNote, result.scaleName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const isBusy = loadingState.isActive || isAnalyzing || isSavingPdf;
    const isContentComplete = !!clientData;

    return (
        <div
            className="min-h-screen text-gray-200 font-['Poppins'] p-4 md:p-8"
            style={{
                background: `radial-gradient(ellipse at top, #2F2C58, ${COLORS.bgPrimary})`,
            }}
        >
            <div className="max-w-7xl mx-auto animate-fade-in">
                <header className="text-center mb-10">
                    <h1 className="text-5xl md:text-6xl font-bold mb-3 tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 drop-shadow-md">
                            Guitar Scale Guru
                        </span>
                    </h1>
                    <p
                        className="text-lg max-w-3xl mx-auto"
                        style={{ color: COLORS.textSecondary }}
                    >
                        An interactive, AI-powered learning tool for the modern
                        7-string guitarist.
                    </p>
                </header>

                <main className="flex-1 min-w-0">
                    <ControlPanel
                        rootNote={rootNote}
                        scaleName={scaleName}
                        setRootNote={setRootNote}
                        setScaleName={setScaleName}
                        onGenerate={() => handleGenerate(rootNote, scaleName)}
                        onSavePdf={generatePdf}
                        isLoading={isBusy}
                        isSavingPdf={isSavingPdf}
                        hasContent={isContentComplete}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        isAnalyzerVisible={isAnalyzerVisible}
                        onToggleAnalyzer={() => setIsAnalyzerVisible(!isAnalyzerVisible)}
                        sectionIds={sectionIds}
                    />
                     {(pdfError || analysisError) && (
                        <div className="mt-4 p-[2px] bg-gradient-to-br from-red-500/80 to-orange-500/80 rounded-2xl shadow-lg">
                            <div className="bg-[#171528]/80 backdrop-blur-lg p-6 rounded-[14px]">
                                <h3 className="font-bold text-lg mb-2 text-center text-red-300">
                                    An Error Occurred
                                </h3>
                                <pre className="text-left whitespace-pre-wrap bg-black/20 p-3 rounded-md text-sm">
                                    {pdfError || analysisError}
                                </pre>
                            </div>
                        </div>
                    )}


                    <div className="content-area space-y-8 mt-8">
                        {isAnalyzerVisible && (
                            <NotationAnalyzer
                                onAnalyze={analyze}
                                isAnalyzing={isAnalyzing}
                                results={analysisResults}
                                onGenerateFromAnalysis={handleGenerateFromAnalysis}
                                {...notationAnalyzerProps}
                            />
                        )}

                        <div id="scale-content">
                            <ScaleExplorer
                                loadingState={loadingState}
                                fontSize={fontSize}
                                onGenerateSection={handleGenerateSection}
                                rootNote={rootNote}
                                scaleName={scaleName}
                                clientData={clientData}
                                highlightedNotes={highlightedNotes}
                                highlightedPitch={highlightedPitch}
                                onChordHover={handleChordHover}
                                onNoteClick={handleNoteClick}
                                sectionIds={sectionIds}
                                clickedNote={clickedNote}
                                isSustainOn={isSustainOn}
                                onSustainToggle={handleSustainToggle}
                                onPianoKeyClick={handlePianoKeyClick}
                                // Tab Player Props
                                playbackNote={playbackNote}
                                activePath={activePath}
                                onPlayExercise={handlePlayExercise}
                                onStopExercise={handleStopExercise}
                                isPlayingExercise={isPlayingExercise}
                                playbackSpeed={playbackSpeed}
                                onPlaybackSpeedChange={setPlaybackSpeed}
                                isOctaveColorOn={isOctaveColorOn}
                                onOctaveColorToggle={handleOctaveColorToggle}
                            />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {isContentComplete && scaleDetails && (
                <PdfDocument
                    ref={pdfContentRef}
                    scaleDetails={scaleDetails}
                    fontSize={fontSize}
                    rootNote={rootNote}
                    scaleName={scaleName}
                />
            )}
        </div>
    );
};

export default App;