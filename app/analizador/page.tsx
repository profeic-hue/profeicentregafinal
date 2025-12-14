"use client";
import { useState } from "react";
import { 
    MagnifyingGlassCircleIcon, 
    ExclamationCircleIcon, 
    CheckCircleIcon, 
    ArrowTrendingUpIcon, 
    ChartBarIcon 
} from "@heroicons/react/24/outline";

const SUPABASE_URL = "https://oepgqbkhkkgwsoxqaxlk.supabase.co";

interface DistribucionItem {
  cantidad: number;
  porcentaje: number;
}

interface Reactivo {
  numero: number;
  texto_reactivo: string;
  nivel_bloom: string;
  nivel_dok: number;
  verbo_identificado: string;
  coherente: boolean;
  observacion: string;
}

interface AnalisisResult {
  total_reactivos: number;
  reactivos_analizados: Reactivo[];
  distribucion_bloom: Record<string, DistribucionItem>;
  distribucion_dok: Record<string, DistribucionItem>;
  habilidades_inferiores_porcentaje: number;
  habilidades_superiores_porcentaje: number;
  veredicto: {
    coherencia_general: string;
    mensaje_constructivo: string;
    fortalezas: string[];
    areas_mejora: string[];
    sugerencias: string[];
  };
}

// Componente de grafico de rosca SVG
const DonutChart = ({ data, title, colors }: { data: Record<string, DistribucionItem>, title: string, colors: string[] }) => {
  const entries = Object.entries(data).filter(([, v]) => v.porcentaje > 0);
  const total = entries.reduce((acc, [, v]) => acc + v.porcentaje, 0);
  let currentAngle = 0;
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const createArc = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const start = {
      x: 100 + radius * Math.cos((startAngle - 90) * Math.PI / 180),
      y: 100 + radius * Math.sin((startAngle - 90) * Math.PI / 180)
    };
    const end = {
      x: 100 + radius * Math.cos((endAngle - 90) * Math.PI / 180),
      y: 100 + radius * Math.sin((endAngle - 90) * Math.PI / 180)
    };
    const innerStart = {
      x: 100 + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180),
      y: 100 + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180)
    };
    const innerEnd = {
      x: 100 + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180),
      y: 100 + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180)
    };
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-[#1e3a5f] mb-4 text-center">{title}</h3>
      <div className="relative">
        <svg viewBox="0 0 200 200" className="w-48 h-48 mx-auto">
          {entries.map(([key, value], index) => {
            const angle = (value.porcentaje / (total || 1)) * 360;
            const path = createArc(currentAngle, currentAngle + angle, hoveredIndex === index ? 85 : 80, 50);
            const arcCenter = currentAngle + angle / 2;
            currentAngle += angle;
            
            return (
              <g key={key}>
                <path
                  d={path}
                  fill={colors[index % colors.length]}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}
          <circle cx="100" cy="100" r="45" fill="white" />
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-[#1e3a5f]">
            {entries.reduce((acc, [, v]) => acc + v.cantidad, 0)}
          </text>
          <text x="100" y="112" textAnchor="middle" className="text-xs fill-gray-500">reactivos</text>
        </svg>
        
        {hoveredIndex !== null && entries[hoveredIndex] && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 bg-[#1e3a5f] text-white px-3 py-1.5 rounded-lg text-sm font-medium z-10 shadow-lg">
            {entries[hoveredIndex][0]}: {entries[hoveredIndex][1].porcentaje}%
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-4">
        {entries.map(([key, value], index) => (
          <div 
            key={key} 
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${hoveredIndex === index ? 'bg-gray-100' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
            <span className="text-xs text-gray-600 capitalize truncate">{key.replace('_', ' ')}</span>
            <span className="text-xs font-bold text-[#1e3a5f] ml-auto">{value.porcentaje}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalizadorPage() {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<AnalisisResult | null>(null);
  const [error, setError] = useState("");

  const bloomColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];
  const dokColors = ['#fca5a5', '#fcd34d', '#86efac', '#5eead4'];

  const analizar = async () => {
    if (!texto.trim()) return;
    setLoading(true);
    setError("");
    setResultado(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/analyze-assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto_prueba: texto })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResultado(data);
      }
    } catch (e) {
      setError("Error de conexion. Intenta nuevamente.");
    }
    setLoading(false);
  };

  const getCoherenciaColor = (nivel: string) => {
    switch (nivel?.toLowerCase()) {
      case 'alta': return 'bg-green-100 text-green-800 border-green-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-[#1e3a5f] rounded-xl text-white">
            <MagnifyingGlassCircleIcon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Analizador y Calibrador</h1>
            <p className="text-gray-500 text-sm">Analiza tu prueba por niveles Bloom y DOK</p>
          </div>
        </div>

        {!resultado ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <label className="block text-sm font-bold text-gray-600 mb-3">
              Pega el texto de tu prueba o evaluacion
            </label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Copia y pega aqui el contenido de tu prueba: preguntas, items, instrucciones..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 text-gray-700"
            />
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                <ExclamationCircleIcon className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={analizar}
              disabled={loading || !texto.trim()}
              className="mt-6 w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#2a4a73] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Analizando...</>
              ) : (
                <><ChartBarIcon className="w-5 h-5" /> Analizar Evaluacion</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Boton volver */}
            <button
              onClick={() => { setResultado(null); setTexto(""); }}
              className="text-[#1e3a5f] font-medium hover:underline"
            >
              Analizar otra evaluacion
            </button>

            {/* Graficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DonutChart 
                data={resultado.distribucion_bloom} 
                title="Distribucion Taxonomia Bloom" 
                colors={bloomColors}
              />
              <DonutChart 
                data={resultado.distribucion_dok} 
                title="Distribucion Niveles DOK" 
                colors={dokColors}
              />
            </div>

            {/* Balance de habilidades */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1e3a5f] mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5" /> Balance de Habilidades
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-orange-50 p-4 rounded-xl">
                  <p className="text-sm text-orange-700 font-medium">Habilidades Inferiores</p>
                  <p className="text-3xl font-bold text-orange-600">{resultado.habilidades_inferiores_porcentaje}%</p>
                  <p className="text-xs text-orange-500 mt-1">Recordar, Comprender, Aplicar</p>
                </div>
                <div className="flex-1 bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-green-700 font-medium">Habilidades Superiores</p>
                  <p className="text-3xl font-bold text-green-600">{resultado.habilidades_superiores_porcentaje}%</p>
                  <p className="text-xs text-green-500 mt-1">Analizar, Evaluar, Crear</p>
                </div>
              </div>
            </div>

            {/* Veredicto */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-[#1e3a5f] flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" /> Veredicto de Coherencia Constructiva
                </h3>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getCoherenciaColor(resultado.veredicto.coherencia_general)}`}>
                  {resultado.veredicto.coherencia_general}
                </span>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed bg-blue-50 p-4 rounded-xl">
                {resultado.veredicto.mensaje_constructivo}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <h4 className="font-bold text-green-800 text-sm mb-2">Fortalezas</h4>
                  <ul className="space-y-1">
                    {resultado.veredicto.fortalezas?.map((f, i) => (
                      <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">+</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <h4 className="font-bold text-amber-800 text-sm mb-2">Areas de Mejora</h4>
                  <ul className="space-y-1">
                    {resultado.veredicto.areas_mejora?.map((a, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">!</span> {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-bold text-blue-800 text-sm mb-2">Sugerencias</h4>
                  <ul className="space-y-1">
                    {resultado.veredicto.sugerencias?.map((s, i) => (
                      <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">*</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tabla de reactivos */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
              <h3 className="font-bold text-[#1e3a5f] mb-4">Analisis Reactivo por Reactivo</h3>
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">#</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Reactivo</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Bloom</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">DOK</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Verbo</th>
                    <th className="text-left py-3 px-2 text-xs font-bold text-gray-500 uppercase">Coherente</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.reactivos_analizados?.map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 text-sm font-bold text-gray-400">{r.numero}</td>
                      <td className="py-3 px-2 text-sm text-gray-700 max-w-xs truncate" title={r.texto_reactivo}>{r.texto_reactivo}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {r.nivel_bloom}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          DOK {r.nivel_dok}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600 italic">{r.verbo_identificado}</td>
                      <td className="py-3 px-2">
                        {r.coherente ? (
                          <span className="text-green-600 font-bold text-sm">Si</span>
                        ) : (
                          <span className="text-red-600 font-bold text-sm">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
