import jsPDF from "jspdf";
import type { Recommendation, SoilInput } from "./recommendations";

export function generatePDFReport(input: SoilInput, result: Recommendation) {
  const doc = new jsPDF();
  const margin = 20;
  let y = margin;

  // Header
  doc.setFillColor(34, 87, 50);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("NthakaGuide", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Crop & Fertilizer Recommendation Report", margin, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | COM422 UNIMA 2025/2026`, margin, 35);

  // Reset
  doc.setTextColor(30, 30, 30);
  y = 50;

  // District & Rainfall
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Location & Climate", margin, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`District: ${input.district.name} (${input.district.region} Region)`, margin, y); y += 6;
  doc.text(`Forecasted Rainfall: ${result.forecastedRainfall} mm`, margin, y); y += 6;
  doc.text(`Rainfall Band: ${result.rainfallBand} (${result.rainfallCategory})`, margin, y); y += 6;
  doc.text(`Historical Average: ${input.district.avgRainfallMm} mm/year`, margin, y); y += 6;
  doc.text(`Band Description: ${result.rainfallBandDescription}`, margin, y, { maxWidth: 170 }); y += 12;

  // ML Prediction
  if (result.mlPrediction) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ML Model Prediction", margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Algorithm: ${result.mlPrediction.algorithm}`, margin, y); y += 6;
    doc.text(`Top Prediction: ${result.mlPrediction.crop} (${result.mlPrediction.confidence}% confidence)`, margin, y); y += 6;
    if (result.mlPrediction.alternatives.length > 0) {
      doc.text(`Alternatives: ${result.mlPrediction.alternatives.map(a => `${a.crop} (${a.confidence}%)`).join(", ")}`, margin, y, { maxWidth: 170 }); y += 10;
    }
    y += 4;
  }

  // Soil Data
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Soil Analysis Input", margin, y); y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const soilData = [
    `Nitrogen (N): ${input.nitrogen} mg/kg`,
    `Phosphorus (P): ${input.phosphorus} mg/kg`,
    `Potassium (K): ${input.potassium} mg/kg`,
    `pH: ${input.ph}`,
    `Moisture/Humidity: ${input.moisture}%`,
    `Temperature: ${input.temperature}°C`,
    `Organic Matter: ${input.organicMatter}%`,
  ];
  soilData.forEach(line => { doc.text(line, margin, y); y += 6; });
  y += 4;

  doc.text(`Assessment: ${result.soilAssessment}`, margin, y, { maxWidth: 170 });
  y += 14;

  // Soil Alerts
  if (result.soilAlerts && result.soilAlerts.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Soil Health Alerts", margin, y); y += 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    result.soilAlerts.forEach(alert => {
      const prefix = alert.type === "danger" ? "⚠️ DANGER: " : alert.type === "warning" ? "⚠ WARNING: " : "ℹ ";
      doc.text(`${prefix}${alert.message}`, margin, y, { maxWidth: 170 }); y += 7;
    });
    y += 4;
  }

  // Crop Recommendations
  if (y > 220) { doc.addPage(); y = margin; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Top Crop Recommendations", margin, y); y += 8;
  doc.setFontSize(10);
  result.crops.forEach((crop, i) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${crop.crop} — Score: ${crop.score}/100 (${crop.season})`, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(crop.reason, margin + 4, y, { maxWidth: 166 });
    y += 10;
    if (y > 270) { doc.addPage(); y = margin; }
  });

  // Fertilizer plan
  y += 4;
  if (y > 240) { doc.addPage(); y = margin; }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Fertilizer Plan", margin, y); y += 8;
  doc.setFontSize(10);
  result.fertilizers.forEach(f => {
    doc.setFont("helvetica", "bold");
    doc.text(`${f.type} — ${f.applicationRate}`, margin, y); y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`Timing: ${f.timing}`, margin + 4, y); y += 5;
    doc.text(`Note: ${f.notes}`, margin + 4, y, { maxWidth: 166 }); y += 10;
    if (y > 270) { doc.addPage(); y = margin; }
  });

  // Rainfall-Adjusted Application Plan
  if (result.fertilizerAdjustment) {
    if (y > 200) { doc.addPage(); y = margin; }
    y += 4;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Rainfall-Adjusted Application Plan", margin, y); y += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Method: ${result.fertilizerAdjustment.applicationMethod} | NPK: ${result.fertilizerAdjustment.basalNpkKgHa} kg/ha | Urea: ${result.fertilizerAdjustment.ureaKgHa} kg/ha`, margin, y); y += 8;

    result.fertilizerAdjustment.plan.forEach((step, i) => {
      doc.setFont("helvetica", "bold");
      doc.text(`Step ${i + 1}: ${step.timing}`, margin, y); y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(step.action, margin + 4, y, { maxWidth: 166 }); y += 6;
      doc.text(step.note, margin + 4, y, { maxWidth: 166 }); y += 8;
      if (y > 270) { doc.addPage(); y = margin; }
    });

    if (result.fertilizerAdjustment.warnings.length > 0) {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.text("Warnings:", margin, y); y += 6;
      doc.setFont("helvetica", "normal");
      result.fertilizerAdjustment.warnings.forEach(w => {
        doc.text(`• ${w}`, margin + 4, y, { maxWidth: 166 }); y += 6;
      });
    }

    y += 4;
    doc.setFont("helvetica", "italic");
    doc.text(`Organic: ${result.fertilizerAdjustment.organicAdvice}`, margin, y, { maxWidth: 170 }); y += 10;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`NthakaGuide — COM422 Final Year Project | UNIMA 2025/2026 | Page ${i}/${pageCount}`, margin, 287);
  }

  doc.save(`NthakaGuide_Report_${input.district.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
