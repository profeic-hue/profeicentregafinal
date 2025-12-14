"use client";
import { useState } from "react";
import { HeartIcon, EyeIcon, HandRaisedIcon, SparklesIcon, ArrowDownTrayIcon, PuzzlePieceIcon, UserIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { postAPI, API } from "@/lib/api";
import { exportToDocx } from "@/lib/exportUtils";

export default function AsistenteDuaPage() {
    const [actividad, setActividad] = useState("");
    const [caracteristicas, setCaracteristicas] = useState("");
    const [barreras, setBarreras] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [editedStrategies, setEditedStrategies] = useState<Record<string, string>>({});

    const generar = async () => {
        if (!actividad.trim() || !caracteristicas.trim()) {
            alert("La actividad y las caracteristicas del estudiante son obligatorias");
            return;
        }
        setLoading(true);
        setResult(null);
        setEditedStrategies({});
        try {
            const res = await postAPI(API.ASISTENTE_DUA, { 
                actividad, 
                diagnostico: caracteristicas,
                barreras 
            });
            const data = await res.json();
            if (data.error) {
                setResult({ error: data.error });
            } else {
                setResult(data);
            }
        } catch (e: any) {
            setResult({ error: e.message || "Error de conexion" });
        }
        setLoading(false);
    };

    const getStrategyContent = (key: string) => {
        if (editedStrategies[key]) return editedStrategies[key];
        const items = result?.[key];
        return Array.isArray(items) ? items.join('\n') : (items || '');
    };

    const updateStrategy = (key: string, value: string) => {
        setEditedStrategies({ ...editedStrategies, [key]: value });
    };

    const exportar = async () => {
        if (!result) return;
        const html = `
            <h1>Estrategias DUA - Adecuacion Curricular</h1>
            <h2>Contexto</h2>
            <p><strong>Actividad:</strong> ${actividad}</p>
            <p><strong>Caracteristicas del estudiante:</strong> ${caracteristicas}</p>
            ${barreras ? `<p><strong>Barreras identificadas:</strong> ${barreras}</p>` : ''}
            
            <h2>Principio 1: Representacion</h2>
            <p>${getStrategyContent('representacion').replace(/\n/g, '<br/>')}</p>
            
            <h2>Principio 2: Accion y Expresion</h2>
            <p>${getStrategyContent('accion_expresion').replace(/\n/g, '<br/>')}</p>
            
            <h2>Principio 3: Compromiso e Implicacion</h2>
            <p>${getStrategyContent('implicacion').replace(/\n/g, '<br/>')}</p>
            
            ${result.actividad_adaptada ? `<h2>Actividad Adaptada</h2><p>${result.actividad_adaptada}</p>` : ''}
            ${result.recomendaciones ? `<h2>Recomendaciones</h2><p>${result.recomendaciones}</p>` : ''}
        `;
        await exportToDocx(html, 'Estrategias_DUA');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl">
                    <PuzzlePieceIcon className="w-8 h-8 text-pink-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1a2e3b]">Asistente DUA</h1>
                    <p className="text-gray-500">Estrategias de Diseno Universal para el Aprendizaje</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-8 space-y-5">
                {/* Actividad original */}
                <div>
                    <label className="block text-sm font-semibold text-[#1a2e3b] mb-2">
                        Actividad Original <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="input-field w-full"
                        rows={3}
                        placeholder="Describe la actividad que necesitas adaptar..."
                        value={actividad}
                        onChange={e => setActividad(e.target.value)}
                    />
                </div>
                
                {/* Caracteristicas del estudiante - OBLIGATORIO */}
                <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200/50">
                    <label className="block text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
                        <UserIcon className="w-4 h-4" />
                        Caracteristicas del Estudiante <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="input-field w-full bg-white"
                        rows={3}
                        placeholder="Describe las caracteristicas, fortalezas, intereses y necesidades del estudiante. Ej: Estudiante de 10 anos con TDAH, muy creativo, le gustan los videojuegos, dificultad para mantener atencion en tareas escritas prolongadas..."
                        value={caracteristicas}
                        onChange={e => setCaracteristicas(e.target.value)}
                    />
                    <p className="text-xs text-amber-700 mt-2">
                        Esta informacion es crucial para generar estrategias personalizadas y efectivas.
                    </p>
                </div>
                
                {/* Barreras identificadas - Opcional */}
                <div>
                    <label className="block text-sm font-semibold text-[#1a2e3b] mb-2 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-gray-400" />
                        Barreras Identificadas <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                        className="input-field w-full"
                        rows={2}
                        placeholder="Ej: Dificultad para leer textos largos, se distrae con ruido ambiental..."
                        value={barreras}
                        onChange={e => setBarreras(e.target.value)}
                    />
                </div>
                
                <button
                    onClick={generar}
                    disabled={loading || !actividad.trim() || !caracteristicas.trim()}
                    className="btn-gold w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg> 
                            Generando estrategias personalizadas...
                        </>
                    ) : (
                        <>
                            <HeartIcon className="w-5 h-5" /> 
                            Generar Estrategias DUA
                        </>
                    )}
                </button>
            </div>

            {loading && (
                <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`glass-card rounded-2xl p-5 ${i === 1 ? 'ai-generating' : ''}`}>
                            <div className="skeleton h-6 w-2/3 rounded mb-4"></div>
                            <div className="skeleton h-24 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            )}

            {result && !result.error && !loading && (
                <div className="space-y-6">
                    {/* 3 Principios DUA */}
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Representacion */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 bg-blue-50 flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                                    <EyeIcon className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-blue-800 text-sm">Representacion</h3>
                            </div>
                            <div className="p-4">
                                <textarea
                                    className="editable-area w-full text-sm resize-none"
                                    rows={6}
                                    value={getStrategyContent('representacion')}
                                    onChange={e => updateStrategy('representacion', e.target.value)}
                                    placeholder="Estrategias de representacion..."
                                />
                            </div>
                        </div>
                        
                        {/* Accion y Expresion */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 bg-green-50 flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                                    <HandRaisedIcon className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-green-800 text-sm">Accion/Expresion</h3>
                            </div>
                            <div className="p-4">
                                <textarea
                                    className="editable-area w-full text-sm resize-none"
                                    rows={6}
                                    value={getStrategyContent('accion_expresion')}
                                    onChange={e => updateStrategy('accion_expresion', e.target.value)}
                                    placeholder="Estrategias de accion y expresion..."
                                />
                            </div>
                        </div>
                        
                        {/* Compromiso */}
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="p-4 bg-purple-50 flex items-center gap-2">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                                    <SparklesIcon className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-purple-800 text-sm">Compromiso</h3>
                            </div>
                            <div className="p-4">
                                <textarea
                                    className="editable-area w-full text-sm resize-none"
                                    rows={6}
                                    value={getStrategyContent('implicacion')}
                                    onChange={e => updateStrategy('implicacion', e.target.value)}
                                    placeholder="Estrategias de compromiso..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actividad Adaptada */}
                    {result.actividad_adaptada && (
                        <div className="glass-card rounded-2xl p-5 bg-amber-50/30 border border-amber-200/50">
                            <h4 className="font-semibold text-amber-800 mb-3">Actividad Adaptada</h4>
                            <p className="text-gray-700">{result.actividad_adaptada}</p>
                        </div>
                    )}

                    {/* Recomendaciones */}
                    {result.recomendaciones && (
                        <div className="glass-card rounded-2xl p-5">
                            <h4 className="font-semibold text-[#1a2e3b] mb-3">Recomendaciones Adicionales</h4>
                            <p className="text-gray-600 text-sm">{result.recomendaciones}</p>
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={exportar}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 flex items-center gap-2 transition-all"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" /> Exportar DOCX
                        </button>
                    </div>
                </div>
            )}

            {result?.error && (
                <div className="glass-card rounded-2xl p-4 bg-red-50 text-red-700 border border-red-200">
                    {result.error}
                </div>
            )}
        </div>
    );
}
