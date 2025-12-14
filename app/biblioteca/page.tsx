"use client";
import { useState, useEffect } from "react";
import { SUPABASE_BASE_URL, getHeaders } from "@/lib/api";
import { exportAssessmentToDocx, exportRubricToDocx, exportContentToPDF } from "@/lib/exportUtils";
import {
    ArchiveBoxIcon, BookOpenIcon, ClipboardDocumentCheckIcon,
    ScaleIcon, TrashIcon, EyeIcon, DocumentArrowDownIcon, XMarkIcon,
    FunnelIcon, AcademicCapIcon
} from "@heroicons/react/24/outline";

type ResourceType = 'planificacion' | 'evaluacion' | 'rubrica' | 'clase' | 'all';

export default function BibliotecaPage() {
    const [resources, setResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState<any>(null);
    const [filterType, setFilterType] = useState<ResourceType>('all');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const res = await fetch(`${SUPABASE_BASE_URL}/rest/v1/resources?order=created_at.desc`, {
                headers: getHeaders()
            });
            const data = await res.json();
            setResources(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error cargando recursos");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Eliminar este recurso?")) return;
        try {
            await fetch(`${SUPABASE_BASE_URL}/rest/v1/resources?id=eq.${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            setResources(resources.filter(r => r.id !== id));
        } catch (e) {
            alert("Error eliminando recurso");
        }
    };

    const handleExportPDF = (resource: any) => {
        const content = typeof resource.contenido === 'string' 
            ? JSON.parse(resource.contenido) 
            : resource.contenido;
        
        let textContent = '';
        if (content.clases) {
            textContent = content.clases.map((c: any, i: number) => 
                `CLASE ${i+1}: ${c.titulo_clase}\n${c.objetivo}\n\n` +
                `1. Expectacion: ${c.paso_1_expectacion?.descripcion || ''}\n` +
                `2. Niveles: Insuficiente-Elemental-Adecuado\n` +
                `3. Modelamiento: ${c.paso_3_modelamiento?.descripcion || ''}\n` +
                `4. Practica Guiada: ${c.paso_4_practica_guiada?.descripcion || ''}\n` +
                `5. Practica Deliberada: ${c.paso_5_practica_deliberada?.descripcion || ''}\n` +
                `6. Retroalimentacion: ${c.paso_6_retroalimentacion?.descripcion || ''}\n` +
                `7. Ticket Salida\n`
            ).join('\n---\n\n');
        } else {
            textContent = JSON.stringify(content, null, 2);
        }
        
        exportContentToPDF(resource.titulo, textContent, resource.titulo.replace(/\s+/g, '_'));
    };

    const handleExportDOCX = async (resource: any) => {
        const content = typeof resource.contenido === 'string' 
            ? JSON.parse(resource.contenido) 
            : resource.contenido;
        
        if (resource.tipo === 'evaluacion' && content.items) {
            await exportAssessmentToDocx(content, resource.titulo.replace(/\s+/g, '_'));
        } else if (resource.tipo === 'rubrica' && content.tabla) {
            await exportRubricToDocx(content, resource.titulo.replace(/\s+/g, '_'));
        } else {
            // Generar HTML para planificaciones
            const htmlContent = `<h1>${resource.titulo}</h1><p>${JSON.stringify(content, null, 2)}</p>`;
            const { exportToDocx } = await import('@/lib/exportUtils');
            await exportToDocx(htmlContent, resource.titulo.replace(/\s+/g, '_'));
        }
    };

    const getIcon = (tipo: string) => {
        switch(tipo) {
            case 'planificacion': return <BookOpenIcon className="w-6 h-6 text-blue-600" />;
            case 'evaluacion': return <ClipboardDocumentCheckIcon className="w-6 h-6 text-green-600" />;
            case 'rubrica': return <ScaleIcon className="w-6 h-6 text-purple-600" />;
            case 'clase': return <AcademicCapIcon className="w-6 h-6 text-amber-600" />;
            default: return <ArchiveBoxIcon className="w-6 h-6 text-gray-600" />;
        }
    };

    const getColor = (tipo: string) => {
        switch(tipo) {
            case 'planificacion': return "bg-blue-50 border-blue-200 hover:border-blue-400";
            case 'evaluacion': return "bg-green-50 border-green-200 hover:border-green-400";
            case 'rubrica': return "bg-purple-50 border-purple-200 hover:border-purple-400";
            case 'clase': return "bg-amber-50 border-amber-200 hover:border-amber-400";
            default: return "bg-gray-50 border-gray-200";
        }
    };

    const filteredResources = filterType === 'all' 
        ? resources 
        : resources.filter(r => r.tipo === filterType);

    const filterButtons: { type: ResourceType; label: string }[] = [
        { type: 'all', label: 'Todos' },
        { type: 'planificacion', label: 'Planificaciones' },
        { type: 'evaluacion', label: 'Evaluaciones' },
        { type: 'rubrica', label: 'Rubricas' },
        { type: 'clase', label: 'Clases' },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                    <ArchiveBoxIcon className="w-8 h-8 text-amber-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-[#1a2e3b]">Biblioteca Docente</h1>
                    <p className="text-gray-500">Recursos guardados automaticamente al generar</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="mb-6 flex items-center gap-3 flex-wrap">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
                {filterButtons.map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => setFilterType(btn.type)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            filterType === btn.type
                                ? 'bg-[#1a2e3b] text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#f2ae60]'
                        }`}
                    >
                        {btn.label}
                    </button>
                ))}
                <span className="ml-auto text-sm text-gray-400">{filteredResources.length} recursos</span>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-500">Sin recursos</h3>
                    <p className="text-gray-400">Los recursos se guardan automaticamente al generarlos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredResources.map((resource) => (
                        <div key={resource.id} className={`p-6 rounded-2xl border-2 transition-all duration-300 ${getColor(resource.tipo)}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    {getIcon(resource.tipo)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded-lg capitalize">
                                        {resource.tipo}
                                    </span>
                                    <button 
                                        onClick={() => handleDelete(resource.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-[#1a2e3b] mb-1 line-clamp-2">{resource.titulo}</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                <span className="font-semibold">{resource.nivel}</span> 
                                {resource.asignatura && ` - ${resource.asignatura}`}
                            </p>
                            <p className="text-xs text-gray-400 mb-4">
                                {new Date(resource.created_at).toLocaleDateString('es-CL', { 
                                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>

                            <div className="flex gap-2 border-t border-gray-200/50 pt-4">
                                <button 
                                    onClick={() => setSelectedResource(resource)}
                                    className="flex-1 py-2 bg-white rounded-lg text-sm font-bold text-gray-600 hover:text-[#1a2e3b] hover:shadow transition-all flex items-center justify-center gap-1"
                                >
                                    <EyeIcon className="w-4 h-4" /> Ver
                                </button>
                                <button 
                                    onClick={() => handleExportPDF(resource)}
                                    className="py-2 px-3 bg-red-50 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100 transition-all"
                                    title="Exportar PDF"
                                >
                                    PDF
                                </button>
                                <button 
                                    onClick={() => handleExportDOCX(resource)}
                                    className="py-2 px-3 bg-blue-50 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100 transition-all"
                                    title="Exportar DOCX"
                                >
                                    DOCX
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Vista Previa */}
            {selectedResource && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-[#1a2e3b]">{selectedResource.titulo}</h2>
                                <p className="text-sm text-gray-500">{selectedResource.nivel} - {selectedResource.asignatura}</p>
                            </div>
                            <button onClick={() => setSelectedResource(null)} className="p-2 hover:bg-gray-200 rounded-full">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-6">
                            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-xl font-mono">
                                {JSON.stringify(
                                    typeof selectedResource.contenido === 'string' 
                                        ? JSON.parse(selectedResource.contenido) 
                                        : selectedResource.contenido, 
                                    null, 2
                                )}
                            </pre>
                        </div>
                        <div className="bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
                            <button onClick={() => setSelectedResource(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                                Cerrar
                            </button>
                            <button 
                                onClick={() => handleExportPDF(selectedResource)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" /> PDF
                            </button>
                            <button 
                                onClick={() => handleExportDOCX(selectedResource)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5" /> DOCX
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
