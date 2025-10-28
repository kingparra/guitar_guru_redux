import React from 'react';

export const parseAndStyleMusicalText = (text: string): React.ReactNode => {
    if (!text || !text.includes('@@')) return text;

    return (
        <>
            {text.split('@@').map((part, index) =>
                index % 2 === 1 ? (
                    <span key={index} className="font-mono bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded-md mx-1">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </>
    );
};
