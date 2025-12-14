"use client";
import { useState, useEffect } from "react";
import { postAPI, API, saveToLibrary } from "@/lib/api";
import {
    ClipboardDocumentCheckIcon, SparklesIcon,
    ArrowPathIcon, CheckCircleIcon,
    DocumentTextIcon, AdjustmentsHorizontalIcon,
    ArrowDownTrayIcon, PencilSquareIcon, PlusCircleIcon, MinusCircleIcon
} from "@heroicons/react/24/outline";
import { AssessmentConfig, AssessmentResult } from "@/types/assessment";
import { exportAssessmentToDocx } from "@/lib/exportUtils";

// --- COMPONENTES UI ---

const StepIndicator = ({ current, step, label }: { current: number, step: number, label: string }) => (
    <div className={`flex items-center gap-2 ${current >= step ? 'text-[#1a2e3b]' : 'text-gray-300'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
            ${current >= step ? 'bg-[#1a2e3b] text-white' : 'border-2 border-gray-200'}`}>
            {step}
        </div>
        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{label}</span>
        {current > step && <div className="w-12 h-0.5 bg-[#1a2e3b]/20 mx-2 hidden md:block"></div>}
    </div>
);

const DistributionSlider = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold uppercase text-gray-200">
            <span>{label}</span>
            <span className="text-[#f2ae60] text-sm">{value}%</span>
        </div>
        <input
            type="range" min="0" max="100" step="5"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-600 accent-[#f2ae60]"
        />
    </div>
);

