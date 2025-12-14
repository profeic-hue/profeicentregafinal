// UBICACIÓN: lib/prompts-optimized.ts

// INSTRUCCIÓN MAESTRA DEL SISTEMA
export const SYSTEM_INSTRUCTION_ROOT = `
Eres "ProfeIC", experto en Planificación Curricular y Cultura Escolar Chilena.
Tu misión es crear planificaciones coherentes, rigurosas y con identidad institucional.

MARCO PEDAGÓGICO:
1. Diseño Inverso (Wiggins & McTighe): Partir del objetivo, luego la evaluación, finalmente la actividad.
2. Visible Learning (Hattie): Hacer visible el pensamiento mediante modelamiento explícito.
3. Integración Valórica: Los valores NO son un adorno; se viven en la interacción y las dinámicas de clase[cite: 5].

FORMATO DE SALIDA: SIEMPRE JSON VÁLIDO.
`;

// PROMPT 1: ESTRATEGIA (Genera el plan general y la Arquitectura T)
export const generateStrategyPrompt = (
  asignatura: string,
  curso: string,
  tema: string,
  valoresContexto: string // Recibe el contexto valórico seleccionado por el docente
) => `
CONTEXTO:
- Asignatura: ${asignatura}
- Nivel: ${curso}
- Tema/Proyecto: "${tema}"
- ADN VALÓRICO (OBLIGATORIO): "${valoresContexto}"

TAREA 1: ARQUITECTURA PEDAGÓGICA
Diseña la estructura base del proyecto.
1. Define Objetivos de Aprendizaje Priorizados (OA).
2. Crea una "Arquitectura T" (Verbo + Contenido + Estrategia Social + Valor).
3. Escribe un guion de modelamiento (Think-Aloud) donde el docente DEMUESTRE el valor seleccionado (ej. si es "Acogida", el guion debe ser cálido y receptivo).

FORMATO JSON ESPERADO:
{
  "objetivos_aprendizaje": ["OA Principal", "OA Transversal"],
  "arquitectura_t": {
    "verbo": "Acción cognitiva (Taxonomía)",
    "contenido": "Contenido curricular clave",
    "estrategia_social": "Dinámica de interacción",
    "valor_integrado": "Valor y actitudes seleccionadas del panel"
  },
  "estrategia_didactica": {
    "nombre": "Nombre creativo de la estrategia",
    "guion_modelamiento": "Texto en PRIMERA PERSONA para el profesor, pensando en voz alta..."
  }
}
`;

// PROMPT 2: SECUENCIA DE CLASES (Genera el detalle de N clases)
export const generateClassSequencePrompt = (
  strategyContext: any, // El JSON de la estrategia anterior
  cantidadClases: number // Cantidad de clases a generar (3 a 5)
) => `
CONTEXTO ESTRATÉGICO DEFINIDO:
${JSON.stringify(strategyContext)}

TAREA 2: SECUENCIA DIDÁCTICA (${cantidadClases} CLASES)
Genera la planificación detallada para ${cantidadClases} clases que formen una unidad coherente.

REQUISITOS CRÍTICOS:
1. Hilo Conductor: La Clase 1 abre un desafío o pregunta que se resuelve en la Clase ${cantidadClases}. Evita clases aisladas.
2. Cultura Escolar Vivia: Integra explícitamente las actitudes seleccionadas (${strategyContext.arquitectura_t.valor_integrado}) en las instrucciones y actividades de las clases.
3. Estructura de Clase: Cada sesión debe tener Inicio (Activación), Desarrollo (Experiencia Central) y Cierre (Metacognición/Ticket).

FORMATO JSON ESPERADO:
{
  "clases": [
    {
      "numero": 1,
      "titulo": "Título atractivo de la clase",
      "objetivo_especifico": "Meta observable de la sesión",
      "fases": {
        "inicio": "Actividad breve de enganche y conocimientos previos...",
        "desarrollo": "Actividad principal, modelamiento y práctica...",
        "cierre": "Síntesis, evaluación formativa o ticket de salida..."
      }
    }
    // ... Generar objetos hasta completar las ${cantidadClases} clases solicitadas
  ]
}
`;