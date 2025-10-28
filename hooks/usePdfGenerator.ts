import { useState, useCallback, RefObject } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { COLORS } from '../constants';
import type { ScaleDetails } from '../types';

const CAPTURE_DELAY = 100;

export const usePdfGenerator = (
    pdfContentRef: RefObject<HTMLDivElement>,
    scaleDetails: ScaleDetails | null
) => {
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    const generatePdf = useCallback(async () => {
        if (!pdfContentRef.current || !scaleDetails?.overview) {
            setPdfError('Content is not available for PDF generation.');
            return;
        }

        setIsSavingPdf(true);
        setPdfError(null);

        await new Promise((resolve) => setTimeout(resolve, CAPTURE_DELAY));

        try {
            const elementToCapture = pdfContentRef.current;
            const canvas = await html2canvas(elementToCapture, {
                scale: 2, backgroundColor: COLORS.bgPrimary, useCORS: true, logging: false,
            });

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfPageHeight = pdf.internal.pageSize.getHeight();
            const ratio = canvas.width / pdfWidth;
            let position = 0;

            while (position < canvas.height) {
                const sliceHeight = Math.min(pdfPageHeight * ratio, canvas.height - position);
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sliceHeight;
                const context = pageCanvas.getContext('2d');
                if (context) {
                    context.drawImage(canvas, 0, position, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
                }

                if (position > 0) pdf.addPage();
                pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, 0, undefined, 'FAST');
                position += sliceHeight;
            }

            pdf.save(`${scaleDetails.overview.title.replace(/\s+/g, '_')}_Guitar_Scale_Guru.pdf`);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'An unknown error occurred';
            console.error('Failed to save PDF', e);
            setPdfError(message);
        } finally {
            setIsSavingPdf(false);
        }
    }, [scaleDetails, pdfContentRef]);

    return { isSavingPdf, pdfError, generatePdf };
};