// NUEVO COMPONENTE: CONTADOR DE CANTIDAD POR TIPO
const TypeCounter = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 transition-all">
        <span className="text-sm font-bold text-gray-600">{label}</span>
        <div className="flex items-center gap-3">
            <button
                onClick={() => onChange(Math.max(0, value - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
                <MinusCircleIcon className="w-5 h-5" />
            </button>
            <span className="w-6 text-center font-bold text-[#1a2e3b]">{value}</span>
            <button
                onClick={() => onChange(value + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
                <PlusCircleIcon className="w-5 h-5" />
            </button>
        </div>
    </div>
);

export default function GeneradorEvaluaciones() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [niveles, setNiveles] = useState<string[]>([]);
    const [asignaturas, setAsignaturas] = useState<string[]>([]);
    const [oasDisponibles, setOasDisponibles] = useState<any[]>([]);

    // CONFIGURACIÓN ACTUALIZADA: Cantidades explícitas por tipo
    const [config, setConfig] = useState<any>({
        grade: "",
        subject: "",
        oaIds: [],
        customOa: "",
        dokDistribution: { dok1: 20, dok2: 50, dok3: 30 },
        quantities: { // NUEVO: Cantidades exactas
            multiple_choice: 10,
            true_false: 0,
            short_answer: 0,
            essay: 2
        }
    });

    const [resultado, setResultado] = useState<AssessmentResult | null>(null);

    // Calcular total dinámicamente
    const totalQuestions = Object.values(config.quantities as Record<string, number>).reduce((a, b) => a + b, 0);

    // --- LÓGICA MAGIC SLIDERS ---
    const handleDistributionChange = (type: 'dok1' | 'dok2' | 'dok3', newValue: number) => {
        if (newValue < 0) newValue = 0; if (newValue > 100) newValue = 100;
        const keys = ['dok1', 'dok2', 'dok3'] as const;
        const others = keys.filter(k => k !== type);
        const remaining = 100 - newValue;
        const currentTotalOthers = config.dokDistribution[others[0]] + config.dokDistribution[others[1]];
        let newDist = { ...config.dokDistribution, [type]: newValue };

        if (remaining === 0) { newDist[others[0]] = 0; newDist[others[1]] = 0; }
        else if (currentTotalOthers === 0) { newDist[others[0]] = Math.floor(remaining / 2); newDist[others[1]] = remaining - newDist[others[0]]; }
        else {
            const ratio = remaining / currentTotalOthers;
            newDist[others[0]] = Math.round(config.dokDistribution[others[0]] * ratio);
            newDist[others[1]] = remaining - newDist[others[0]];
        }
        setConfig({ ...config, dokDistribution: newDist });
    };

    useEffect(() => {
        postAPI(API.CURRICULUM_OPTIONS, {})
            .then(res => res.json())
            .then(data => { if (data.type === 'niveles') setNiveles(data.data); })
            .catch(e => console.error(e));
    }, []);

    const handleNivelSelect = (nivel: string) => {
        setConfig({ ...config, grade: nivel });
        setLoading(true);
        postAPI(API.CURRICULUM_OPTIONS, { nivel })
            .then(res => res.json())
            .then(data => {
                if (data.type === 'asignaturas') setAsignaturas(data.data);
                setLoading(false);
            });
    };

    const handleAsignaturaSelect = (asignatura: string) => {
        setConfig({ ...config, subject: asignatura });
        setLoading(true);
        postAPI(API.CURRICULUM_OPTIONS, { nivel: config.grade, asignatura })
            .then(res => res.json())
            .then(data => {
                if (data.type === 'oas') setOasDisponibles(data.data);
                setStep(2);
                setLoading(false);
            });
    };

    const updateQuantity = (type: string, val: number) => {
        setConfig({ ...config, quantities: { ...config.quantities, [type]: val } });
    };

    const generarPrueba = async () => {
        if (totalQuestions === 0) { alert("Debes agregar al menos una pregunta."); return; }
        setLoading(true);
        try {
            const res = await postAPI(API.GENERATE_ASSESSMENT, config);
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || data.detail || "Error del servidor");
            }
            if (data.error) {
                throw new Error(data.error);
            }
            setResultado(data);
            setStep(3);
            
            // Auto-guardar en biblioteca
            await saveToLibrary({
                titulo: data.title || `Evaluacion ${config.subject}`,
                tipo: 'evaluacion',
                nivel: config.grade,
                asignatura: config.subject,
                contenido: data
            });
        } catch (error: any) {
            console.error(error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const descargarWord = async () => {
        if (!resultado) return;
        try {
            await exportAssessmentToDocx(resultado, `Evaluacion_${config.subject.replace(/\s+/g, '_')}`);
        } catch (e) { 
            console.error(e);
            alert("Error descargando archivo."); 
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fa] pb-20 font-sans">
            <header className="bg-white border-b border-gray-200 px-8 py-5 sticky top-0 z-20 shadow-sm">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#1a2e3b] flex items-center gap-2">
                            <ClipboardDocumentCheckIcon className="w-8 h-8 text-[#f2ae60]" />
                            Generador de Evaluaciones
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <StepIndicator current={step} step={1} label="Configuración" />
                        <StepIndicator current={step} step={2} label="Objetivos" />
                        <StepIndicator current={step} step={3} label="Resultado" />
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="lg:col-span-7 space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5" /> Nivel y Asignatura
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1a2e3b]" onChange={(e) => handleNivelSelect(e.target.value)} value={config.grade}>
                                        <option value="">Nivel...</option>
                                        {niveles.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1a2e3b]" onChange={(e) => handleAsignaturaSelect(e.target.value)} value={config.subject} disabled={!config.grade || loading}>
                                        <option value="">Asignatura...</option>
                                        {asignaturas.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* NUEVO PANEL DE CANTIDADES */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-[#1a2e3b] mb-4 flex items-center gap-2">
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" /> Estructura de la Prueba
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <TypeCounter label="Selección Múltiple" value={config.quantities.multiple_choice} onChange={(v: number) => updateQuantity('multiple_choice', v)} />
                                    <TypeCounter label="Verdadero/Falso" value={config.quantities.true_false} onChange={(v: number) => updateQuantity('true_false', v)} />
                                    <TypeCounter label="Respuesta Breve" value={config.quantities.short_answer} onChange={(v: number) => updateQuantity('short_answer', v)} />
                                    <TypeCounter label="Desarrollo (Ensayo)" value={config.quantities.essay} onChange={(v: number) => updateQuantity('essay', v)} />
                                </div>
                                <div className="mt-4 pt-4 border-t flex justify-end">
                                    <p className="text-sm font-bold text-gray-500">Total de Preguntas: <span className="text-[#1a2e3b] text-lg ml-1">{totalQuestions}</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-5">
                            <div className="bg-[#1a2e3b] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden h-full">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><AdjustmentsHorizontalIcon className="w-40 h-40" /></div>
                                <h2 className="text-xl font-bold mb-6 relative z-10">Calibración DOK</h2>
                                <p className="text-sm text-gray-300 mb-6 relative z-10">Define qué porcentaje de la prueba corresponderá a cada nivel de complejidad.</p>

                                <div className="space-y-8 relative z-10">
                                    <div className="p-5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 space-y-6">
                                        <DistributionSlider label="DOK 1: Recordar" value={config.dokDistribution.dok1} onChange={(v: number) => handleDistributionChange('dok1', v)} />
                                        <DistributionSlider label="DOK 2: Aplicar" value={config.dokDistribution.dok2} onChange={(v: number) => handleDistributionChange('dok2', v)} />
                                        <DistributionSlider label="DOK 3: Estratégico" value={config.dokDistribution.dok3} onChange={(v: number) => handleDistributionChange('dok3', v)} />
                                    </div>

                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-xs text-yellow-200">
                                            <span className="font-bold">Nota:</span> El sistema intentará distribuir los tipos de preguntas seleccionados (ej: Alternativas) dentro de estos niveles de dificultad.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[#1a2e3b]">Selecciona los Objetivos</h2>
                                {config.oaIds.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-1">{config.oaIds.length} objetivo(s) seleccionado(s)</p>
                                )}
                            </div>
                            <button onClick={generarPrueba} disabled={loading} className="bg-[#1a2e3b] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#2a4555] transition-all flex items-center gap-2 disabled:opacity-50">
                                {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5 text-[#f2ae60]" />}
                                {loading ? "Generando..." : "Generar Prueba"}
                            </button>
                        </div>
                        <div className="mb-8 bg-amber-50 p-6 rounded-2xl border border-amber-100">
                            <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2"><PencilSquareIcon className="w-5 h-5" /> Agregar objetivo manual</h3>
                            <div className="flex gap-3">
                                <textarea className="flex-1 p-4 rounded-xl border border-amber-200 bg-white text-sm focus:ring-2 focus:ring-amber-400 outline-none" rows={2} placeholder="Escribe aqui un objetivo manual..." value={config.customOa} onChange={(e) => setConfig({ ...config, customOa: e.target.value })} />
                                <button 
                                    onClick={() => {
                                        if (config.customOa.trim()) {
                                            const newOa = { id: `custom_${Date.now()}`, oa_codigo: 'OA-M', descripcion: config.customOa, dok: 2 };
                                            setOasDisponibles([...oasDisponibles, newOa]);
                                            setConfig({ ...config, customOa: '', oaIds: [...config.oaIds, newOa.id] });
                                        }
                                    }}
                                    disabled={!config.customOa.trim()}
                                    className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Agregar
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {oasDisponibles.map((oa) => {
                                const isSelected = config.oaIds.includes(oa.id);
                                return (
                                    <div key={oa.id} className={`p-5 rounded-2xl border transition-all duration-200 group relative ${isSelected ? 'bg-blue-50 border-[#1a2e3b] shadow-md ring-1 ring-[#1a2e3b]' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${isSelected ? 'bg-[#1a2e3b] text-white' : 'bg-gray-100 text-gray-500'}`}>{oa.oa_codigo || 'OA'}</span>
                                            <div className="flex items-center gap-2">
                                                <select 
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        const updatedOas = oasDisponibles.map(o => o.id === oa.id ? {...o, dok: parseInt(e.target.value)} : o);
                                                        setOasDisponibles(updatedOas);
                                                    }}
                                                    value={oa.dok || 2}
                                                    className="text-xs px-2 py-1 border rounded bg-white"
                                                >
                                                    <option value={1}>DOK 1</option>
                                                    <option value={2}>DOK 2</option>
                                                    <option value={3}>DOK 3</option>
                                                    <option value={4}>DOK 4</option>
                                                </select>
                                                {isSelected && <CheckCircleIcon className="w-5 h-5 text-[#1a2e3b]" />}
                                            </div>
                                        </div>
                                        <p 
                                            onClick={() => { const newIds = isSelected ? config.oaIds.filter((id: any) => id !== oa.id) : [...config.oaIds, oa.id]; setConfig({ ...config, oaIds: newIds }); }}
                                            className="text-sm text-gray-600 line-clamp-4 leading-relaxed cursor-pointer"
                                        >
                                            {oa.descripcion || oa.oa_descripcion}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {step === 3 && resultado && (
                    <div className="animate-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                        <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 mb-20">
                            <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
                                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-widest">{resultado.title}</h1>
                                <p className="text-gray-500 italic mt-2">{resultado.description}</p>
                            </div>
                            <div className="space-y-8">
                                {resultado.items.map((item, i) => (
                                    <div key={i} className="break-inside-avoid">
                                        <div className="flex gap-2 mb-2">
                                            <span className="font-bold text-gray-900">{i + 1}.</span>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-gray-800 font-medium text-lg leading-snug">{item.stem}</p>
                                                    <span className="text-xs font-bold text-gray-400 ml-4 whitespace-nowrap">({item.points} pts)</span>
                                                </div>
                                                {item.type === 'multiple_choice' && item.options && (
                                                    <div className="mt-3 space-y-2 ml-2">
                                                        {item.options.map((opt, idx) => (
                                                            <div key={idx} className="flex items-center gap-3">
                                                                <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-xs font-bold text-gray-500">{String.fromCharCode(97 + idx)}</div>
                                                                <span className="text-gray-700">{opt.text}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {(item.type === 'essay' || item.type === 'short_answer') && <div className="mt-4 w-full h-24 border border-gray-200 rounded-lg bg-gray-50/50"></div>}
                                                {item.type === 'true_false' && <div className="mt-2 text-gray-600 font-medium ml-4">_____ Verdadero &nbsp;&nbsp;&nbsp;&nbsp; _____ Falso</div>}
                                            </div>
                                            <div className="print:hidden">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded border ${item.dok_level === 1 ? 'bg-green-50 text-green-700 border-green-200' : item.dok_level === 2 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>DOK {item.dok_level}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="fixed bottom-8 right-8 flex gap-3 z-50">
                            <button onClick={descargarWord} className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:bg-blue-700 flex items-center gap-2 transform hover:scale-105 transition-all"><ArrowDownTrayIcon className="w-5 h-5" /> Descargar Word</button>
                            <button onClick={() => setStep(1)} className="bg-white text-[#1a2e3b] px-6 py-3 rounded-full font-bold shadow-xl hover:bg-gray-50 border border-gray-200"><SparklesIcon className="w-5 h-5 text-[#f2ae60]" /> Nueva</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}