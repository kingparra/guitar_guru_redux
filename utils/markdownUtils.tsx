import React from 'react';

export const renderMarkdownTable = (markdownString: string) => {
    if (!markdownString || !markdownString.includes('|')) return <p>{markdownString}</p>;
    try {
        const rows = markdownString.trim().split('\n');
        const headers = rows[0].split('|').map((h) => h.trim()).filter(Boolean);
        const body = rows.slice(2).map((row, rowIndex) => {
            const cells = row.split('|').map((c) => c.trim()).filter(Boolean);
            return <tr key={rowIndex} className="hover:bg-purple-500/10">{cells.map((cell, cellIndex) => <td key={cellIndex} className="py-2 px-4 border-b border-purple-400/20">{cell}</td>)}</tr>;
        });

        return (
            <div className="overflow-x-auto rounded-lg border border-purple-400/20 mt-2">
                <table className="w-full text-left">
                    <thead className="bg-[#0D0B1A]/70"><tr>{headers.map((header, index) => <th key={index} className="py-2 px-4 text-cyan-400 uppercase tracking-wider font-semibold text-sm border-b-2 border-purple-400/40">{header}</th>)}</tr></thead>
                    <tbody>{body}</tbody>
                </table>
            </div>
        );
    } catch (e) {
        console.error('Failed to parse markdown table:', e);
        return <pre className="whitespace-pre-wrap">{markdownString}</pre>;
    }
};