

import React, { useState, useRef, useEffect } from 'react';
import type { DiagramNote, ScaleData, ClickedNote } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { displayNotesOnFretboard, HAND_MECHANICS_CONTEXT } from '../../services/geminiService';
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
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom of chat messages
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Initialize or re-initialize the chat session when the scale context changes
    useEffect(() => {
        const initializeChat = async () => {
             if (!process.env.API_KEY) {
                console.error('API_KEY not found');
                return;
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const { rootNote, scaleName, diagramData } = scaleData;

             const systemInstruction = `You are Guitar Scale Guru, an expert music theorist, composer, and seasoned guitarist. You are chatting with a user who is viewing an interactive fretboard. Your primary goal is to answer their questions about music theory and help them visualize concepts on the fretboard. Your tone should be encouraging, knowledgeable, and practical, like a friendly mentor.

When a user asks you to show them something (e.g., 'show me an arpeggio', 'label the scale degrees'), you MUST use the \`displayNotesOnFretboard\` tool. You can specify custom text for each note using the 'displayText' property. For all other conversational questions, respond with helpful, insightful text.

CURRENT CONTEXT:
- The user is viewing the ${rootNote} ${scaleName} scale.
- The last note the user clicked on was: ${clickedNote ? `${clickedNote.noteName} at octave ${clickedNote.octave}` : 'None'}. Use this to provide specific suggestions.
- Here are some of the notes available in the current scale on the fretboard: ${JSON.stringify(diagramData.notesOnFretboard.slice(0, 30))}... and many more up the neck. Use this data to find valid string/fret locations for your visualizations.
- When a user asks for a "run", create a long, connected path of notes across the fretboard. Avoid small, single-position patterns. A good run moves both horizontally (across strings) and vertically (up the neck). For example, a "diagonal run" in our app looks like this (a small sample): ${JSON.stringify(diagramData.diagonalRun.slice(0, 5))}.

ERGONOMIC PRINCIPLES:
When giving advice on fingering or playing, keep these biomechanical principles in mind:
${HAND_MECHANICS_CONTEXT}`;

            const chat = ai.chats.create({
                model: 'gemini-2.5-pro',
                config: {
                    systemInstruction: systemInstruction,
                    tools: [{ functionDeclarations: [displayNotesOnFretboard] }],
                }
            });
            setChatSession(chat);
        };
        initializeChat();
    }, [scaleData, clickedNote]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chatSession) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const userInput = input;
        setInput('');
        setIsLoading(true);
        onVisualize([]); // Clear previous visualization

        try {
            const responseStream = await chatSession.sendMessageStream({ message: userInput });

            let responseText = '';
            for await (const chunk of responseStream) {
                responseText += chunk.text;
                const functionCalls = chunk.functionCalls;

                if (functionCalls && functionCalls.length > 0) {
                    const call = functionCalls[0];
                    if (call.name === 'displayNotesOnFretboard') {
                        const vizNotes = call.args.notes as DiagramNote[];
                        onVisualize(vizNotes);
                         if (!responseText.trim()) {
                            responseText = `Sure, here are the notes you asked for. I've highlighted them on the fretboard.`;
                        }
                    }
                }
            }
            const aiMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, aiMessage]);

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
            <div ref={messagesContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                {messages.length === 0 && (
                     <div className="flex justify-start">
                        <div className="max-w-lg md:max-w-2xl bg-gray-700/50 text-gray-200 p-3 rounded-lg">
                           Hi! Ask me anything about the {scaleData.rootNote} {scaleData.scaleName} scale, or ask me to show you something on the fretboard!
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
            </div>
            <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 'show me the scale degrees'"
                    disabled={isLoading || !chatSession}
                    className="flex-grow bg-[#171528]/80 border border-purple-400/30 rounded-md p-2 text-white font-semibold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-gray-500 disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={isLoading || !chatSession}
                    className="bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;