import React, { useState, useRef, useEffect } from 'react';
import type {
    SongAnalysisResult,
    FontSizeKey,
    SectionKey,
    ScaleDetails,
    ClientData,
    AppCache,
    ClickedNote,
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
import PlaygroundModal from './components/common/PlaygroundModal';
import { playNote, startSustainedNote, stopSustainedNote } from './utils/audioUtils';

const sectionIds: Record<string, string> = {
    overview: 'section-overview',
    harmony: 'section-harmony',
    practice: 'section-practice',
    resources: 'section-resources',
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
    const [isPlaygroundMode, setIsPlaygroundMode] = useState(false);
    const [playgroundAnchorNote, setPlaygroundAnchorNote] = useState<ClickedNote | null>(null);

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
        scaleDetails
    );

    const handleGenerate = async (note: string, scale: string) => {
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

    const handleChordHover = (notes: string[]) => {
        setHighlightedPitch(null);
        setHighlightedNotes(notes);
    };

    const handleNoteClick = (note: ClickedNote) => {
        if (isPlaygroundMode) {
            setPlaygroundAnchorNote(note);
        } else {
            if (isSustainOn) {
                startSustainedNote(note.noteName, note.octave);
            } else {
                playNote(note.noteName, note.octave);
            }
            setClickedNote(note);
            setHighlightedNotes([]);
            setHighlightedPitch(note);
        }
    };

    const handlePianoKeyClick = (noteName: string, octave: number) => {
        const note = { noteName, octave };
        if (isSustainOn) {
            startSustainedNote(note.noteName, note.octave);
        } else {
            playNote(note.noteName, note.octave);
        }
        setClickedNote(note);
        setHighlightedPitch(null);
        setHighlightedNotes([note.noteName]);
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
                                isPlaygroundMode={isPlaygroundMode}
                                onPlaygroundModeChange={setIsPlaygroundMode}
                            />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {playgroundAnchorNote && isPlaygroundMode && (
                <PlaygroundModal
                    anchorNote={playgroundAnchorNote}
                    onClose={() => setPlaygroundAnchorNote(null)}
                    scaleContext={{ rootNote, scaleName }}
                />
            )}

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
