"use client";
import { useState } from "react";
import { ArrowTrendingUpIcon, LightBulbIcon, PencilSquareIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { postAPI, API } from "@/lib/api";
import { exportToDocx } from "@/lib/exportUtils";

export default function ElevadorPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [pregunta, setPregunta] = useState("");
    const [nivelActual, setNivelActual] = useState(1);
    const [editedNivel3, setEditedNivel3] = useState("");
    const [editedNivel4, setEditedNivel4] = useState("");

    const elevar = async () => {
        if (!pregunta.trim()) return;
        setLoading(true);
        setResult(null);
        setEditedNivel3("");
        setEditedNivel4("");
        try {
            const res = await postAPI(API.ELEVADOR_DOK, { pregunta, nivel_actual: nivelActual });
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

    const getNivel3Content = () => editedNivel3 || result?.nivel_3 || "";
    const getNivel4Content = () => editedNivel4 || result?.nivel_4 || "";

    const exportar = async () => {
        if (!result) return;
        const html = `
            <h1>Elevador Cognitivo DOK</h1>
            <h2>Actividad Original (DOK ${nivelActual})</h2>
            <p>${pregunta}</p>
            <p><em>${result.analisis}</em></p>
            <h2>Nivel 3: Estrategico</h2>
            <p>${getNivel3Content()}</p>
            <h2>Nivel 4: Extendido</h2>
            <p>${getNivel4Content()}</p>
        `;
        await exportToDocx(html, 'Elevador_DOK');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl">
                    <ArrowTrendingUpIcon className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[#1a2e3b]">Elevador DOK</h1>
                    <p className="text-gray-500">Transforma actividades a nivel cognitivo 3-4</p>
                </div>
            </div>

            <div className="glass-card rounded-2xl p-6 mb-8">
                <div className="mb-4">
                    <label className="font-semibold text-sm mb-2 block text-[#1a2e3b]">Actividad o Pregunta Original</label>
                    <textarea
                        className="input-field w-full"
                        rows={4}
                        placeholder="Ej: Pinta el mapa de Chile con los colores de cada zona climatica..."
                        value={pregunta}
                        onChange={e => setPregunta(e.target.value)}
                    />
                </div>
                
                <div className="mb-6">
                    <label className="font-semibold text-sm mb-3 block text-[#1a2e3b]">Nivel DOK Actual</label>
                    <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(n => (
                            <button
                                key={n}
                                onClick={() => setNivelActual(n)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    nivelActual === n 
                                        ? 'border-[#f2ae60] bg-[#f2ae60]/10 text-[#1a2e3b]' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-bold text-lg">DOK {n}</div>
                                <div className="text-xs text-gray-500">
                                    {n === 1 && 'Recordar'}
                                    {n === 2 && 'Aplicar'}
                                    {n === 3 && 'Estrategico'}
                                    {n === 4 && 'Extendido'}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <button
                    onClick={elevar}
                    disabled={loading || !pregunta.trim()}
                    className="btn-gold w-full flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg> 
                            Elevando nivel cognitivo...
                        </>
                    ) : (
                        <>
                            <ArrowTrendingUpIcon className="w-5 h-5" /> 
                            Elevar a Nivel 3-4
                        </>
                    )}
                </button>
            </div>

            {loading && (
                <div className="space-y-4">
                    <div className="glass-card rounded-2xl p-6 ai-generating">
                        <div className="skeleton h-6 w-1/3 rounded mb-4"></div>
                        <div className="skeleton h-20 rounded-xl"></div>
                    </div>
                    <div className="glass-card rounded-2xl p-6">
                        <div className="skeleton h-6 w-1/3 rounded mb-4"></div>
                        <div className="skeleton h-20 rounded-xl"></div>
                    </div>
                </div>
            )}

            {result && !result.error && !loading && (
                <div className="space-y-6">
                    {/* Analisis */}
                    <div className="glass-card rounded-2xl p-5 bg-gray-50/50">
                        <p className="text-sm text-gray-600">
                            <strong>Analisis:</strong> {result.original_dok || `Actividad original en DOK ${nivelActual}`}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">{result.analisis}</p>
                    </div>

                    {/* Nivel 3 - Editable */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-4 bg-blue-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl text-white">
                                    <LightBulbIcon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-blue-800">Nivel 3: Pensamiento Estrategico</h3>
                            </div>
                            <span className="badge badge-dok">DOK 3</span>
                        </div>
                        <div className="p-6">
                            <textarea
                                className="editable-area w-full resize-none"
                                rows={4}
                                value={getNivel3Content()}
                                onChange={e => setEditedNivel3(e.target.value)}
                                placeholder="Contenido generado..."
                            />
                        </div>
                    </div>

                    {/* Nivel 4 - Editable */}
                    <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="p-4 bg-purple-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
                                    <LightBulbIcon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-purple-800">Nivel 4: Pensamiento Extendido</h3>
                            </div>
                            <span className="badge badge-dok">DOK 4</span>
                        </div>
                        <div className="p-6">
                            <textarea
                                className="editable-area w-full resize-none"
                                rows={4}
                                value={getNivel4Content()}
                                onChange={e => setEditedNivel4(e.target.value)}
                                placeholder="Contenido generado..."
                            />
                        </div>
                    </div>

                    {/* Explicacion de cambios */}
                    {result.explicacion && (
                        <div className="glass-card rounded-2xl p-5 bg-amber-50/50 border border-amber-200/50">
                            <h4 className="font-semibold text-amber-800 mb-2">Cambios realizados:</h4>
                            <p className="text-sm text-amber-900">{result.explicacion}</p>
                        </div>
                    )}

                    {/* Botones de accion */}
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
