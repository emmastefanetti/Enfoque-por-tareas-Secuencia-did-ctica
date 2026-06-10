import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, GraduationCap, RefreshCw, AlertCircle, HelpCircle } from "lucide-react";

interface MentorChatProps {
  evaluationTitle: string;
  evaluationAchievement: string;
  onSendMessage: (message: string) => Promise<string>;
}

export const MentorChat: React.FC<MentorChatProps> = ({
  evaluationTitle,
  evaluationAchievement,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting
  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "model",
        text: `¡Hola! Soy tu Mentor y Jurado Especialista en ELSE de la UBA. 

He revisado tu propuesta **"${evaluationTitle || "Secuencia didáctica"}"**, calificada como **"${evaluationAchievement}"**. 

Es un excelente esfuerzo pedagógico de posgrado. ¿Tienes alguna duda sobre la devolución? Por ejemplo, puedes preguntarme:
- *¿Cómo puedo estructurar mejor las tareas posibilitadoras?*
- *¿Qué dinámicas de autoevaluación recomiendas integrar?*
- *¿La selección de contenidos gramaticales se ajusta verdaderamente al nivel propuesto?*

¡Escribime y lo conversamos!`,
        timestamp: new Date(),
      },
    ]);
  }, [evaluationTitle, evaluationAchievement]);

  // Scroll to bottom on updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Map history to server payload format
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await onSendMessage(query);
      
      const modelMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "model",
        text: reply,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error(err);
      setError("No se pudo obtener una respuesta del mentor. Verifica tu conexión de red o la clave de API.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="bg-[#FAF9F6] border border-black/10 rounded-sm overflow-hidden flex flex-col h-[520px] shadow-xs">
      {/* Mentor Header */}
      <div className="bg-neutral-900 border-b border-black/10 p-4 text-white flex items-center justify-between shrink-0 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-white/10 border border-white/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-neutral-200" />
          </div>
          <div>
            <div className="font-bold text-[9px] tracking-widest uppercase text-neutral-400">
              ASESORÍA PEDAGÓGICA ELSE
            </div>
            <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight">
              Tutor de Cátedra (Jurado)
              <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block animate-pulse"></span>
            </h3>
          </div>
        </div>
        <div className="text-[10px] tracking-wider text-neutral-400 max-w-[150px] text-right truncate italic font-serif">
          {evaluationTitle || "Secuencia didáctica"}
        </div>
      </div>

      {/* Quick suggestions or Questions container */}
      <div className="bg-[#EFEFEA] px-4 py-2 border-b border-black/10 flex items-center gap-2 overflow-x-auto overflow-y-hidden select-none shrink-0 scrollbar-none font-sans">
        <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3.5 h-3.5" /> Consultas:
        </span>
        {[
          "¿Cómo puedo mejorar la tarea final?",
          "¿Se adecua la gramática al nivel de la UBA?",
          "Sugerencias de dinámicas grupales",
          "¿Qué inputs auténticos me recomiendas?"
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickQuestion(q)}
            className="text-[10px] font-medium shrink-0 bg-white border border-black/10 text-neutral-700 hover:border-black px-2.5 py-1 rounded-sm transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="p-4 overflow-y-auto flex-1 space-y-4 bg-[#F5F4F0]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] rounded-sm px-4 py-3 text-xs ${
                  isUser
                    ? "bg-neutral-900 border border-neutral-900 text-white rounded-br-none"
                    : "bg-white border border-black/10 text-neutral-800 rounded-bl-none shadow-xxs"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>
                <div
                  className={`text-[9px] mt-1.5 font-mono tracking-wide ${
                    isUser ? "text-neutral-400 text-right" : "text-neutral-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-black/10 rounded-sm rounded-bl-none px-4 py-3 shadow-xxs flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-neutral-800 animate-spin" />
              <span className="text-[10px] font-sans font-bold text-[#1C1C1C] uppercase tracking-widest">El Investigador está redactando...</span>
            </div>
          </div>
        )}

        {/* Error block */}
        {error && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-sm text-neutral-950 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 text-orange-600 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider text-[9px] font-sans">Error de Tutoría</p>
              <p className="mt-0.5 text-neutral-700">{error}</p>
            </div>
          </div>
        )}

        {/* Anchor for scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSubmit} className="border-t border-black/10 p-3 flex gap-2 items-center bg-white shrink-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribí aquí tu consulta académica..."
          disabled={loading}
          className="flex-1 bg-white border border-black/15 focus:border-black outline-none rounded-sm px-3 py-2 text-xs disabled:bg-neutral-100 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="p-2.5 bg-neutral-900 border border-transparent text-white rounded-sm hover:bg-neutral-950 transition-colors cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
