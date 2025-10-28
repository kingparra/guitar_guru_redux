
import React, { useState } from 'react';
import type { ChatPanelProps } from '../../types';

const ChatPanel: React.FC<ChatPanelProps> = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder for future AI chat functionality
        console.log("AI Chat Message:", message);
        setMessage('');
    };
    
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20">
            <form onSubmit={handleSubmit} className="flex items-center gap-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask the AI to change the diagram... (e.g., 'show me a G major arpeggio')"
                    className="flex-grow bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500"
                />
                <button
                    type="submit"
                    className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
