import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const API = {
  CURRICULUM_OPTIONS: {
    asignaturas: ["Lenguaje", "Matemática", "Historia", "Ciencias", "Artes", "Música", "Tecnología", "Orientación", "Religión", "Inglés"],
    niveles: ["NT1", "NT2", "1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"]
  }
};

// --- IA ---

export async function suggestTitle(objetivos: string[]) {
  try {
    const prompt = `Crea un título corto y creativo para una unidad escolar basada en: ${JSON.stringify(objetivos)}. Solo el título.`;
    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    const data = await res.json();
    return data.result.replace(/['"]/g, '').trim();
  } catch (e) { return "Unidad de Aprendizaje"; }
}

export async function generateStrategy(inputData: any) {
  try {
    const prompt = `
      ACTÚA COMO: Jefe UTP. TAREA: Planificación (${inputData.duracion} clases).
      DATOS: ${inputData.nivel} | ${inputData.asignatura} | "${inputData.tema}".
      OAs: ${JSON.stringify(inputData.objetivos)} | VALORES: ${inputData.valorSeleccionado} | ACTITUDES: ${JSON.stringify(inputData.actitudes)}.
      
      IMPORTANTE: Responde SOLAMENTE con un JSON válido. No uses bloques de código markdown.
      
      ESTRUCTURA JSON:
      {
        "enfoque_unidad": "Texto...",
        "rol_mediador": "Texto...",
        "clases": [{
            "numero": 1,
            "estrategia_aprendizaje": { "habilidad": "...", "contenido": "...", "medio": "...", "actitud": "...", "frase_completa": "..." },
            "pasos": { "1_expectacion": "...", "2_niveles_logro": {"insuficiente":"", "elemental":"", "adecuado":""}, "3_modelamiento_guion": "...", "4_ejercitacion_conjunta": "...", "5_practica_deliberada": "...", "6_retroalimentacion": "...", "7_desafio_extension": "..." },
            "diversificacion_dua": "...", "ticket_salida": "..."
        }]
      }
    `;

    const res = await fetch('/api/generate', { method: 'POST', body: JSON.stringify({ prompt }) });
    const json = await res.json();

    if (json.error) throw new Error(json.error);

    // Limpieza agresiva para Gemini 2.0
    let cleanText = json.result.replace(/```json/g, "").replace(/```/g, "").trim();
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace >= 0) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(cleanText);
  } catch (e) { throw e; }
}

// --- DB ---
export async function getObjectives(asignatura: string, nivel: string) {
  try {
    const { data, error } = await supabase
      .from('curriculum_oas')
      .select('*')
      .ilike('asignatura', `%${asignatura}%`)
      .eq('nivel', nivel);
    if (error) throw error;
    return (data || []).map((item: any) => ({ id: item.oa_codigo, text: item.descripcion }));
  } catch (e) { return []; }
}

export async function postAPI() { return { success: true }; }
export async function saveToLibrary() { return { success: true }; }
export function getHeaders() { return {}; }