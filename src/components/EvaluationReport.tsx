import React, { useState } from "react";
import { DidacticEvaluation } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Award, CheckCircle2, ChevronRight, ChevronDown, Lightbulb, MessageSquare, Printer, Zap, BookOpen } from "lucide-react";

interface EvaluationReportProps {
  evaluation: DidacticEvaluation;
  onStartChatWithMentor?: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation,
  onStartChatWithMentor,
}) => {
  const [activeTab, setActiveTab] = useState<string>("meta");

  const badgeColors = {
    "No es adecuado": "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10",
    "Adecuado": "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10",
    "Muy adecuado": "bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/10",
    "Destacado": "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10",
  };

  const badgeGradients = {
    "No es adecuado": "from-rose-500 to-red-600",
    "Adecuado": "from-amber-400 to-orange-500",
    "Muy adecuado": "from-indigo-500 to-sky-600",
    "Destacado": "from-emerald-500 to-teal-600",
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 3) return "text-indigo-600 bg-indigo-50 border-indigo-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const criteria = [
    {
      id: "meta",
      name: "Grupo Meta",
      score: evaluation.adecuacionGrupoMeta.score,
      desc: "Nivel, intereses y necesidades comunicativas.",
      feedback: evaluation.adecuacionGrupoMeta.feedback,
    },
    {
      id: "objectives",
      name: "Objetivos Comunicativos",
      score: evaluation.pertinenciaObjetivos.score,
      desc: "Pertinencia, claridad y realismo comunicativo.",
      feedback: evaluation.pertinenciaObjetivos.feedback,
    },
    {
      id: "contents",
      name: "Contenidos UBA",
      score: evaluation.coherenciaContenidos.score,
      desc: "Coherencia de contenidos gramaticales, léxicos y culturales.",
      feedback: evaluation.coherenciaContenidos.feedback,
    },
    {
      id: "inputs",
      name: "Inputs / Recursos",
      score: evaluation.potencialInputs.score,
      desc: "Potencial comunicativo y autenticidad de los recursos.",
      feedback: evaluation.potencialInputs.feedback,
    },
    {
      id: "tasks",
      name: "Tareas Posibilitadoras",
      score: evaluation.articulacionTareas.score,
      desc: "Articulación y andamiaje enfocado en la Tarea Final.",
      feedback: evaluation.articulacionTareas.feedback,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="evaluation-pdf-report" className="bg-[#FAF9F6] border border-black/10 rounded-sm overflow-hidden print:border-none print:shadow-none animate-fadeIn">
      {/* Report Header */}
      <div className="p-8 bg-neutral-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans tracking-widest text-neutral-400 font-bold uppercase">
              UBA • Escuela de Posgrado
            </span>
          </div>
          <h2 className="text-[28px] font-light tracking-tight mt-1 text-white font-serif italic">
            Informe de Pertinencia Didáctica
          </h2>
          <p className="text-xs font-sans tracking-wide text-neutral-300 mt-1 max-w-xl uppercase">
            Cátedra de Didáctica • Especialización en ELSE
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end shrink-0 font-sans">
          <span className="text-[9px] font-bold tracking-widest text-neutral-400 uppercase">Resultado Final</span>
          <div className="mt-1 bg-white/10 px-4 py-2 rounded-sm border border-white/25">
            <span className="font-serif italic text-base text-white">
              {evaluation.nivelDeLogro}
            </span>
          </div>
        </div>
      </div>

      {/* Main Report Body */}
      <div className="p-8 space-y-8">
        
        {/* Rubrics Grid / Scorecards */}
        <div>
          <h3 className="text-[11px] font-bold tracking-widest uppercase text-neutral-500 font-sans mb-3 pb-1 border-b border-black/10">
            Escala de Logro y Rúbricas Curriculares
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {criteria.map((item, idx) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`p-4 text-left rounded-sm border transition-all relative cursor-pointer ${
                    isActive
                      ? "border-neutral-900 bg-[#EFEFEA] shadow-xs"
                      : "border-black/5 bg-[#F5F4F0] hover:border-black/20 hover:bg-[#EAE9E4]"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-xs font-sans font-bold text-neutral-800 leading-tight block">
                      0{idx + 1}. {item.name}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm border shrink-0 ${getScoreColor(item.score)}`}>
                      {item.score}/5
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                    <span>{isActive ? "Seleccionado" : "Analizar"}</span>
                    {isActive ? (
                      <ChevronDown className="w-3 h-3 text-neutral-800" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-neutral-300" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Criterion Detailed Feedback Panel */}
        <div className="bg-white border border-black/15 rounded-sm p-6 relative">
          <div className="absolute top-0 right-0 transform translate-y-[-50%] bg-[#FAF9F6] px-2 text-[10px] font-sans font-bold uppercase tracking-widest text-neutral-400">
            Dictamen por Criterio
          </div>
          {criteria.map((item, idx) => {
            if (activeTab !== item.id) return null;
            return (
              <div key={item.id} className="animate-fadeIn space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">0{idx + 1}.</span>
                    <h4 className="text-base font-serif italic font-medium text-neutral-900">
                      Análisis de {item.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="text-[10px] uppercase font-bold text-neutral-500">Puntaje Asignado:</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-200">
                      {item.score} / 5
                    </span>
                  </div>
                </div>
                <div className="text-sm text-neutral-800 leading-relaxed font-sans">
                  {item.feedback}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bento Layout: Strengths & Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Puntos Fuertes */}
          <div className="border border-black/10 bg-white rounded-sm p-6">
            <div className="flex items-center gap-2 border-b border-black/10 pb-3 mb-4">
              <CheckCircle2 className="w-4 h-4 text-neutral-800" />
              <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1C1C1C]">
                Fortalezas de la Propuesta
              </h4>
            </div>
            <ul className="space-y-3.5">
              {evaluation.puntosFuertes.map((str, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
                  <span className="text-neutral-900 font-bold shrink-0 mt-0.5">▪</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sugerencias de Mejora */}
          <div className="border border-black/10 bg-white rounded-sm p-6">
            <div className="flex items-center gap-2 border-b border-black/10 pb-3 mb-4">
              <Lightbulb className="w-4 h-4 text-neutral-800" />
              <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-[#1C1C1C]">
                Sugerencias de Optimización
              </h4>
            </div>
            <ul className="space-y-3.5">
              {evaluation.mejorasOrientaciones.map((opt, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-neutral-700 leading-relaxed">
                  <span className="text-neutral-500 font-bold shrink-0 mt-0.5">✦</span>
                  <span className="bg-yellow-100/60 px-1 rounded-xs inline-block">{opt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Global Summary Quotation */}
        <div className="rounded-sm border border-black/10 bg-[#FAF9F6] p-6 relative">
          <div className="flex items-center gap-2 mb-3 font-sans text-[10px] text-neutral-800 font-bold uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            Dictamen del Comité Evaluador
          </div>
          <p className="text-base text-neutral-800 italic font-serif leading-relaxed">
            &ldquo;{evaluation.comentariosGlobales}&rdquo;
          </p>
        </div>

        {/* Action Panel: Print and Ask specialized mentor */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2 print:hidden border-t border-black/10 mt-6 font-sans">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-transparent border border-black hover:bg-black hover:text-white text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            Exportar Devolución
          </button>
          
          {onStartChatWithMentor && (
            <button
              onClick={onStartChatWithMentor}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 border border-transparent text-white hover:bg-neutral-950 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Tutoría en Línea
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
