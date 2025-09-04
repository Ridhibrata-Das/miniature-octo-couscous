"use client";
import { useState, useCallback } from 'react';
import CameraPreview from './components/CameraPreview';
import Chatbot from './components/Chatbot';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mic, Settings, Share2, Shield, Wifi } from 'lucide-react';

const TABS = [
  { label: "Voice/Camera AI" },
  { label: "Chatbot" }
];

// Helper function to create message components
const HumanMessage = ({ text }: { text: string }) => (
  <div className="flex gap-2 md:gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-offset-2 ring-offset-white ring-emerald-500/40">
      <AvatarImage src="/avatars/human.png" alt="Human" />
      <AvatarFallback>H</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1.5 md:space-y-2">
      <div className="flex items-center gap-1.5 md:gap-2">
        <p className="text-xs md:text-sm font-semibold text-zinc-900">You</p>
        <span className="text-[10px] md:text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-emerald-50 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

const GeminiMessage = ({ text }: { text: string }) => (
  <div className="flex gap-2 md:gap-3 items-start group animate-in slide-in-from-bottom-2">
    <Avatar className="h-7 w-7 md:h-8 md:w-8 bg-blue-600 ring-2 ring-offset-2 ring-offset-white ring-blue-500/40">
      <AvatarImage src="/avatars/gemini.png" alt="Gemini" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
    <div className="flex-1 space-y-1.5 md:space-y-2">
      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
        <p className="text-xs md:text-sm font-semibold text-zinc-900">Gemini</p>
        <Badge variant="secondary" className="h-4 md:h-5 text-[10px] md:text-xs bg-blue-50 text-blue-700 hover:bg-blue-50">AI Assistant</Badge>
        <span className="text-[10px] md:text-xs text-zinc-500">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="rounded-lg bg-white border border-zinc-200 px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm text-zinc-800 shadow-sm">
        {text}
      </div>
    </div>
  </div>
);

export default function BalaramAI() {
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState<{ type: 'human' | 'gemini', text: string }[]>([]);
  const [isConnected, setIsConnected] = useState(true);

  const handleTranscription = useCallback((transcription: string) => {
    setMessages(prev => [...prev, { type: 'gemini', text: transcription }]);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-2 md:px-4 py-2 md:py-4 flex flex-col gap-2 md:gap-4 flex-1">
        {/* Slider/Tab UI */}
        <div className="flex gap-2 mb-4">
          {TABS.map((t, idx) => (
            <Button
              key={t.label}
              variant={tab === idx ? "default" : "outline"}
              className={`rounded-full px-6 py-2 text-sm font-semibold ${tab === idx ? 'bg-blue-600 text-white' : ''}`}
              onClick={() => setTab(idx)}
            >
              {t.label}
            </Button>
          ))}
        </div>
        {/* Tab Content */}
        {tab === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full" style={{height: 'min(90vh, 480px)'}}>
              <CameraPreview onTranscription={handleTranscription} className="h-full w-full" />
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-zinc-600 mt-2">
              <Mic className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <p>Voice recognition is active</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Chatbot />
          </div>
        )}
      </div>
    </div>
  );
} 