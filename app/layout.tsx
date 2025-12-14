import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { BookOpen, Layout, Library, BarChart3, Settings, LogOut } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ProfeIC - Suite Docente',
    description: 'Plataforma de Inteligencia Artificial para Docentes',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={`${inter.className} bg-slate-50 text-slate-800`}>
                <div className="flex h-screen overflow-hidden">
                    {/* --- SIDEBAR GLOBAL --- */}
                    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col flex-shrink-0 transition-all duration-300 z-50">
                        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">ProfeIC</span>
                        </div>

                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            <p className="text-xs font-bold text-slate-500 uppercase px-4 mb-2 mt-4">Herramientas</p>

                            <Link href="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
                                <Layout className="w-5 h-5" />
                                <span className="font-medium">Dashboard</span>
                            </Link>

                            <Link href="/planificador" className="flex items-center gap-3 px-4 py-3 text-indigo-300 bg-indigo-900/20 border border-indigo-900/50 rounded-xl transition-colors">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-medium">Planificador IA</span>
                            </Link>

                            <Link href="/biblioteca" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white rounded-xl transition-colors">
                                <Library className="w-5 h-5" />
                                <span className="font-medium">Biblioteca</span>
                            </Link>

                            <div className="pt-4 mt-4 border-t border-slate-800">
                                <p className="text-xs font-bold text-slate-500 uppercase px-4 mb-2">Análisis</p>
                                <div className="flex items-center gap-3 px-4 py-3 text-slate-500 cursor-not-allowed">
                                    <BarChart3 className="w-5 h-5" />
                                    <span>Analizador DOK</span>
                                </div>
                            </div>
                        </nav>

                        <div className="p-4 border-t border-slate-800">
                            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 transition-colors w-full">
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </div>
                    </aside>

                    {/* --- CONTENIDO PRINCIPAL --- */}
                    <main className="flex-1 overflow-y-auto relative">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    )
}