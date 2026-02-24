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
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 35);

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
  doc.text(`Forecasted Rainfall: ${result.forecastedRainfall} mm (${result.rainfallCategory})`, margin, y); y += 6;
  doc.text(`Historical Average: ${input.district.avgRainfallMm} mm/year`, margin, y); y += 10;

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
    `Moisture: ${input.moisture}%`,
    `Temperature: ${input.temperature}°C`,
    `Organic Matter: ${input.organicMatter}%`,
  ];
  soilData.forEach(line => { doc.text(line, margin, y); y += 6; });
  y += 4;

  doc.text(`Assessment: ${result.soilAssessment}`, margin, y, { maxWidth: 170 });
  y += 14;

  // Crop Recommendations
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
  });

  // Fertilizer plan
  if (y > 240) { doc.addPage(); y = margin; }
  y += 4;
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

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("NthakaGuide — University of Malawi | This is a decision support tool. Consult extension workers for final decisions.", margin, 287);

  doc.save(`NthakaGuide_Report_${input.district.name}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
