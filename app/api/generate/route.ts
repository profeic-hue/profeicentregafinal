import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "No se encontró la API Key" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // MODELO PRINCIPAL: gemini-2.0-flash (El más potente que tienes habilitado)
        // Si este falla por cuota, podrías cambiar a 'gemini-2.0-flash-lite-preview-02-05'
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const body = await req.json();
        const result = await model.generateContent(body.prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ result: text });

    } catch (error: any) {
        console.error("❌ Error API Gemini:", error);

        let userMessage = "Error de conexión con la IA.";

        if (error.message?.includes("429")) {
            userMessage = "⚠️ Sistema saturado (Cuota Google). Espera 1 minuto y reintenta.";
        } else if (error.message?.includes("SAFETY")) {
            userMessage = "⚠️ El contenido fue bloqueado por filtros de seguridad.";
        }

        return NextResponse.json({ error: userMessage, details: error.message }, { status: 500 });
    }
}