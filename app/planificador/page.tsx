'use client';
import React, { useState } from 'react';
import { getObjectives, generateStrategy, suggestTitle } from '@/lib/api';
import { SCHOOL_VALUES } from '@/lib/schoolValues';
import { Button } from '@/components/ui/button';
import {
    Loader2, Check, BookOpen, ChevronRight, ChevronLeft,
    Sparkles, Brain, Printer, Trash2, Plus, Layout,
    GraduationCap, Target, AlertCircle
} from 'lucide-react';
import Image from 'next/image';

// --- DATA ---
const CURRICULUM_MAP: Record<string, string[]> = {
    "NT1": ["Comprensión Del Entorno Sociocultural", "Pensamiento Matemático", "Lenguaje Verbal", "Lenguajes Artísticos", "Exploración del Entorno Natural", "Identidad y Autonomía", "Convivencia y Ciudadanía", "Corporalidad y Movimiento"],
    "NT2": ["Comprensión Del Entorno Sociocultural", "Pensamiento Matemático", "Lenguaje Verbal", "Lenguajes Artísticos", "Exploración del Entorno Natural", "Identidad y Autonomía", "Convivencia y Ciudadanía", "Corporalidad y Movimiento"],
    "1° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "2° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "3° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "4° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "5° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "6° Básico": ["Lenguaje y Comunicación", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "7° Básico": ["Lengua y Literatura", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "8° Básico": ["Lengua y Literatura", "Matemática", "Ciencias Naturales", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud", "Religión", "Orientación"],
    "1° Medio": ["Lengua y Literatura", "Matemática", "Biología", "Física", "Química", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud"],
    "2° Medio": ["Lengua y Literatura", "Matemática", "Biología", "Física", "Química", "Historia, Geografía y Cs. Sociales", "Inglés", "Artes Visuales", "Música", "Tecnología", "Educación Física y Salud"],
    "3° Medio": ["Lengua y Literatura", "Matemática", "Inglés", "Educación Ciudadana", "Filosofía", "Ciencias para la Ciudadanía"],
    "4° Medio": ["Lengua y Literatura", "Matemática", "Inglés", "Educación Ciudadana", "Filosofía", "Ciencias para la Ciudadanía"],
    "3° y 4° Medio": ["Biología de los Ecosistemas", "Límites, Derivadas e Integrales", "Comprensión Histórica del Presente", "Economía y Sociedad", "Física", "Química", "Lectura y Escritura Especializada", "Artes Visuales (Electivo)", "Diseño y Arquitectura"]
};

const customStyles = `
  @media print { body * { visibility: hidden; } #printable-area, #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none !important; } .page-break { page-break-before: always; } }
  .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.5); }
  .gradient-text { background: linear-gradient(135deg, #4f46e5, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
`;

