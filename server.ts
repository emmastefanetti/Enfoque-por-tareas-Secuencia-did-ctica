import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error(
      "La clave de API de Gemini (GEMINI_API_KEY) no está configurada o contiene el marcador de posición predeterminado. Por favor, añádela en la barra de Ajustes > Secrets (Settings > Secrets) de AI Studio."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// UBA ELSE Curriculum content references for Gemini to ground its analysis
const ELSE_CURRICULUM_PROMPT = `
REQUISITOS DEL PLAN PLANIFICADO (UBA - Especialización en enseñanza de ELSE):
1. Niveles ELSE de la Universidad de Buenos Aires (UBA):
- elemental 1a (Nivel 1a): Identificar información personal (nombre, nacionalidad, dirección). Saludos, números, hora. Presente de indicativo regular e irregulares básicos (ser, llamarse, tener, vivir, querer, almorzar, dormir, volver, venir, poder, gustar). Perífrasis "voy a + infinitivo" para planes, "estar + gerundio" para acciones en desarrollo.
- elemental 1b (Nivel 1b): Planificar con amigos, describir ubicación de personas/objetos/lugares. Gustos y preferencias. Pretérito perfecto simple de indicativo (verbos regulares y algunos irregulares como ir/ser) para hablar del pasado reciente.
- elemental 2 (Nivel 2): Intercambiar información en transacciones cotidianas (alquiler, reserva). Contar historias simples (personas, lugares, costumbres) usando Pretérito imperfecto de indicativo. Imperativo afirmativo y negativo.
- pre-intermedio 1 (Nivel 3): Historias de vida, dar instrucciones prácticas complejas, planes futuros con condicional de cortesía y futuro simple. Pronombres átonos OD/OI. Pretérito perfecto e imperfecto combinados en relato.
- pre-intermedio 2 (Nivel 4): Narrar con variedad temporal en pasado. Expresar sentimientos con subjuntivo presente (Me molesta que + subjuntivo), peticiones u órdenes con subjuntivo de recomendación (Te sugiero que vengas) y finalidad (para que + subjuntivo). Duda y probabilidad con subjuntivo (Es probable que...).
- intermedio 1 (Nivel 5): Comentar actualidad, emociones, hipótesis complejas en pasado (Condicionales II tipo: "Si yo fuera... sería..." y III tipo: "Si hubiera tenido..."). Pretérito imperfecto y pluscuamperfecto de subjuntivo. Argumentar con conectores concesivos (aunque con indicativo/subjuntivo).
- intermedio 2 (Nivel 6): Defender opiniones formal/informal de temas polémicos, debate, voz pasiva auténtica (ser + participio y estar + participio / pasiva con se), relativo con preposición antecedente, locuciones prepositivas que exigen subjuntivo (sin que, con tal de que, por más que).
- Nivel 7 / Nivel 8: Comprensión de implícitos, dobles sentidos, variedades dialectales (especialmente rioplatense vs peninsular), clíticos duplicación facultativa y obligatoria, régimen preposicional complejo, estilo indirecto avanzado, figuras literarias en discurso.

2. Enfoque por Tareas (Sonsoles Fernández, Javier Zanón, Sheila Estaire):
- Un ejercicio NO es una tarea. Una tarea está centrada en el significado, tiene una motivación real y termina en un producto comunicativo verosímil y utilizable fuera de la clase (tarea final).
- Estructura:
  a) Motivación / Punto de Partida: Activar la curiosidad, intereses y conocimientos previos.
  b) Tarea Final: Producto claro e interactivo (ej. agenda, álbum de cine, manual de turismo, debate, receta colaborativa).
  c) Tareas Posibilitadoras ("pasos intermedios"): Actividades graduadas que guían el aprendizaje de la lengua en su dimensión lingüística (estructuras, léxico) y comunicativa (comprensión, interacción).
  d) Atención a la forma: Práctica gramatical o de pronunciación contextualizada, no aislada. El análisis lingüístico se desprende de la necesidad de cumplir la tarea, no al revés.
  e) Evaluación: Incorpora la co-evaluación o autoevaluación (diarios de clase, portafolio).
`;

// Route for analyzing the didactic sequence
app.post("/api/evaluate", async (req, res) => {
  try {
    const {
      title,
      targetLevel,
      objectives,
      targetGroupDescription,
      contents,
      inputs,
      enablingTasks,
      finalTask,
      fullText,
    } = req.body;

    const ai = getGeminiClient();

    const sequenceText = fullText
      ? fullText
      : `
Título de la secuencia: ${title || "Sin título"}
Nivel meta (UBA/ELSE): ${targetLevel || "No especificado"}
Descripción del grupo meta (intereses/necesidades): ${targetGroupDescription || "No especificado"}
Objetivos comunicativos: ${objectives || "No especificado"}
Selección de contenidos (gramaticales, léxicos, culturales): ${contents || "No especificado"}
Recursos usados como inputs: ${inputs || "No especificado"}
Tareas posibilitadoras (pasos): ${enablingTasks || "No especificado"}
Tarea final: ${finalTask || "No especificado"}
`;

    const instructions = `
Eres un especialista en ELSE (Español como Lengua Segunda y Extranjera) de la Facultad de Filosofía y Letras de la Universidad de Buenos Aires (UBA) y un jurado pedagógico especializado en el Enfoque por Tareas (según el MCER, Sonsoles Fernández, Estaire, Zanón, etc.).
Tu rol es evaluar y retroalimentar una secuencia didáctica diseñada por estudiantes de posgrado de la Carrera de Especialización en enseñanza de ELSE, quienes serán futuros profesores.

${ELSE_CURRICULUM_PROMPT}

Instrucciones de evaluación rigurosas:
- Analiza si el nivel propuesto realmente se condice con los contenidos mínimos de la UBA para ese nivel. Sé específico.
- Evalúa si la secuencia se organiza verdaderamente según el Enfoque por Tareas (con un punto de partida motivador, tareas posibilitadoras facilitadoras de recursos, atención formal integrada, una Tarea Final comunicativa auténtica y mecanismos de autoevaluación).
- Elabora una devolución muy profesional, constructiva y precisa que ofrezca valor de posgrado (utilizando vocabulario académico pedagógico, ej: "recurso de input", "andamiaje", "andamiaje comunicativo", "foco en el significado", "atención a la forma integrada").
- Asigna un "Nivel de logro" global según esta escala estricta:
  * "No es adecuado": Hay inconsistencias graves en objetivos, contenidos no aptos para el nivel UBA, no se enfoca en tareas, o recursos sin potencial comunicativo.
  * "Adecuado": Cumple con los requisitos básicos pero se asemeja más a un enfoque estructural/nocio-funcional tradicional o carece de cohesión entre posibilitadoras y la tarea final.
  * "Muy adecuado": Presenta una sólida planificación comunicativa orientada a la acción, contenidos que cuadran con el currículum de la UBA, y buenas tareas de andamiaje.
  * "Destacado": Innovador, perfectamente integrado, promueve la autonomía y la interculturalidad, excelente selección de inputs auténticos y secuencia metodológica impecable según el enfoque por tareas.

Debes responder estrictamente en formato JSON utilizando el esquema requerido.
`;

    const userPrompt = `
Por favor evalúa la siguiente propuesta de secuencia didáctica:

${sequenceText}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: instructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nivelDeLogro: {
              type: Type.STRING,
              description: "Nivel de logro global: 'No es adecuado', 'Adecuado', 'Muy adecuado' o 'Destacado'",
            },
            adecuacionGrupoMeta: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Puntaje de 1 a 5" },
                feedback: { type: Type.STRING, description: "Evaluación detallada de la adecuación al grupo meta (nivel, intereses, necesidades) basándote en los niveles de la UBA." },
              },
              required: ["score", "feedback"],
            },
            pertinenciaObjetivos: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Puntaje de 1 a 5" },
                feedback: { type: Type.STRING, description: "Evaluación sobre la claridad, realismo y pertinencia comunicativa de los objetivos." },
              },
              required: ["score", "feedback"],
            },
            coherenciaContenidos: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Puntaje de 1 a 5" },
                feedback: { type: Type.STRING, description: "Evaluación de la selección de contenidos gramaticales, léxicos y culturales en relación con los niveles de la UBA." },
              },
              required: ["score", "feedback"],
            },
            potencialInputs: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Puntaje de 1 a 5" },
                feedback: { type: Type.STRING, description: "Análisis del potencial comunicativo de los recursos e inputs seleccionados." },
              },
              required: ["score", "feedback"],
            },
            articulacionTareas: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.INTEGER, description: "Puntaje de 1 a 5" },
                feedback: { type: Type.STRING, description: "Análisis crítico de si las tareas posibilitadoras preparan adecuadamente y de forma andamiada al alumno para resolver la Tarea Final, y si esta última es una verdadera Tarea." },
              },
              required: ["score", "feedback"],
            },
            puntosFuertes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 3 a 5 puntos fuertes clave de la secuencia.",
            },
            mejorasOrientaciones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de sugerencias concretas, fundamentadas metodológicamente, para orientar la mejora de esta secuencia.",
            },
            comentariosGlobales: {
              type: Type.STRING,
              description: "Comentario global de devolución afectiva y pedagógica, alentando la práctica profesional.",
            },
          },
          required: [
            "nivelDeLogro",
            "adecuacionGrupoMeta",
            "pertinenciaObjetivos",
            "coherenciaContenidos",
            "potencialInputs",
            "articulacionTareas",
            "puntosFuertes",
            "mejorasOrientaciones",
            "comentariosGlobales",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No se recibió respuesta del evaluador de IA.");
    }
    const evaluation = JSON.parse(resultText.trim());
    res.json(evaluation);
  } catch (error: any) {
    console.error("Error en /api/evaluate:", error);
    res.status(500).json({ error: error.message || "Error al realizar la evaluación." });
  }
});

// Follow up chat with the ELSE mentor
app.post("/api/chat", async (req, res) => {
  try {
    const { history, message } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `
Eres un amigable, riguroso y experimentado Mentor Especialista en ELSE (Español como Lengua Segunda y Extranjera) de la Facultad de Filosofía y Letras de la UBA.
Estás conversando con un alumno/a de la Carrera de Especialización en enseñanza de ELSE que acaba de recibir una evaluación de su secuencia didáctica en el marco del Enfoque por Tareas.
Tu labor es responder sus dudas pedagógicas, darle sugerencias prácticas de recursos, explicarle con más detalle el porqué de los comentarios del evaluador y animarle a mejorar su planificación.
Utiliza un registro académico pero sumamente accesible, afectivo, pedagógico y alentador.
Groundea tus respuestas teóricamente en la didáctica ELE/ELSE argentina y en los niveles de UBA Laboratorio de Idiomas cuando sea pertinente.
Sé conciso y claro en tus mensajes (evita respuestas extremadamente largas, organízalas con viñetas elegantes si es necesario).
`;

    // Structure contents for Gemini Pro/Flash Chat
    const chatContents = history.map((line: any) => ({
      role: line.role === "user" ? "user" : "model",
      parts: [{ text: line.text }],
    }));

    // Add current message
    chatContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text;
    res.json({ reply });
  } catch (error: any) {
    console.error("Error en /api/chat:", error);
    res.status(500).json({ error: error.message || "Error al interactuar con el mentor." });
  }
});

// Setup Vite Dev server or serve built assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fullstack] Servidor corriendo en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Error al iniciar el servidor Express + Vite:", err);
});
