"use client";
import { useState, useEffect } from "react";
import { ArrowDownTrayIcon, ArrowPathIcon, ChevronRightIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { postAPI, API, saveToLibrary } from "@/lib/api";
import { exportRubricToDocx } from "@/lib/exportUtils";

// Definición de Tipos para TypeScript
interface CurriculumOption {
    value: string;
    label: string;
}

interface OA {
    id: number;
    oa_codigo: string;
    descripcion: string;
}

interface RubricCriteria {
    criterio: string;
    porcentaje: number;
    niveles: {
        insuficiente: string;
        elemental: string;
        adecuado: string;
        destacado: string;
    };
}

interface RubricResult {
    titulo: string;
    descripcion: string;
    tabla: RubricCriteria[];
}

export default function RubricasPage() {
    // --- ESTADOS DE CARGA DE DATOS ---
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [generating, setGenerating] = useState(false);

    // --- ESTADOS DE SELECCIÓN ---
    const [levels, setLevels] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [oas, setOas] = useState<OA[]>([]);

    // --- FORMULARIO ---
    const [form, setForm] = useState({
        nivel: "",
        asignatura: "",
        oaId: "",
        oaDescripcion: "", // Guardamos la descripción para el prompt
        actividad: "", // NUEVO: Contexto para la IA (ej: "Debate", "Ensayo")
    });

    // --- RESULTADO ---
    const [result, setResult] = useState<RubricResult | null>(null);

    // 1. Cargar Niveles al inicio (Reutilizando tu endpoint existente)
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const res = await postAPI(API.CURRICULUM_OPTIONS, {});
                const data = await res.json();
                if (data.type === "niveles") setLevels(data.data);
            } catch (e) { console.error("Error cargando niveles", e); }
        };
        fetchLevels();
    }, []);

    // 2. Cargar Asignaturas cuando cambia Nivel
    useEffect(() => {
        if (!form.nivel) return;
        const fetchSubjects = async () => {
            setLoadingConfig(true);
            const res = await postAPI(API.CURRICULUM_OPTIONS, { nivel: form.nivel });
            const data = await res.json();
            if (data.type === "asignaturas") setSubjects(data.data);
            setLoadingConfig(false);
        };
        fetchSubjects();
    }, [form.nivel]);

    // 3. Cargar OAs cuando cambia Asignatura
    useEffect(() => {
        if (!form.nivel || !form.asignatura) return;
        const fetchOas = async () => {
            setLoadingConfig(true);
            const res = await postAPI(API.CURRICULUM_OPTIONS, { nivel: form.nivel, asignatura: form.asignatura });
            const data = await res.json();
            if (data.type === "oas") setOas(data.data);
            setLoadingConfig(false);
        };
        fetchOas();
    }, [form.asignatura]);

    // --- HANDLERS ---

    const handleOaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedOa = oas.find(o => o.id.toString() === selectedId);
        setForm({
            ...form,
            oaId: selectedId,
            oaDescripcion: selectedOa ? `${selectedOa.oa_codigo}: ${selectedOa.descripcion}` : ""
        });
    };

    const generarRubrica = async () => {
        if (!form.oaId || !form.actividad) {
            alert("Por favor selecciona un OA y describe brevemente la actividad.");
            return;
        }
        setGenerating(true);
        setResult(null);

        try {
            // NOTA: Este endpoint lo crearemos en el siguiente paso en Backend
            const res = await postAPI(API.GENERATE_RUBRIC, form);

            const data = await res.json();
            if (!res.ok || data.error) {
                throw new Error(data.error || "Error del servidor");
            }
            setResult(data);
            
            // Auto-guardar en biblioteca
            await saveToLibrary({
                titulo: data.titulo || `Rubrica ${form.asignatura}`,
                tipo: 'rubrica',
                nivel: form.nivel,
                asignatura: form.asignatura,
                contenido: data
            });
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message || "Hubo un error generando la rubrica. Por favor intenta de nuevo."}`);
        } finally {
            setGenerating(false);
        }
    };

    const descargarDocx = async () => {
        if (!result) return;
        try {
            await exportRubricToDocx(result, `Rubrica_${form.asignatura.replace(/\s+/g, '_')}`);
        } catch (e) {
            console.error(e);
            alert("Error descargando archivo.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a2e3b]">Generador de Rúbricas Analíticas</h1>
                        <p className="text-gray-600">Basado en el Modelo de Evaluación Auténtica y los 7 Pasos (Paso 2).</p>
                    </div>
                    {/* Indicador de estado o pasos podría ir aquí */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA: CONFIGURACIÓN (WIZARD) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <BookOpenIcon className="text-blue-600" />
                                Configuración Curricular
                            </h2>

                            <div className="space-y-4">
                                {/* 1. NIVEL */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={form.nivel}
                                        onChange={e => setForm({ ...form, nivel: e.target.value, asignatura: "", oaId: "" })}
                                    >
                                        <option value="">Selecciona Nivel...</option>
                                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>

                                {/* 2. ASIGNATURA */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</label>
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={form.asignatura}
                                        onChange={e => setForm({ ...form, asignatura: e.target.value, oaId: "" })}
                                        disabled={!form.nivel}
                                    >
                                        <option value="">Selecciona Asignatura...</option>
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* 3. OA */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo de Aprendizaje (OA)</label>
                                    <select
                                        className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        value={form.oaId}
                                        onChange={handleOaChange}
                                        disabled={!form.asignatura}
                                    >
                                        <option value="">Selecciona OA...</option>
                                        {oas.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.oa_codigo} - {o.descripcion.substring(0, 50)}...
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 4. CONTEXTO DE ACTIVIDAD (CRÍTICO PEDAGÓGICAMENTE) */}
                                <div className="pt-4 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Actividad o Producto a Evaluar
                                        <span className="text-xs text-blue-600 ml-2 font-normal">(Ej: Ensayo, Maqueta, Debate)</span>
                                    </label>
                                    <textarea
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 text-sm"
                                        placeholder="Describe brevemente qué harán los estudiantes. Esto ayuda a la IA a crear descriptores observables."
                                        value={form.actividad}
                                        onChange={e => setForm({ ...form, actividad: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={generarRubrica}
                                    disabled={generating || !form.oaId}
                                    className={`w-full py-3 rounded-lg font-medium text-white shadow-md transition-all flex justify-center items-center gap-2
                                ${generating || !form.oaId ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1a2e3b] hover:bg-[#2c4b5f] hover:shadow-lg'}
                            `}
                                >
                                    {generating ? (
                                        <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generando Rubrica...</>
                                    ) : (
                                        <><ChevronRightIcon className="w-5 h-5" /> Generar Rúbrica</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: RESULTADO (TABLA) */}
                    <div className="lg:col-span-8">
                        {!result ? (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white/50">
                                <BookOpenIcon className="mb-4 opacity-20" />
                                <p>Configura los parámetros y genera tu rúbrica.</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* Header Rúbrica */}
                                <div className="p-6 bg-gray-50 border-b flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{result.titulo}</h2>
                                        <p className="text-sm text-gray-600 mt-1">{result.descripcion}</p>
                                    </div>
                                    <button
                                        onClick={descargarDocx}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" /> Descargar Word
                                    </button>
                                </div>

                                {/* Tabla Rúbrica */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#1a2e3b] text-white text-sm">
                                                <th className="p-4 w-1/5 font-semibold">Criterio</th>
                                                <th className="p-4 w-1/5 font-semibold bg-red-800/80">Insuficiente</th>
                                                <th className="p-4 w-1/5 font-semibold bg-yellow-700/80">Elemental</th>
                                                <th className="p-4 w-1/5 font-semibold bg-green-700/80">Adecuado</th>
                                                <th className="p-4 w-1/5 font-semibold bg-blue-700/80">Destacado (Extension)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm text-gray-700 divide-y divide-gray-200">
                                            {result.tabla.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 align-top">
                                                        <p className="font-bold text-gray-900">{row.criterio}</p>
                                                        {row.porcentaje > 0 && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                                {row.porcentaje}%
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* Los niveles deben ser descriptivos y observables */}
                                                    <td className="p-4 align-top bg-red-50/30 text-xs">{row.niveles.insuficiente}</td>
                                                    <td className="p-4 align-top bg-yellow-50/30 text-xs">{row.niveles.elemental}</td>
                                                    <td className="p-4 align-top bg-green-50/30 text-xs font-medium">{row.niveles.adecuado}</td>
                                                    <td className="p-4 align-top bg-blue-50/30 text-xs">{row.niveles.destacado}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}