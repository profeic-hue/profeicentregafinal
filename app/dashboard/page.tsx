"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useEffect, useState } from "react";
import {
    ChatBubbleLeftRightIcon,
    BookOpenIcon,
    ClipboardDocumentCheckIcon,
    ScaleIcon,
    ArrowTrendingUpIcon,
    PuzzlePieceIcon,
    ArchiveBoxIcon,
    ChartPieIcon,
    ClockIcon
} from "@heroicons/react/24/outline";

interface RecentItem {
    id: string;
    type: string;
    title: string;
    created_at: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
    const [stats, setStats] = useState({ planificaciones: 0, evaluaciones: 0, rubricas: 0, clases: 0 });

    const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

    useEffect(() => {
        const saved = localStorage.getItem('profeic_resources');
        if (saved) {
            const resources = JSON.parse(saved);
            const recent = resources.slice(-5).reverse();
            setRecentItems(recent);
            
            const counts = { planificaciones: 0, evaluaciones: 0, rubricas: 0, clases: 0 };
            resources.forEach((r: RecentItem) => {
                if (r.type === 'planificacion') counts.planificaciones++;
                else if (r.type === 'evaluacion') counts.evaluaciones++;
                else if (r.type === 'rubrica') counts.rubricas++;
                else if (r.type === 'clase') counts.clases++;
            });
            setStats(counts);
        }
    }, []);

    const tools = [
        { name: "Planificador", href: "/planificador", icon: BookOpenIcon, gradient: "from-blue-500/10 to-indigo-500/10", iconColor: "text-blue-600", desc: "Unidades didacticas" },
        { name: "Evaluaciones", href: "/evaluaciones", icon: ClipboardDocumentCheckIcon, gradient: "from-emerald-500/10 to-green-500/10", iconColor: "text-emerald-600", desc: "Pruebas y reactivos" },
        { name: "Rubricas", href: "/rubricas", icon: ScaleIcon, gradient: "from-teal-500/10 to-cyan-500/10", iconColor: "text-teal-600", desc: "Criterios evaluacion" },
        { name: "Analizador", href: "/analizador", icon: ChartPieIcon, gradient: "from-amber-500/10 to-orange-500/10", iconColor: "text-amber-600", desc: "Coherencia Bloom/DOK" },
        { name: "Mentor IA", href: "/mentor", icon: ChatBubbleLeftRightIcon, gradient: "from-purple-500/10 to-pink-500/10", iconColor: "text-purple-600", desc: "Consultas pedagogicas" },
        { name: "Elevador DOK", href: "/elevador-cognitivo", icon: ArrowTrendingUpIcon, gradient: "from-orange-500/10 to-red-500/10", iconColor: "text-orange-600", desc: "Nivel cognitivo 3-4" },
        { name: "Asistente DUA", href: "/asistente-nee", icon: PuzzlePieceIcon, gradient: "from-pink-500/10 to-rose-500/10", iconColor: "text-pink-600", desc: "Inclusion y diversidad" },
        { name: "Biblioteca", href: "/biblioteca", icon: ArchiveBoxIcon, gradient: "from-gray-500/10 to-slate-500/10", iconColor: "text-gray-600", desc: "Recursos guardados" },
    ];

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'planificacion': return 'Planificacion';
            case 'evaluacion': return 'Evaluacion';
            case 'rubrica': return 'Rubrica';
            case 'clase': return 'Clase';
            default: return type;
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header con saludo EXACTO */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <div className="relative w-14 h-14">
                        <Image src="/insignia.png" alt="ProfeIC" fill className="object-contain" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a2e3b]">
                            Hola Profe! En que trabajaremos hoy?
                        </h1>
                        <p className="text-gray-500 capitalize">{today}</p>
                    </div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Actividad Reciente */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ClockIcon className="w-5 h-5 text-[#f2ae60]" />
                        <h2 className="font-semibold text-[#1a2e3b]">Actividad Reciente</h2>
                    </div>
                    {recentItems.length > 0 ? (
                        <div className="space-y-3">
                            {recentItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                                    <div className="w-2 h-2 rounded-full bg-[#f2ae60]"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                                        <p className="text-xs text-gray-400">{getTypeLabel(item.type)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <ArchiveBoxIcon className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Sin actividad reciente</p>
                        </div>
                    )}
                    <Link href="/biblioteca" className="mt-4 block text-center text-sm text-[#f2ae60] hover:underline font-medium">
                        Ver biblioteca completa
                    </Link>
                </div>

                {/* Estadisticas */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <h2 className="font-semibold text-[#1a2e3b] mb-4">Tus Recursos</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Link href="/planificador" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                            <p className="text-3xl font-bold text-blue-600">{stats.planificaciones}</p>
                            <p className="text-xs text-gray-500 mt-1">Planificaciones</p>
                        </Link>
                        <Link href="/evaluaciones" className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                            <p className="text-3xl font-bold text-emerald-600">{stats.evaluaciones}</p>
                            <p className="text-xs text-gray-500 mt-1">Evaluaciones</p>
                        </Link>
                        <Link href="/rubricas" className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                            <p className="text-3xl font-bold text-teal-600">{stats.rubricas}</p>
                            <p className="text-xs text-gray-500 mt-1">Rubricas</p>
                        </Link>
                        <Link href="/biblioteca" className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
                            <p className="text-3xl font-bold text-violet-600">{stats.clases}</p>
                            <p className="text-xs text-gray-500 mt-1">Clases</p>
                        </Link>
                    </div>
                </div>

                {/* Grid de herramientas CLICKEABLES */}
                <div className="lg:col-span-3">
                    <h2 className="font-semibold text-[#1a2e3b] mb-4">Herramientas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tools.map((tool) => (
                            <Link
                                key={tool.name}
                                href={tool.href}
                                className="glass-card group flex items-center gap-4 p-5 rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                            >
                                <div className={`p-3.5 rounded-xl bg-gradient-to-br ${tool.gradient} ${tool.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                                    <tool.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[#1a2e3b] text-sm group-hover:text-[#f2ae60] transition-colors">
                                        {tool.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-0.5">{tool.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
                <p className="text-xs text-gray-400">ProfeIC Suite - Colegio Madre Paulina</p>
                <p className="text-xs text-gray-300 mt-1">Unidad Tecnico Pedagogica 2025</p>
            </div>
        </div>
    );
}
