import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Bot, User, Sparkles, Zap, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import ScreenLayout from '../components/ScreenLayout';
import { useApp } from '../AppContext';
import { TRANSLATIONS } from '../constants';
import { Message } from '../types';
import { chatWithAI, FileData } from '../services/geminiService';
import Button from '../components/Button';
import { cn } from '../lib/utils';

export default function ChatbotScreen() {
  const { language } = useApp();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: t.botWelcome || 'Namaste! I am your Hasta-Shilpa AI guide. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Reset welcome message on language change
    setMessages([{ role: 'model', text: t.botWelcome || 'Namaste! I am your Hasta-Shilpa AI guide. How can I help you today?' }]);
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const data = base64.split(',')[1];
      setSelectedFile({
        data,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (text: string = input) => {
    if ((!text.trim() && !selectedFile) || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      text: text.trim(),
      file: selectedFile || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Store current file to send, then clear state
    const fileToSend = selectedFile;
    setInput('');
    setSelectedFile(null);
    setLoading(true);

    const response = await chatWithAI([...messages, userMessage], language, fileToSend);
    setMessages(prev => [...prev, { role: 'model', text: response || 'I apologize, but I am unable to process that at the moment. Please try again.' }]);
    setLoading(false);
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('speechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error("Speech Error:", event.error);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Recognition start error:", e);
      setIsListening(false);
    }
  };

  return (
    <ScreenLayout showNav={true} title={t.chatbot} className="bg-bamboo-ivory">
      <div className="flex flex-col h-[calc(100vh-180px)] px-4">
        {/* Chat Message Area */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-hide py-4">
          {messages.map((ms, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={cn(
                 "flex items-start gap-3 max-w-[90%] group",
                 ms.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
               )}
             >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xl transition-all duration-500",
                  ms.role === 'model' 
                    ? "bg-bamboo-dark text-bamboo-gold ring-1 ring-bamboo-gold/30" 
                    : "bg-white text-gray-400 border border-gray-100"
                )}>
                  {ms.role === 'model' ? <Bot size={18} strokeWidth={2.5} /> : <User size={18} />}
                </div>
                <div className={cn(
                   "p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                   ms.role === 'model' 
                    ? "bg-white text-bamboo-dark rounded-tl-none border border-bamboo-gold/5" 
                    : "bg-bamboo-dark text-white rounded-tr-none"
                )}>
                   {ms.file && (
                     <div className={cn(
                       "mb-3 p-3 rounded-2xl flex items-center gap-3",
                       ms.role === 'model' ? "bg-gray-50 border border-gray-100" : "bg-white/10"
                     )}>
                       <div className="w-8 h-8 bg-bamboo-gold/20 rounded-lg flex items-center justify-center text-bamboo-gold shrink-0">
                         {ms.file.mimeType.startsWith('image/') ? <ImageIcon size={16} /> : <FileText size={16} />}
                       </div>
                       <div className="min-w-0 flex-1">
                         <p className={cn("text-[10px] font-bold truncate", ms.role === 'user' ? "text-white" : "text-gray-900")}>{ms.file.name}</p>
                         <p className="text-[8px] opacity-60 uppercase">{ms.file.mimeType.split('/')[1]}</p>
                       </div>
                     </div>
                   )}
                   <div className="markdown-body">
                     <Markdown>{ms.text}</Markdown>
                   </div>
                </div>
             </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-4">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-10 h-10 rounded-2xl bg-bamboo-dark text-bamboo-gold flex items-center justify-center shadow-lg border border-bamboo-gold/20"
               >
                 <Bot size={18} strokeWidth={2.5} />
               </motion.div>
               <div className="h-10 w-24 bg-white rounded-3xl rounded-tl-none animate-pulse border border-gray-100 shadow-sm" />
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="premium-card p-4 !rounded-[2.5rem] mb-4">
          <div className="space-y-3">
            <AnimatePresence>
              {selectedFile && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-fit max-w-full"
                >
                  <div className="w-10 h-10 bg-bamboo-gold/10 rounded-xl flex items-center justify-center text-bamboo-gold shrink-0">
                    {selectedFile.mimeType.startsWith('image/') ? <ImageIcon size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold">{selectedFile.mimeType.split('/')[1]}</p>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center gap-2 bg-gray-50 rounded-[2rem] p-2 focus-within:ring-2 focus-within:ring-bamboo-gold/30 transition-all shadow-inner">
               <input 
                 type="file"
                 ref={fileInputRef}
                 onChange={handleFileChange}
                 className="hidden"
                 accept="image/*,application/pdf,.doc,.docx,.txt"
               />
               
               <div className="flex items-center gap-0.5 shrink-0">
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="p-3 text-gray-400 hover:text-bamboo-dark hover:bg-white rounded-full transition-all"
                   title="Attach file"
                 >
                   <Paperclip size={18} />
                 </button>
                 
                 <button 
                   onClick={toggleListening}
                   className={cn(
                     "p-3 rounded-full transition-all flex items-center justify-center",
                     isListening ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse" : "text-gray-400 hover:text-bamboo-dark hover:bg-white"
                   )}
                 >
                   {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                 </button>
               </div>

               <input 
                 type="text"
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                 placeholder={t.askAnything || "Ask for designs..."}
                 className="flex-1 bg-transparent border-none outline-none font-bold py-2.5 text-sm text-gray-700 placeholder:text-gray-400 pr-12"
               />

               <Button 
                 size="icon" 
                 className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 bg-bamboo-dark text-bamboo-gold shadow-md hover:scale-105 shrink-0"
                 onClick={() => handleSend()}
                 disabled={(!input.trim() && !selectedFile) || loading}
               >
                 <Send size={18} />
               </Button>
            </div>
            
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
               {[t.suggestDesigns, t.pricingHelp, 'Modern Furniture Ideas', 'Bamboo Durability'].map((q, i) => (
                 <button 
                   key={i} 
                   onClick={() => handleSend(q)}
                   className="text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-400 px-4 py-2.5 rounded-xl whitespace-nowrap hover:border-bamboo-gold hover:text-bamboo-gold transition-all shadow-sm"
                 >
                   {q}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </div>
    </ScreenLayout>
  );
}
