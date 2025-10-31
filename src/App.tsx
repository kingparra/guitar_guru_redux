import React, { useState, useRef, useEffect } from 'react';
import type { FontSizeKey } from './types';
import { COLORS, FONT_SIZES } from './constants';
import { AppContextProvider, useAppContext } from './contexts/AppContext';
import { TabPlayerProvider } from './hooks/useTabPlayer';
import ControlPanel from './components/ControlPanel';
import NotationAnalyzer from './components/NotationAnalyzer';
import ScaleExplorer from './components/ScaleExplorer';
import PdfDocument from './components/PdfDocument';
import Footer from './components/common/Footer';
import { useNotationAnalyzer } from './hooks/useNotationAnalyzer';
import { usePdfGenerator } from './hooks/usePdfGenerator';

const sectionIds: Record<string, string> = {
    resources: 'section-resources',
    creativeExercises: 'section-creative-exercises',
    fretboard: 'section-fretboard',
};

const AppContent: React.FC = () => {
    const [fontSize, setFontSize] = useState<FontSizeKey>('M');
    const pdfContentRef = useRef<HTMLDivElement>(null);
    const [isAnalyzerVisible, setIsAnalyzerVisible] = useState(false);
    
    const { 
        rootNote, scaleName, scaleData, loadingState,
        dispatch, generate 
    } = useAppContext();

    const {
        analysisResults, isAnalyzing, error: analysisError,
        analyze, ...notationAnalyzerProps
    } = useNotationAnalyzer();

    const { isSavingPdf, pdfError, generatePdf } = usePdfGenerator(
        pdfContentRef, scaleData, rootNote, scaleName
    );

    useEffect(() => {
        document.documentElement.style.fontSize = FONT_SIZES[fontSize];
    }, [fontSize]);

    const handleGenerate = async (note: string, scale: string) => {
        setIsAnalyzerVisible(false);
        await generate(note, scale);
    };

    const handleGenerateFromAnalysis = (result: { rootNote: string, scaleName: string }) => {
        dispatch({ type: 'SET_ROOT_NOTE', payload: result.rootNote });
        dispatch({ type: 'SET_SCALE_NAME', payload: result.scaleName });
        handleGenerate(result.rootNote, result.scaleName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const isBusy = loadingState.isActive || isAnalyzing || isSavingPdf;
    const isContentComplete = !!scaleData;

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
                    <p className="text-lg max-w-3xl mx-auto" style={{ color: COLORS.textSecondary }}>
                        An interactive, AI-powered learning tool for the modern 7-string guitarist.
                    </p>
                </header>

                <main className="flex-1 min-w-0">
                    <ControlPanel
                        onGenerate={handleGenerate}
                        onSavePdf={generatePdf}
                        isLoading={isBusy}
                        isSavingPdf={isSavingPdf}
                        hasContent={isContentComplete}
                        fontSize={fontSize}
                        setFontSize={setFontSize}
                        isAnalyzerVisible={isAnalyzerVisible}
                        onToggleAnalyzer={() => setIsAnalyzerVisible(!isAnalyzerVisible)}
                        sectionIds={sectionIds}
                        // Provide display titles to the nav component so it can build labels
                        navSections={{ creativeExercises: 'Creative Exercises', resources: 'Resources', fretboard: 'Fretboard Studio' }}
                    />
                    {(pdfError || analysisError) && (
                        <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 text-center">
                            <pre className="text-left whitespace-pre-wrap font-mono text-sm">
                                {pdfError || analysisError}
                            </pre>
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
                            <ScaleExplorer sectionIds={sectionIds} />
                        </div>
                    </div>
                </main>
                <Footer />
            </div>

            {isContentComplete && scaleData && (
                <PdfDocument
                    ref={pdfContentRef}
                    scaleData={scaleData}
                    fontSize={fontSize}
                    rootNote={rootNote}
                    scaleName={scaleName}
                />
            )}
        </div>
    );
};

const App: React.FC = () => (
    <AppContextProvider>
        <TabPlayerProvider>
            <AppContent />
        </TabPlayerProvider>
    </AppContextProvider>
);

export default App;