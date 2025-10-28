import React, { useState, useEffect } from 'react';
import Card from './Card';

const LOADING_MESSAGES = [
    'Contacting Gemini Pro...', 'Analyzing musical context...', 'Crafting harmonic insights...',
    'Generating practice materials...', 'Composing challenging etudes...', 'Finding relevant resources...',
    'Polishing tablature...', 'Almost there...',
];

interface SectionLoaderProps {
    title: string;
    status: 'loading' | 'error';
    error: string | null;
    onRetry: () => void;
    retryCount: number;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ title, status, error, onRetry, retryCount }) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: number | null = null;
        let messageTimer: number | null = null;
        let countdownTimer: number | null = null;

        if (status === 'loading') {
            setElapsedTime(0);
            setMessageIndex(0);
            timer = window.setInterval(() => setElapsedTime((prev) => prev + 0.1), 100);
            messageTimer = window.setInterval(() => setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length), 2000);
        } else if (status === 'error' && retryCount > 0) {
            const delay = Math.pow(2, Math.min(retryCount, 5)) * 1000;
            setCountdown(Math.ceil(delay / 1000));
            countdownTimer = window.setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownTimer) clearInterval(countdownTimer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
            if (messageTimer) clearInterval(messageTimer);
            if (countdownTimer) clearInterval(countdownTimer);
        };
    }, [status, retryCount]);

    const isError = status === 'error';
    const isRateLimited = countdown > 0;

    return (
        <Card className={isError ? 'border-red-500/50 shadow-red-500/10' : 'opacity-80'}>
            <div className="p-4 min-h-[150px] flex flex-col justify-between">
                <div><h3 className="text-xl font-bold text-gray-400">{title}</h3></div>
                <div className="flex-grow flex items-center justify-center">
                    {isError ? (
                        <div className="text-center">
                            <p className="text-red-400 font-semibold">{isRateLimited ? 'Too many requests' : 'Failed to load'}</p>
                            <p className="text-xs text-red-400/70 mt-1 max-w-xs truncate">{error}</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                            <p className="mt-3 text-sm text-gray-400 transition-opacity duration-500 h-5">{LOADING_MESSAGES[messageIndex]}</p>
                            <p className="mt-1 text-xs text-cyan-400/80 font-mono">{elapsedTime.toFixed(1)}s</p>
                        </div>
                    )}
                </div>
                <div className="h-8">
                    {isError && (
                        <button type="button" onClick={onRetry} disabled={isRateLimited} className="w-full bg-amber-500/80 hover:bg-amber-500 text-white font-bold py-1 px-4 rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                            {isRateLimited ? `Please wait ${countdown}s` : 'Retry'}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default SectionLoader;
