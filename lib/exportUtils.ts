import { saveAs } from 'file-saver';
import { Packer, Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

// --- EXPORTAR EVALUACIÓN A DOCX ---
export const exportAssessmentToDocx = async (assessment: any) => {
    try {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        children: [new TextRun({ text: assessment.title || "Evaluación", bold: true })]
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Asignatura: ${assessment.subject} | Nivel: ${assessment.grade}`, bold: true })
                        ]
                    }),
                    new Paragraph({ text: "" }), // Espacio
                    ...(assessment.questions || []).map((q: any, i: number) => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: `${i + 1}. ${q.question_text}`, bold: true })
                            ]
                        }),
                        new Paragraph({ text: "" })
                    ]).flat()
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Evaluacion_${assessment.id || 'Generada'}.docx`);
    } catch (e) {
        console.error("Error DOCX:", e);
        alert("Error al exportar DOCX");
    }
};

// --- EXPORTAR RÚBRICA A DOCX ---
export const exportRubricToDocx = async (rubric: any) => {
    try {
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({
                        heading: HeadingLevel.HEADING_1,
                        children: [new TextRun({ text: rubric.title || "Rúbrica", bold: true })]
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Criterio", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Excelente", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bueno", bold: true })] })] }),
                                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Regular", bold: true })] })] }),
                                ]
                            }),
                            ...(rubric.criteria || []).map((c: any) =>
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph(c.name || "")] }),
                                        new TableCell({ children: [new Paragraph(c.levels?.excellent || "")] }),
                                        new TableCell({ children: [new Paragraph(c.levels?.good || "")] }),
                                        new TableCell({ children: [new Paragraph(c.levels?.fair || "")] }),
                                    ]
                                })
                            )
                        ]
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Rubrica_${rubric.id || 'Generada'}.docx`);
    } catch (e) {
        console.error("Error DOCX:", e);
    }
};

// --- EXPORTAR A PDF ---
export const exportContentToPDF = (content: any) => {
    try {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(content.title || "Documento", 10, 10);

        doc.setFontSize(12);
        if (content.body) {
            const splitText = doc.splitTextToSize(content.body, 180);
            doc.text(splitText, 10, 20);
        }

        doc.save(`Documento_${content.id || 'Generado'}.pdf`);
    } catch (e) {
        console.error("Error PDF:", e);
    }
};