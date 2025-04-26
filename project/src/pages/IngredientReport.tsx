import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @ts-ignore
import jsPDF from 'jspdf';

// Risk icon and color mapping
const RISK_MAP: Record<string, { icon: string; label: string; color: string }> = {
  safe: { icon: '✅', label: 'Safe', color: 'text-green-600' },
  moderate: { icon: '⚠️', label: 'Consume in moderation', color: 'text-yellow-600' },
  avoid: { icon: '❌', label: 'Should avoid', color: 'text-red-600' },
};

function formatProfileAilments(profile: any) {
  if (!profile) return [];
  const ailments: string[] = [];
  if (profile.conditions) {
    Object.entries(profile.conditions).forEach(([k, v]) => {
      if (v) ailments.push(k.replace(/_/g, ' '));
    });
  }
  return ailments;
}

export default function IngredientReport() {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting: { report: { ingredient_risks, healthy_alternative, ailment_explanations }, userProfile }
  const report = location.state?.report;
  const userProfile = location.state?.userProfile;

  if (!report || !report.ingredient_risks) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-4 bg-white rounded shadow">
        <div className="text-red-600 font-bold mb-4">No report data found.</div>
        <button
          className="bg-[#319795] text-white px-4 py-2 rounded font-semibold hover:bg-[#24706e]"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  const ailments = formatProfileAilments(userProfile);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Personalized Ingredient Risk Report', 10, 15);
    let y = 25;
    if (ailments.length > 0) {
      doc.setFontSize(12);
      doc.text('Your Ailments/Conditions:', 10, y);
      y += 7;
      ailments.forEach(a => {
        doc.text(`- ${a}`, 12, y);
        y += 6;
      });
      y += 2;
    }
    if (report.ailment_explanations && report.ailment_explanations.length > 0) {
      doc.setFontSize(12);
      doc.text('Why this product may be problematic for you:', 10, y);
      y += 7;
      report.ailment_explanations.forEach((ae: any) => {
        doc.text(`- ${ae.ailment}: ${ae.why_bad}`, 12, y);
        y += 6;
      });
      y += 2;
    }
    doc.setFontSize(12);
    doc.text('Ingredient Risks:', 10, y);
    y += 7;
    report.ingredient_risks.forEach((row: any) => {
      doc.text(`- ${row.ingredient}: ${row.risk.toUpperCase()} - ${row.reason}`, 12, y);
      y += 6;
    });
    y += 2;
    if (report.healthy_alternatives && report.healthy_alternatives.length > 0) {
      doc.setFontSize(12);
      doc.text('Healthy Alternative Suggestions:', 10, y);
      y += 7;
      report.healthy_alternatives.forEach((alt: any) => {
        doc.text(`- ${alt.suggestion}: ${alt.reason}`, 12, y);
        y += 6;
      });
      y += 2;
    }
    doc.save('ingredient-risk-report.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Personalized Ingredient Risk Report</h2>
      {ailments.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold">Your Ailments/Conditions:</h3>
          <ul className="list-disc ml-6">
            {ailments.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
      {report.ailment_explanations && report.ailment_explanations.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold">Why this product may be problematic for you:</h3>
          <ul className="list-disc ml-6">
            {report.ailment_explanations.map((ae: any, idx: number) => (
              <li key={idx}><span className="font-medium">{ae.ailment}:</span> {ae.why_bad}</li>
            ))}
          </ul>
        </div>
      )}
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 border-b text-left">Ingredient</th>
            <th className="py-2 px-3 border-b text-left">Risk Level</th>
            <th className="py-2 px-3 border-b text-left">Reason / Notes</th>
          </tr>
        </thead>
        <tbody>
          {report.ingredient_risks.map((row: any, idx: number) => {
            const risk = RISK_MAP[row.risk?.toLowerCase()] || RISK_MAP['moderate'];
            return (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">{row.ingredient}</td>
                <td className={`py-2 px-3 flex items-center gap-2 ${risk.color}`}>
                  <span className="text-xl">{risk.icon}</span>
                  <span className="font-semibold">{risk.label}</span>
                </td>
                <td className="py-2 px-3">{row.reason}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {report.healthy_alternatives && report.healthy_alternatives.length > 0 && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold mb-1">Healthy Alternative Suggestions</h3>
          <ul className="list-disc ml-6">
            {report.healthy_alternatives.map((alt: any, idx: number) => (
              <li key={idx}><b>{alt.suggestion}:</b> {alt.reason}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-4">
        <button
          className="bg-[#319795] text-white px-4 py-2 rounded font-semibold hover:bg-[#24706e]"
          onClick={handleDownload}
        >
          Download Report (PDF)
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400"
          onClick={() => navigate(-1)}
        >
          Back to Scan
        </button>
      </div>
    </div>
  );
}
