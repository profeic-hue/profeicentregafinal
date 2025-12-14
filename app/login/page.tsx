// UBICACIÓN: app/login/page.tsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-t-4 border-indigo-600">
                <CardHeader className="text-center space-y-4 pb-2">
                    {/* AQUÍ ESTÁ EL CAMBIO: Usamos tu insignia automáticamente */}
                    <div className="flex justify-center mb-2">
                        <div className="relative w-32 h-32 md:w-40 md:h-40">
                            <Image
                                src="/insignia.png"
                                alt="Insignia Colegio Madre Paulina"
                                fill
                                className="object-contain drop-shadow-md"
                                priority
                            />
                        </div>
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold text-indigo-900">Bienvenido a ProfeIC</CardTitle>
                        <CardDescription className="text-gray-500 mt-1">
                            Plataforma de Gestión Pedagógica Inteligente
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm text-center border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Correo Institucional</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nombre@colegiomadrepaulina.cl"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-9"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-indigo-700 hover:bg-indigo-800 text-white h-11 font-medium transition-colors"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Ingresar al Sistema'}
                        </Button>

                        <div className="text-center text-xs text-gray-400 mt-4">
                            © 2025 Colegio Madre Paulina • Powered by ProfeIC
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}