"use client";
import { useState, useRef, useEffect } from "react";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import TypingEffect from "@/components/TypingEffect";
import { postAPI, API } from "@/lib/api";

interface ChatMessage {
    role: string;
    text: string;
    isTyping?: boolean;
}

export default function MentorPage() {
    const [msg, setMsg] = useState("");
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat]);

    const enviar = async () => {
        if (!msg.trim() || loading) return;
        const userMessage = msg;
        const newChat = [...chat, { role: "user", text: userMessage }];
        setChat(newChat);
        setMsg("");
        setLoading(true);

        try {
            const res = await postAPI(API.MENTOR_CHAT, { message: userMessage, history: newChat });
            const data = await res.json();
            if (data.error) {
                setChat([...newChat, { role: "ai", text: `Lo siento, hubo un problema: ${data.error}. Por favor intenta de nuevo.`, isTyping: true }]);
            } else {
                setChat([...newChat, { role: "ai", text: data.response || "Error al generar respuesta", isTyping: true }]);
            }
        } catch {
            setChat([...newChat, { role: "ai", text: "Error de conexion. Intenta nuevamente.", isTyping: true }]);
        }
        setLoading(false);
    };

    const handleTypingComplete = (index: number) => {
        setChat(prev => prev.map((c, i) => i === index ? { ...c, isTyping: false } : c));
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20 flex-shrink-0">
                    <Image 
                        src="/robot-mascota.png" 
                        alt="Mentor IA" 
                        fill 
                        className="object-contain rounded-2xl"
                        priority
                    />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1e3a5f]">Mentor Pedagogico IC</h1>
                    <p className="text-gray-500 text-sm">Tu asistente experto en Decreto 67, DUA y Marco Curricular</p>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-y-auto space-y-4 mb-4">
                {chat.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <div className="relative w-32 h-32 mx-auto mb-6 opacity-80">
                            <Image 
                                src="/robot-mascota.png" 
                                alt="Mentor IA" 
                                fill 
                                className="object-contain"
                            />
                        </div>
                        <p className="text-lg font-medium text-[#1e3a5f]">Hola, soy tu Mentor IC</p>
                        <p className="text-sm mt-3">Preguntame sobre:</p>
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Decreto 67</span>
                            <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">Estrategias DUA</span>
                            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Marco Buena Ensenanza</span>
                            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">Evaluacion Formativa</span>
                        </div>
                    </div>
                )}
                {chat.map((c, i) => (
                    <div key={i} className={`flex ${c.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
                        {c.role === "ai" && (
                            <div className="relative w-10 h-10 flex-shrink-0">
                                <Image src="/robot-mascota.png" alt="AI" fill className="object-contain" />
                            </div>
                        )}
                        <div className={`p-4 rounded-2xl max-w-[75%] ${c.role === "user" ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-800"}`}>
                            {c.role === "ai" && c.isTyping ? (
                                <TypingEffect 
                                    text={c.text} 
                                    speed={10} 
                                    className="whitespace-pre-wrap text-sm leading-relaxed"
                                    onComplete={() => handleTypingComplete(i)}
                                />
                            ) : (
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{c.text}</p>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start gap-3">
                        <div className="relative w-10 h-10 flex-shrink-0">
                            <Image src="/robot-mascota.png" alt="AI" fill className="object-contain animate-bounce" />
                        </div>
                        <div className="bg-gray-100 p-4 rounded-2xl flex items-center gap-2 text-gray-500">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                            </div>
                            <span className="ml-2">Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="flex gap-3">
                <input
                    className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && enviar()}
                    placeholder="Escribe tu consulta pedagogica..."
                />
                <button 
                    onClick={enviar} 
                    disabled={loading} 
                    className="bg-[#d4a017] text-[#1e3a5f] px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c49516] transition-colors disabled:opacity-50"
                >
                    <PaperAirplaneIcon className="w-5 h-5" /> Enviar
                </button>
            </div>
        </div>
    );
}
