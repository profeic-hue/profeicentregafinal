'use client';
import Link from 'next/link';
import { BookOpen, Library, Sparkles, ArrowRight, Brain } from 'lucide-react';

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-20 md:p-12">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Hola, Director</h1>
                        <p className="text-slate-500 text-lg">¿Qué vamos a crear hoy en el Colegio Madre Paulina?</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-600 uppercase">Sistema Operativo</span>
                    </div>
                </div>

                {/* Grid de Herramientas */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {/* TARJETA PLANIFICADOR */}
                    <Link href="/planificador" className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-indigo-100 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Planificador IA</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">Crea unidades didácticas completas alineadas al currículum nacional en segundos.</p>
                            <div className="flex items-center text-indigo-600 font-bold group-hover:gap-2 transition-all">
                                Comenzar <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* TARJETA BIBLIOTECA */}
                    <Link href="/biblioteca" className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl hover:shadow-2xl border border-slate-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-emerald-100 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                <Library className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Biblioteca</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">Gestiona tus planificaciones, evaluaciones y rúbricas guardadas.</p>
                            <div className="flex items-center text-emerald-600 font-bold group-hover:gap-2 transition-all">
                                Explorar <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </Link>

                    {/* TARJETA FUTURA */}
                    <div className="group relative bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-not-allowed">
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mb-6">
                                <Brain className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Mentor IA</h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">Asistente pedagógico para dudas curriculares y estrategias DUA. (Pronto)</p>
                            <div className="flex items-center text-slate-400 font-bold">
                                En desarrollo
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}