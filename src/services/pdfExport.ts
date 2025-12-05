import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { TestResultWithMetadata } from './testResults';

/**
 * Export test result to PDF
 */
export const exportTestResultToPDF = async (
  result: TestResultWithMetadata,
  containerElementId?: string
) => {
  try {
    const element = containerElementId
      ? document.getElementById(containerElementId)
      : createResultsHTML(result);

    if (!element) {
      throw new Error('Could not find element to export');
    }

    // Create canvas from HTML
    const canvas = await html2canvas(element, {
      backgroundColor: '#0B1120',
      scale: 2,
    });

    // Create PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let heightLeft = imgHeight;
    let position = 0;

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    // Save PDF
    pdf.save(`${result.testName}-${result.createdAt.getTime()}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

/**
 * Create HTML representation of test results for export
 */
const createResultsHTML = (result: TestResultWithMetadata): HTMLElement => {
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.backgroundColor = '#0B1120';
  container.style.color = '#E0E9F0';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.width = '100%';
  container.style.maxWidth = '800px';

  // Header
  const header = document.createElement('div');
  header.style.marginBottom = '20px';
  header.style.borderBottom = '2px solid #FF9B5E';
  header.style.paddingBottom = '10px';
  header.innerHTML = `
    <h1 style="margin: 0; color: #FFFFFF; font-size: 24px;">${result.testName}</h1>
    <p style="margin: 5px 0; color: #B8C5D6; font-size: 14px;">
      Completed: ${result.createdAt.toLocaleDateString()}
    </p>
  `;
  container.appendChild(header);

  // Scores Section
  const scoresSection = document.createElement('div');
  scoresSection.style.marginBottom = '20px';
  scoresSection.innerHTML = '<h2 style="margin: 0 0 15px 0; color: #FFFFFF; font-size: 18px;">Scores</h2>';

  Object.entries(result.scores).forEach(([key, value]) => {
    const scoreItem = document.createElement('div');
    scoreItem.style.marginBottom = '10px';
    scoreItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span style="font-weight: bold; color: #FFFFFF;">${key.replace(/_/g, ' ')}</span>
        <span style="color: #FFFFFF; font-weight: bold;">${Math.round(value)}</span>
      </div>
      <div style="width: 100%; height: 10px; background-color: #1a2332; border-radius: 5px; overflow: hidden;">
        <div style="width: ${Math.min(value, 100)}%; height: 100%; background: linear-gradient(to right, #FF9B5E, #FFB366);"></div>
      </div>
    `;
    scoresSection.appendChild(scoreItem);
  });

  container.appendChild(scoresSection);

  // Disclaimer
  const disclaimer = document.createElement('div');
  disclaimer.style.backgroundColor = '#1a2332';
  disclaimer.style.padding = '15px';
  disclaimer.style.borderRadius = '8px';
  disclaimer.style.borderLeft = '4px solid #FF9B5E';
  disclaimer.style.fontSize = '12px';
  disclaimer.style.color = '#B8C5D6';
  disclaimer.style.marginTop = '20px';
  disclaimer.innerHTML = `
    <strong>Important Disclaimer:</strong><br/>
    These results are for educational purposes only and should not be considered as professional psychological advice. 
    If you have concerns about your mental health, please consult with a qualified mental health professional.
  `;
  container.appendChild(disclaimer);

  // Footer
  const footer = document.createElement('div');
  footer.style.marginTop = '30px';
  footer.style.paddingTop = '10px';
  footer.style.borderTop = '1px solid #2a3a52';
  footer.style.fontSize = '12px';
  footer.style.color = '#7A8FA6';
  footer.innerHTML = `
    <p style="margin: 5px 0;">Generated on ${new Date().toLocaleString()}</p>
    <p style="margin: 5px 0;">InFluence - Psychological Assessment Platform</p>
  `;
  container.appendChild(footer);

  // Append to body temporarily
  document.body.appendChild(container);

  return container;
};

/**
 * Export comparison results to PDF
 */
export const exportComparisonToPDF = async (
  testName: string,
  results: TestResultWithMetadata[]
) => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Title
    pdf.setFontSize(20);
    pdf.text(`${testName} - Trend Analysis`, 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 10;

    // Results
    pdf.setTextColor(0, 0, 0);
    results.forEach((result, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`Result #${results.length - index}`, 20, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Date: ${result.createdAt.toLocaleDateString()}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Duration: ${Math.floor(result.duration / 60)}m ${result.duration % 60}s`, 20, yPosition);
      yPosition += 10;

      // Scores
      pdf.setTextColor(0, 0, 0);
      Object.entries(result.scores).forEach(([key, value]) => {
        pdf.text(`${key}: ${Math.round(value)}`, 30, yPosition);
        yPosition += 5;
      });

      yPosition += 5;
    });

    pdf.save(`${testName}-comparison-${Date.now()}.pdf`);
  } catch (error) {
    console.error('Error exporting comparison to PDF:', error);
    throw error;
  }
};