export default function PlanificadorUltra() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // State
    const [config, setConfig] = useState({ nivel: '', asignatura: '', tema: '', duracion: 2 });
    const [availableOAs, setAvailableOAs] = useState<any[]>([]);
    const [mochilaOAs, setMochilaOAs] = useState<any[]>([]);
    const [manualOA, setManualOA] = useState("");

    const [activeTab, setActiveTab] = useState<string>("CARIDAD");
    const [mochilaAttitudes, setMochilaAttitudes] = useState<string[]>([]);
    const [result, setResult] = useState<any>(null);

    // --- ACTIONS ---
    const handleLoadOAs = async (newAsignatura?: string) => {
        const asignaturaToLoad = newAsignatura || config.asignatura;
        if (!asignaturaToLoad || !config.nivel) return;

        setLoading(true);
        setErrorMsg("");
        try {
            const oas = await getObjectives(asignaturaToLoad, config.nivel);
            setAvailableOAs(oas);
            if (!newAsignatura) setStep(2);
        } catch (e) { setErrorMsg("Error de conexión con DB"); }
        finally { setLoading(false); }
    };

    const handleAddManualOA = () => {
        if (!manualOA.trim()) return;
        setMochilaOAs([...mochilaOAs, { id: 'MANUAL', text: manualOA }]);
        setManualOA("");
    };

    const handleSuggestTitle = async () => {
        if (mochilaOAs.length === 0) return alert("Selecciona objetivos primero.");
        setSuggestionLoading(true);
        try {
            const title = await suggestTitle(mochilaOAs.map(o => o.text));
            setConfig(prev => ({ ...prev, tema: title }));
        } catch (e) { setConfig(prev => ({ ...prev, tema: "Unidad de Aprendizaje" })); }
        finally { setSuggestionLoading(false); }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const data = {
                ...config,
                objetivos: mochilaOAs.map(o => o.text),
                valorSeleccionado: "Valores IC",
                actitudes: mochilaAttitudes
            };
            const strategy = await generateStrategy(data);
            if (!strategy || !strategy.clases) throw new Error("Respuesta inválida");
            setResult(strategy);
            setStep(4);
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "Error generando. Intenta de nuevo.");
        } finally { setLoading(false); }
    };

    // --- COMPONENTS ---
    const BackButton = () => (
        <button onClick={() => setStep(step - 1)} className="flex items-center text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> Volver
        </button>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 font-sans pb-20 selection:bg-indigo-100 selection:text-indigo-900">
            <style>{customStyles}</style>

            {/* NAVBAR GLASS */}
            <nav className="fixed top-0 w-full glass-panel px-8 py-4 flex justify-between items-center z-50 shadow-sm no-print">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-200"><BookOpen className="w-5 h-5" /></div>
                    <div>
                        <span className="font-bold text-lg tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">ProfeIC</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Suite Docente</span>
                    </div>
                </div>
                {config.nivel && <div className="bg-white/50 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 border border-indigo-100 shadow-sm">{config.nivel}</div>}
            </nav>

            <main className="max-w-7xl mx-auto pt-32 px-6">

                {/* STEPPER */}
                <div className="flex justify-center items-center mb-12 no-print">
                    {[{ n: 1, l: "Config" }, { n: 2, l: "Objetivos" }, { n: 3, l: "Diseño" }, { n: 4, l: "Plan" }].map((s, idx) => (
                        <div key={s.n} className="flex items-center">
                            <div className={`flex items-center gap-3 transition-all duration-500 ${step >= s.n ? 'opacity-100 scale-105' : 'opacity-40 scale-95'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl transition-all
                    ${step >= s.n ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-slate-300'}`}>
                                    {step > s.n ? <Check className="w-5 h-5" /> : s.n}
                                </div>
                                <span className="font-bold text-sm text-slate-600 hidden md:block">{s.l}</span>
                            </div>
                            {idx < 3 && <div className={`w-12 h-1 mx-4 rounded-full transition-all duration-700 ${step > s.n ? 'bg-indigo-200' : 'bg-slate-100'}`} />}
                        </div>
                    ))}
                </div>

                {errorMsg && (
                    <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{errorMsg}</p>
                        <button onClick={() => setErrorMsg("")} className="ml-auto text-xs underline">Cerrar</button>
                    </div>
                )}

                {/* STEP 1: CONFIGURACIÓN ELEGANTE */}
                {step === 1 && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                        <div className="glass-panel rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-[120px] -z-10 opacity-30"></div>
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">¿Qué enseñaremos hoy?</h1>
                                <p className="text-slate-500 text-lg">Configura el punto de partida de tu planificación</p>
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <GraduationCap className="w-5 h-5 text-indigo-500" />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nivel Educativo</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.keys(CURRICULUM_MAP).map(n => (
                                            <button key={n} onClick={() => { setConfig({ ...config, nivel: n, asignatura: '' }); }}
                                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg border
                              ${config.nivel === n ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-200' : 'bg-white text-slate-500 border-transparent shadow-sm hover:border-indigo-100'}`}>
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {config.nivel && (
                                    <div className="animate-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <BookOpen className="w-5 h-5 text-indigo-500" />
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asignatura</span>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            {CURRICULUM_MAP[config.nivel]?.map(a => (
                                                <button key={a} onClick={() => setConfig({ ...config, asignatura: a })}
                                                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border
                                ${config.asignatura === a ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-2 ring-indigo-100' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'}`}>
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-16 flex justify-end">
                                <Button onClick={() => handleLoadOAs()} disabled={!config.asignatura || !config.nivel}
                                    className="bg-slate-900 hover:bg-black text-white px-10 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-slate-200 transition-all hover:scale-105">
                                    {loading ? <Loader2 className="animate-spin mr-2" /> : "Explorar Objetivos"} <ChevronRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: MOCHILA CURRICULAR (MEJORADA) */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <BackButton />

                        <div className="grid grid-cols-12 gap-8">
                            {/* LEFT: SELECTOR & LIST */}
                            <div className="col-span-12 lg:col-span-8">
                                {/* Header Selector */}
                                <div className="glass-panel p-6 rounded-3xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-24 z-30 shadow-lg">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">Base Curricular</h2>
                                        <p className="text-sm text-slate-500">Busca objetivos de múltiples asignaturas</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase px-2">BUSCAR EN:</span>
                                        <select className="bg-transparent text-sm font-bold text-indigo-600 outline-none cursor-pointer pr-8"
                                            value={config.asignatura}
                                            onChange={(e) => {
                                                const nueva = e.target.value;
                                                setConfig(prev => ({ ...prev, asignatura: nueva }));
                                                handleLoadOAs(nueva);
                                            }}>
                                            {CURRICULUM_MAP[config.nivel]?.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Manual Entry */}
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6 flex gap-4 items-center">
                                    <div className="bg-green-100 p-3 rounded-xl text-green-600"><Plus className="w-5 h-5" /></div>
                                    <input type="text" className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                                        placeholder="¿No encuentras el objetivo? Escríbelo aquí..."
                                        value={manualOA} onChange={e => setManualOA(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddManualOA()}
                                    />
                                    <button onClick={handleAddManualOA} disabled={!manualOA} className="text-xs font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 disabled:opacity-50">AGREGAR</button>
                                </div>

                                {/* OAs List */}
                                <div className="space-y-4 pb-32">
                                    {loading ? <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500 mb-4" /><p className="text-slate-400">Consultando Base de Datos...</p></div> :
                                        availableOAs.map(oa => {
                                            const isSelected = mochilaOAs.some(m => m.id === oa.id);
                                            return (
                                                <div key={oa.id} onClick={() => isSelected ? setMochilaOAs(mochilaOAs.filter(m => m.id !== oa.id)) : setMochilaOAs([...mochilaOAs, oa])}
                                                    className={`group p-6 rounded-3xl border cursor-pointer transition-all duration-300 hover:shadow-lg relative overflow-hidden
                                 ${isSelected ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>
                                                    <div className="flex justify-between items-start gap-4 mb-2">
                                                        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase bg-slate-100 px-2 py-1 rounded-md">{oa.id}</span>
                                                        {isSelected && <div className="bg-indigo-600 text-white rounded-full p-1 shadow-md"><Check className="w-3 h-3" /></div>}
                                                    </div>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{oa.text}</p>
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>

                            {/* RIGHT: BACKPACK (STICKY) */}
                            <div className="hidden lg:block col-span-4">
                                <div className="sticky top-32 glass-panel p-6 rounded-[2rem] shadow-xl border border-white/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-white p-3 rounded-2xl shadow-sm text-indigo-600"><Brain className="w-6 h-6" /></div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">Mochila Docente</h3>
                                            <p className="text-xs text-slate-500 font-medium">{mochilaOAs.length} elementos seleccionados</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar mb-6">
                                        {mochilaOAs.length === 0 ? <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">La mochila está vacía.<br />Selecciona objetivos.</div> :
                                            mochilaOAs.map((m, i) => (
                                                <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-xs text-slate-600 relative group transition-transform hover:scale-[1.02]">
                                                    <div className="flex justify-between mb-1"><span className="font-bold text-indigo-600">{m.id}</span></div>
                                                    <p className="line-clamp-3 leading-relaxed">{m.text}</p>
                                                    <button onClick={() => setMochilaOAs(mochilaOAs.filter((_, idx) => idx !== i))}
                                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>

                                    <Button onClick={() => setStep(3)} disabled={mochilaOAs.length === 0}
                                        className="w-full bg-slate-900 hover:bg-black text-white h-14 rounded-2xl text-lg font-bold shadow-xl shadow-slate-300/50">
                                        Diseñar Estrategia <ChevronRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: ESTRATEGIA (FINAL) */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-bottom-8 duration-500 max-w-6xl mx-auto">
                        <BackButton />
                        <div className="grid md:grid-cols-2 gap-8 mb-12">

                            {/* IZQ: DATOS DEL PROYECTO */}
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-[60px] -z-10 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                                <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3 text-xl">
                                    <div className="bg-yellow-100 p-2 rounded-xl text-yellow-600"><Sparkles className="w-5 h-5" /></div> Definición del Proyecto
                                </h3>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nombre de la Unidad</label>
                                        <div className="flex gap-2">
                                            <input type="text" className="flex-1 bg-slate-50 border-0 rounded-2xl p-4 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                                                placeholder="Ej. El Misterio de los Números..." value={config.tema} onChange={e => setConfig({ ...config, tema: e.target.value })} />
                                            <Button onClick={handleSuggestTitle} disabled={suggestionLoading}
                                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 h-auto rounded-2xl px-5 border border-indigo-100">
                                                {suggestionLoading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Duración ({config.duracion} Clases)</label>
                                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                                            <span className="font-bold text-slate-400 text-sm">1</span>
                                            <input type="range" min="1" max="8" value={config.duracion} onChange={e => setConfig({ ...config, duracion: parseInt(e.target.value) })}
                                                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-full" />
                                            <span className="font-bold text-slate-400 text-sm">8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DER: VALORES IC (MULTI-SELECT) */}
                            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-[60px] -z-10 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                                <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3 text-xl">
                                    <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><Target className="w-5 h-5" /></div> Sello Valórico IC
                                </h3>

                                <div className="mb-6">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(SCHOOL_VALUES).map(val => (
                                            <button key={val} onClick={() => setActiveTab(val)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border
                                ${activeTab === val ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 h-48 overflow-y-auto custom-scrollbar">
                                    {SCHOOL_VALUES[activeTab as keyof typeof SCHOOL_VALUES]?.map((att: string) => {
                                        const isSelected = mochilaAttitudes.includes(att);
                                        return (
                                            <label key={att} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${isSelected ? 'bg-indigo-100' : 'hover:bg-white'}`}>
                                                <input type="checkbox" className="accent-indigo-600 mt-1 w-4 h-4" checked={isSelected}
                                                    onChange={(e) => {
                                                        if (e.target.checked) setMochilaAttitudes([...mochilaAttitudes, att]);
                                                        else setMochilaAttitudes(mochilaAttitudes.filter(a => a !== att));
                                                    }} />
                                                <span className={`text-sm ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-600'}`}>{att}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                                <p className="text-right text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">{mochilaAttitudes.length} Actitudes Seleccionadas</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleGenerate} disabled={loading || !config.tema || mochilaAttitudes.length === 0}
                                className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white h-16 px-12 rounded-3xl text-xl font-bold shadow-2xl shadow-indigo-300/50 transition-all hover:scale-[1.02]">
                                {loading ? <span className="flex items-center gap-3"><Loader2 className="animate-spin w-6 h-6" /> Generando Planificación...</span> : "Generar Documento Final"}
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: RESULTADO */}
                {step === 4 && result && (
                    <div id="printable-area" className="animate-in zoom-in-95 duration-700 pb-20">
                        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                            {/* HEADER */}
                            <div className="bg-slate-900 p-12 text-white relative overflow-hidden print:bg-white print:text-black">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[150px] opacity-30 pointer-events-none"></div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <h1 className="text-4xl font-black mb-2 tracking-tight">Planificación Didáctica</h1>
                                        <p className="text-indigo-200 text-lg print:text-slate-500 font-medium">{config.asignatura} • {config.nivel}</p>
                                    </div>
                                    <Image src="/insignia.png" alt="Logo" width={100} height={100} className="drop-shadow-2xl" />
                                </div>
                                <div className="mt-10 relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/10 print:border-slate-200 print:bg-slate-50">
                                    <h2 className="text-sm font-bold text-indigo-200 mb-3 uppercase tracking-widest print:text-indigo-800">Enfoque de la Unidad</h2>
                                    <p className="text-xl italic leading-relaxed text-indigo-50 print:text-black">"{result.enfoque_unidad}"</p>
                                </div>
                            </div>

                            {/* CLASES */}
                            <div className="p-12 space-y-16">
                                {result.clases?.map((clase: any) => (
                                    <div key={clase.numero} className="page-break">
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="bg-indigo-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-xl shadow-indigo-200">
                                                {clase.numero}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-800">Diseño de Clase</h3>
                                                <p className="text-base text-indigo-600 font-medium">Modelo Sociocognitivo</p>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100 mb-10 shadow-sm">
                                            <p className="text-xl text-indigo-900 font-medium text-center leading-relaxed">"{clase.estrategia_aprendizaje.frase_completa}"</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                            <div className="space-y-8">
                                                <div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">1. Expectación (Gancho)</h4><p className="text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">{clase.pasos["1_expectacion"]}</p></div>
                                                <div><h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-3">3. Modelamiento (Think-Aloud)</h4><p className="text-slate-700 italic bg-amber-50 p-6 rounded-2xl border border-amber-100 leading-relaxed">"{clase.pasos["3_modelamiento_guion"]}"</p></div>
                                                <div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">5. Práctica Independiente</h4><p className="text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">{clase.pasos["5_practica_deliberada"]}</p></div>
                                            </div>
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">2. Niveles de Logro</h4>
                                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 text-sm">
                                                        <p className="flex gap-2"><strong className="text-red-500 bg-red-50 px-2 py-0.5 rounded">Insuficiente:</strong> {clase.pasos["2_niveles_logro"].insuficiente}</p>
                                                        <p className="flex gap-2"><strong className="text-green-600 bg-green-50 px-2 py-0.5 rounded">Adecuado:</strong> {clase.pasos["2_niveles_logro"].adecuado}</p>
                                                    </div>
                                                </div>
                                                <div><h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">4. Práctica Guiada</h4><p className="text-slate-700 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm leading-relaxed">{clase.pasos["4_ejercitacion_conjunta"]}</p></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100"><span className="text-[10px] font-black text-purple-700 uppercase tracking-widest block mb-2">DUA</span><p className="text-xs text-purple-900 leading-relaxed">{clase.diversificacion_dua}</p></div>
                                                    <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100"><span className="text-[10px] font-black text-teal-700 uppercase tracking-widest block mb-2">TICKET</span><p className="text-xs text-teal-900 leading-relaxed">"{clase.ticket_salida}"</p></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="my-12 border-b border-slate-100"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="fixed bottom-8 right-8 flex gap-3 no-print z-50">
                            <Button variant="outline" onClick={() => setStep(1)} className="bg-white shadow-2xl rounded-2xl border-0 h-14 px-8 font-bold text-slate-600 hover:text-slate-900">Nueva Planificación</Button>
                            <Button onClick={() => window.print()} className="bg-slate-900 text-white rounded-2xl shadow-2xl hover:scale-105 transition-transform h-14 px-8 font-bold flex items-center gap-2"><Printer className="w-5 h-5" /> Descargar PDF</Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}