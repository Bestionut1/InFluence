import { useState } from 'react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Download, FileImage, FileText } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';

export const ExportMenu = ({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslation();

  const downloadImage = async () => {
    if (!targetRef.current) return;
    try {
        // Only export the canvas area (genogram content), not the entire page
        const dataUrl = await toPng(targetRef.current, { 
          backgroundColor: '#0F172A',
          pixelRatio: 2, // Higher quality
        });
        const link = document.createElement('a');
        link.download = `genogram_${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Error exporting image:', err);
    }
  };

  const downloadPDF = async () => {
    if (!targetRef.current) return;
    try {
        // Only export the canvas area (genogram content), not the entire page
        const dataUrl = await toPng(targetRef.current, { 
          backgroundColor: '#0F172A',
          pixelRatio: 2, // Higher quality
        });
        const pdf = new jsPDF({ orientation: 'landscape' });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`genogram_${new Date().getTime()}.pdf`);
    } catch (err) {
        console.error('Error exporting PDF:', err);
    }
  };

  return (
    <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-ocean-800 rounded text-ocean-300 transition-colors" 
            title={t.export.title}
        >
            <Download className="w-5 h-5" />
        </button>

        {isOpen && (
            <div className="absolute top-full right-0 mt-2 bg-deep-surface border border-ocean-800 rounded-lg shadow-xl py-2 w-48 z-50">
                <button 
                    onClick={() => { downloadImage(); setIsOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-ocean-900 text-ocean-100 flex items-center gap-2"
                >
                    <FileImage className="w-4 h-4" /> {t.export.downloadPNG}
                </button>
                <button 
                    onClick={() => { downloadPDF(); setIsOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-ocean-900 text-ocean-100 flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" /> {t.export.downloadPDF}
                </button>
            </div>
        )}
    </div>
  );
};
