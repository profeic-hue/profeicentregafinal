import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: "No hay API Key configurada" }, { status: 500 });
    }

    try {
        // Consulta directa a la API de Google para listar modelos disponibles
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        return NextResponse.json({
            status: response.status,
            mis_modelos: data
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}