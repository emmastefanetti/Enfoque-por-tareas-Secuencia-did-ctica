import { useState } from "react";
import { DidacticSequence, DidacticEvaluation } from "./types";
import { preloadedExamples } from "./preloadedExamples";
import { EvaluationReport } from "./components/EvaluationReport";
import { MentorChat } from "./components/MentorChat";
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Layers, 
  Play, 
  AlertCircle, 
  Coffee, 
  ChevronRight, 
  Edit3, 
  FileText,
  RotateCcw,
  CheckCircle,
  HelpCircle
} from "lucide-react";

export default function App() {
  const [inputMode, setInputMode] = useState<"structured" | "fulltext">("structured");
  const [formData, setFormData] = useState<DidacticSequence>({
    title: "",
    targetLevel: "Nivel 1a (Elemental 1a)",
    targetGroupDescription: "",
    objectives: "",
    contents: "",
    inputs: "",
    enablingTasks: "",
    finalTask: "",
    fullText: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<DidacticEvaluation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const ubaLevels = [
    "Nivel 1a (Elemental 1a)",
    "Nivel 1b (Elemental 1b)",
    "Nivel 2 (Elemental 2)",
    "Nivel 3 (Pre-Intermedio 1)",
    "Nivel 4 (Pre-Intermedio 2)",
    "Nivel 5 (Intermedio 1)",
    "Nivel 6 (Intermedio 2)",
    "Nivel 7 / Nivel 8 (Intermedio Alto)",
  ];

  const loadingSteps = [
    "Leyendo planificación didáctica...",
    "Revisando criterios curriculares de ELSE (UBA)...",
    "Evaluando el andamiaje del Enfoque por Tareas...",
    "Sondeando el potencial de los recursos de input...",
    "Redactando orientaciones pedagógicas de mejora..."
  ];

  const handleInputChange = (field: keyof DidacticSequence, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLoadExample = (example: DidacticSequence) => {
    setFormData({
      ...example,
      fullText: example.fullText || "",
    });
    setInputMode("structured");
    setEvaluation(null);
    setIsChatOpen(false);
    setError(null);
  };

  const handleReset = () => {
    setFormData({
      title: "",
      targetLevel: "Nivel 1a (Elemental 1a)",
      targetGroupDescription: "",
      objectives: "",
      contents: "",
      inputs: "",
      enablingTasks: "",
      finalTask: "",
      fullText: "",
    });
    setEvaluation(null);
    setIsChatOpen(false);
    setError(null);
  };

  const triggerLoadingAnimation = () => {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= loadingSteps.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return interval;
  };

  const handleSubmitEvaluation = async () => {
    setLoading(true);
    setError(null);
    setEvaluation(null);
    setIsChatOpen(false);
    const interval = triggerLoadingAnimation();

    try {
      const isStructured = inputMode === "structured";
      const payload = isStructured
        ? {
            title: formData.title,
            targetLevel: formData.targetLevel,
            targetGroupDescription: formData.targetGroupDescription,
            objectives: formData.objectives,
            contents: formData.contents,
            inputs: formData.inputs,
            enablingTasks: formData.enablingTasks,
            finalTask: formData.finalTask,
          }
        : {
            fullText: formData.fullText,
          };

      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Ocurrió un error inesperado al analizar la secuencia.");
      }

      const result = await response.json();
      setEvaluation(result);
      
      // Auto scroll down to evaluation results
      setTimeout(() => {
        document.getElementById("evaluation-report-view")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al conectar con el servidor evaluador de ELSE.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  // Chat request function
  const handleSendMentorMessage = async (message: string): Promise<string> => {
    const historyPayload = [
      {
        role: "model",
        text: `Hola, soy el especialista en ELSE.`,
      },
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: historyPayload,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo obtener la respuesta del especialista.");
    }

    const data = await response.json();
    return data.reply;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1C1C] antialiased py-8 px-4 md:px-12 font-serif border-8 border-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Institution Badge & App Title */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 border-b border-black/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-neutral-900 flex items-center justify-center text-white font-serif text-xl font-bold tracking-tight shadow-md select-none transform transition-transform hover:scale-105">
              UBA
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-sans font-bold text-gray-500">
                UBA | Facultad de Filosofía y Letras
              </span>
              <h1 className="text-2xl md:text-3xl font-light tracking-tight text-neutral-900 mt-1 italic flex items-center gap-2">
                Especialización en enseñanza de ELSE
                <GraduationCap className="w-5 h-5 text-neutral-800 shrink-0" />
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 font-sans">
            <div className="text-[10px] uppercase font-bold tracking-tighter text-gray-500">Herramienta de Evaluación</div>
            <div className="text-xs font-semibold text-neutral-700">Enfoque por Tareas (v4.2)</div>
          </div>
        </header>

        {/* Level Guides Quick Accordion */}
        <div className="bg-white/80 border border-black/10 rounded-sm p-6 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-2 mb-2 font-sans">
            <BookOpen className="w-4 h-4 text-neutral-800" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C1C1C]">Guía de Niveles ELSE & Tareas</span>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed italic">
            La secuencia didáctica debe organizarse metodológicamente según el <strong>Enfoque por Tareas</strong>. La tarea final debe ser una actividad de uso real de la lengua útil fuera del aula, apoyada de forma progresiva por tareas posibilitadoras. Los contenidos se evalúan según los lineamientos curriculares oficiales de la Facultad de Filosofía y Letras, UBA.
          </p>
        </div>

        {/* Workspace: Preloaded Examples Selector */}
        <section className="space-y-3 font-sans">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">
            Cargar Secuencia Curricular de Muestra (UBA)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {preloadedExamples.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadExample(item.sequence)}
                className="p-4 text-left bg-white/70 border border-black/10 hover:border-black hover:bg-white rounded-sm text-neutral-800 hover:text-neutral-900 transition-all cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="font-serif italic text-base leading-tight block mb-1">
                    "{item.sequence.title}"
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 block tracking-wider uppercase font-sans">
                    {item.sequence.targetLevel}
                  </span>
                </div>
                <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Probar secuencia</span>
                  <ChevronRight className="w-4 h-4 text-neutral-400" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Two Columns Input & Preview / Setup */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Inputs Frame */}
          <div className="lg:col-span-12 bg-[#F5F4F0] border border-black/5 rounded-sm p-6 sm:p-10 space-y-6">
            
            {/* Input Selection Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-black/10 gap-3">
              <div>
                <h3 className="font-serif italic text-xl text-neutral-950">
                  Planificación de la Secuencia Didáctica
                </h3>
                <p className="text-xs font-sans text-gray-500 tracking-wide uppercase mt-0.5">
                  Ingresá los datos estructurados o pegá la secuencia completa para su arbitraje.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex bg-neutral-200/50 p-0.5 rounded-sm border border-black/10 shrink-0 font-sans">
                <button
                  type="button"
                  onClick={() => setInputMode("structured")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    inputMode === "structured"
                      ? "bg-white text-neutral-950 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Por Campos
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("fulltext")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                    inputMode === "fulltext"
                      ? "bg-white text-neutral-950 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Texto Completo
                </button>
              </div>
            </div>

            {/* Mode 1: Fields Form */}
            {inputMode === "structured" ? (
              <div className="space-y-6">
                
                {/* Title & Level Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                      Título de la Propuesta Didáctica
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Ej: El colectivo porteño: relatos en movimiento"
                      className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                      Nivel UBA/ELSE Meta
                    </label>
                    <select
                      value={formData.targetLevel}
                      onChange={(e) => handleInputChange("targetLevel", e.target.value)}
                      className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors cursor-pointer"
                    >
                      {ubaLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Group description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans flex items-center justify-between">
                    <span>Grupo Meta (Intereses, Edad, Necesidades Comunicativas)</span>
                    <span className="text-[10px] italic font-serif text-gray-400 font-normal">Recomendado</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.targetGroupDescription}
                    onChange={(e) => handleInputChange("targetGroupDescription", e.target.value)}
                    placeholder="Ej: Alumnos brasileños de movilidad académica en la UBA. Necesitan expresarse informalmente, integrarse socialmente y conocer particularidades del español rioplatense..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

                {/* Communicative Objectives */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                    Objetivos Comunicativos
                  </label>
                  <textarea
                    rows={2}
                    value={formData.objectives}
                    onChange={(e) => handleInputChange("objectives", e.target.value)}
                    placeholder="Ej: Que los alumnos consigan narrar una anécdota y dar consejos culinarios de forma atenuada usando el condicional..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

                {/* Selection of grammar, lexis, culture */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                    Selección de Contenidos (Gramaticales, Léxicos, Culturales)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.contents}
                    onChange={(e) => handleInputChange("contents", e.target.value)}
                    placeholder="Ej: Contenidos gramaticales: Imperativo de tú/usted, se impersonal. Léxicos: Ingredientes y utensilios. Culturales: Variedad rioplatense (voseo)..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

                {/* Resources inputs */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                    Recursos que actúan como inputs (Audios, Textos, Videos)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.inputs}
                    onChange={(e) => handleInputChange("inputs", e.target.value)}
                    placeholder="Ej: Diálogo auténtico grabado de argentinos preparando matambre; mapa o plano de Buenos Aires; tarjetas de roles..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

                {/* Steps and Enabling tasks */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                    Tareas Posibilitadoras (Pasos y Secuencia de Aula)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.enablingTasks}
                    onChange={(e) => handleInputChange("enablingTasks", e.target.value)}
                    placeholder="Paso 1: Dinámica para activar vocabulario sobre comidas. Paso 2: Escuchar el diálogo auténtico y completar el cuadro de ingredientes. Paso 3: Foco en la forma analizando el voseo e imperativos..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

                {/* Final Task */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200/50 rounded-xs uppercase tracking-widest font-sans px-3 py-1 inline-block">
                    Tarea Final (Producto de Acción Comunicativa Real)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.finalTask}
                    onChange={(e) => handleInputChange("finalTask", e.target.value)}
                    placeholder="Ej: Los alumnos elaborarán en grupos una infografía ilustrada de una receta tradicional porteña negociada, que luego expondrán en clase para votar el postre favorito..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm px-4 py-2.5 text-sm font-sans transition-colors resize-y"
                  />
                </div>

              </div>
            ) : (
              // Mode 2: Full Text Block Paste
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">
                    Pegar Secuencia Didáctica Completa
                  </label>
                  <textarea
                    rows={16}
                    value={formData.fullText}
                    onChange={(e) => handleInputChange("fullText", e.target.value)}
                    placeholder="Pega aquí el plan de unidad completo, incluyendo objetivos, nivel meta de UBA, contenidos conceptuales, lecciones desglosadas, metodología de andamiaje y la tarea final..."
                    className="w-full bg-white border border-black/10 focus:border-black outline-none rounded-sm p-4 text-sm font-sans transition-colors resize-y"
                  />
                </div>
              </div>
            )}

            {/* Error Message Box */}
            {error && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-sm text-neutral-900 text-sm flex items-start gap-2.5 animate-bounce font-sans">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold flex items-center gap-1 uppercase tracking-wide text-xs">
                    Inconsistencia en la Planificación o Servidor
                  </span>
                  <p className="text-neutral-700 leading-normal">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Core Action Button Line */}
            <div className="flex items-center justify-between border-t border-black/10 pt-6 gap-3 flex-wrap font-sans">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 border border-black/20 hover:bg-white rounded-sm text-xs font-bold uppercase tracking-wider text-neutral-600 cursor-pointer transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpiar
              </button>

              <button
                type="button"
                onClick={handleSubmitEvaluation}
                disabled={loading || (inputMode === "structured" ? !formData.title.trim() && !formData.enablingTasks.trim() : !formData.fullText?.trim())}
                className="flex items-center gap-2 px-8 py-3 bg-neutral-900 hover:bg-neutral-950 text-xs font-bold tracking-widest uppercase text-white rounded-sm transition-all disabled:bg-neutral-200 disabled:text-neutral-400 cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                Evaluar Secuencia
                <Play className="w-3 h-3 text-neutral-300" />
              </button>
            </div>

          </div>

        </main>

        {/* Loading Overlay state */}
        {loading && (
          <div className="bg-neutral-900 text-white rounded-sm p-8 border border-black/10 shadow-md text-center space-y-6 mt-4">
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full border-2 border-neutral-700 border-t-white animate-spin"></div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-serif italic text-white">
                {loadingSteps[loadingStep]}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 max-w-sm mx-auto font-sans font-bold">
                Cátedra de Didáctica • Especialización en ELSE (UBA)
              </p>
            </div>

            <div className="max-w-xs mx-auto bg-white/10 h-[3px] overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-1000 ease-out"
                style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* RESULTS: Evaluation report (Full Width Below) */}
        {evaluation && (
          <div id="evaluation-report-view" className="space-y-6 pt-4">
            <div className="flex items-center gap-2 font-sans">
              <span className="w-2.5 h-2.5 bg-neutral-900 inline-block"></span>
              <h3 className="font-bold text-xs uppercase tracking-widest text-neutral-800">
                Resultado de la Evaluación Especializada
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Primary Report Component (8 of 12 cols / Full width depending of chat state) */}
              <div className={`${isChatOpen ? "lg:col-span-7" : "lg:col-span-12"} transition-all duration-300`}>
                <EvaluationReport 
                  evaluation={evaluation} 
                  onStartChatWithMentor={() => {
                    setIsChatOpen(true);
                    setTimeout(() => {
                      document.getElementById("specialist-mentor-panel")?.scrollIntoView({ behavior: "smooth" });
                    }, 100);
                  }}
                />
              </div>

              {/* Chat Mentoring Panel (5 of 12 cols) */}
              {isChatOpen && (
                <div id="specialist-mentor-panel" className="lg:col-span-5 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-800 font-sans flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Mentoría Pedagógica
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsChatOpen(false)}
                      className="text-xxs text-neutral-400 hover:text-neutral-700 underline cursor-pointer"
                    >
                      Ocultar tutor
                    </button>
                  </div>
                  
                  <MentorChat 
                    evaluationTitle={formData.title || "Secuencia didáctica del alumno"}
                    evaluationAchievement={evaluation.nivelDeLogro}
                    onSendMessage={handleSendMentorMessage}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* UBA Footer citation */}
        <footer className="pt-10 pb-6 border-t border-black/10 text-center text-[10px] text-gray-500 flex flex-col items-center gap-1.5 leading-relaxed">
          <p className="font-serif italic text-sm">
            Universidad de Buenos Aires — Carrera de Especialización en ELSE (Español como Lengua Segunda y Extranjera)
          </p>
          <p className="font-sans uppercase tracking-widest text-[9px] font-bold text-gray-400">
            Planificación basada en el Enfoque Orientado a la Acción (MCER) • 2026.
          </p>
        </footer>

      </div>
    </div>
  );
}
