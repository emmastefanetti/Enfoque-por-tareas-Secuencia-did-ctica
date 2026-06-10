export interface DidacticSequence {
  title: string;
  targetLevel: string;
  targetGroupDescription: string;
  objectives: string;
  contents: string;
  inputs: string;
  enablingTasks: string;
  finalTask: string;
  fullText?: string;
}

export interface EvaluationScore {
  score: number;
  feedback: string;
}

export interface DidacticEvaluation {
  nivelDeLogro: "No es adecuado" | "Adecuado" | "Muy adecuado" | "Destacado";
  adecuacionGrupoMeta: EvaluationScore;
  pertinenciaObjetivos: EvaluationScore;
  coherenciaContenidos: EvaluationScore;
  potencialInputs: EvaluationScore;
  articulacionTareas: EvaluationScore;
  puntosFuertes: string[];
  mejorasOrientaciones: string[];
  comentariosGlobales: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
