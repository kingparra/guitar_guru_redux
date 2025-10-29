

import React, { useState, useRef, useEffect } from 'react';
import type { DiagramNote, ScaleData, ClickedNote } from '../../types';
import * as geminiService from '../../services/geminiService';
import { SparklesIcon } from './Icons';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

interface ChatPanelProps {
    onVisualize: (notes: DiagramNote[]) => void;
    scaleData: ScaleData;
    clickedNote: ClickedNote | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onVisualize, scaleData, clickedNote }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { rootNote, scaleName } = scaleData;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await geminiService.getFretboardChatResponse(newMessages, scaleData, rootNote, scaleName, clickedNote);
            
            const aiMessage: ChatMessage = { role: 'model', text: response.text };
            setMessages(prev => [...prev, aiMessage]);

            if (response.visualization) {
                onVisualize(response.visualization);
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'An unknown error occurred.';
            const errorMessage: ChatMessage = { role: 'model', text: `Sorry, I encountered an error: ${error}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-black/20 p-4 rounded-lg border border-purple-400/20 animate-fade-in flex flex-col h-[400px]">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-3 text-gray-200 flex-shrink-0">
                <SparklesIcon />
                <span>AI Fretboard Assistant</span>
            </h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                {messages.length === 0 && (
                     <div className="flex justify-start">
                        <div className="max-w-lg md:max-w-2xl bg-gray-700/50 text-gray-200 p-3 rounded-lg">
                           Hi! I'm your AI guitar assistant. Ask me anything about the {rootNote} {scaleName} scale, or ask me to show you something on the fretboard!
                        </div>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg md:max-w-2xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500/80 text-white' : 'bg-gray-700/50 text-gray-200'}`}>
                           {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-700/50 text-gray-200 p-3 rounded-lg flex items-center gap-2">
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                             <span>Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'show me a G major arpeggio'"
                    disabled={isLoading}
                    className="flex-grow bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;