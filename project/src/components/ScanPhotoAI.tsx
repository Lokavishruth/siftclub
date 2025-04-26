import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ScanPhotoAI: React.FC = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<null | { barcode: string; ingredients: string; openai_response: string }>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [barcode, setBarcode] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<null | { product_name: string; brands: string; code: string; ingredients_text: string; openai_response: string }>(null);
  const [barcodeError, setBarcodeError] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photo) {
      setError('Please select or take a photo of the product.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('photo', photo);
    try {
      const res = await fetch('/scan_photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to connect to backend.');
    }
    setLoading(false);
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleBarcodeLookup = async () => {
    if (!barcode.trim()) {
      setBarcodeError('Please enter a barcode.');
      return;
    }
    setBarcodeLoading(true);
    setBarcodeError('');
    setBarcodeResult(null);
    try {
      const res = await fetch('/api/barcode-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();
      if (data.error) {
        setBarcodeError(data.error);
      } else {
        setBarcodeResult(data);
      }
    } catch (err) {
      setBarcodeError('Failed to connect to backend.');
    }
    setBarcodeLoading(false);
  };

  // Helper to parse and format AI report with emojis
  function renderAIReport(openai_response: string) {
    let parsed;
    try {
      parsed = JSON.parse(openai_response);
    } catch {
      return <pre className="whitespace-pre-wrap text-xs mt-1">{openai_response}</pre>;
    }
    return (
      <div>
        <div className="font-semibold mt-2">Ingredient Risks:</div>
        <ul className="mb-2">
          {parsed.ingredient_risks?.map((r: any, idx: number) => (
            <li key={idx}>
              <span>{r.risk === 'safe' ? '🟢' : r.risk === 'moderate' ? '🟡' : '🔴'} <b>{r.ingredient}</b>: {r.risk.charAt(0).toUpperCase() + r.risk.slice(1)} - {r.reason}</span>
            </li>
          ))}
        </ul>
        <div className="font-semibold">Healthy Alternatives:</div>
        <ul className="mb-2">
          {parsed.healthy_alternatives?.map((alt: any, idx: number) => (
            <li key={idx}>💡 <b>{alt.suggestion}</b>: {alt.reason}</li>
          ))}
        </ul>
        {parsed.ailment_explanations && (
          <>
            <div className="font-semibold">Ailment Explanations:</div>
            <ul>
              {parsed.ailment_explanations.map((a: any, idx: number) => (
                <li key={idx}>⚠️ <b>{a.ailment}</b>: {a.why_bad}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  // Download report as PDF
  function downloadReport(result: any) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Product Analysis Report', 14, 18);
    doc.setFontSize(11);
    let y = 28;
    doc.text(`Product: ${result.product_name || 'Unknown'}`, 14, y); y += 7;
    doc.text(`Brand: ${result.brands || 'Unknown'}`, 14, y); y += 7;
    doc.text(`Barcode: ${result.code || 'N/A'}`, 14, y); y += 7;
    doc.text(`Ingredients: ${result.ingredients_text || 'Not available'}`, 14, y); y += 10;
    try {
      const parsed = JSON.parse(result.openai_response);
      doc.text('Ingredient Risks:', 14, y); y += 7;
      parsed.ingredient_risks?.forEach((r: any) => {
        doc.text(`${r.risk === 'safe' ? '🟢' : r.risk === 'moderate' ? '🟡' : '🔴'} ${r.ingredient}: ${r.risk} - ${r.reason}`, 18, y); y += 6;
      });
      y += 2;
      doc.text('Healthy Alternatives:', 14, y); y += 7;
      parsed.healthy_alternatives?.forEach((alt: any) => {
        doc.text(`💡 ${alt.suggestion}: ${alt.reason}`, 18, y); y += 6;
      });
      y += 2;
      if(parsed.ailment_explanations) {
        doc.text('Ailment Explanations:', 14, y); y += 7;
        parsed.ailment_explanations.forEach((a: any) => {
          doc.text(`⚠️ ${a.ailment}: ${a.why_bad}`, 18, y); y += 6;
        });
      }
    } catch {
      doc.text('AI Report:', 14, y); y += 7;
      doc.text(result.openai_response || '', 18, y);
    }
    doc.save('product_report.pdf');
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Scan Product Photo &amp; Analyze Ingredients</h2>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoChange}
        className="mb-4 block w-full"
      />
      <button
        onClick={handlePhotoUpload}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-full"
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze Product'}
      </button>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="bg-gray-100 p-4 rounded mt-4">
          <h3 className="font-bold text-green-700">Analysis Result</h3>
          <div><b>Product:</b> {result.product_name || 'Unknown'}</div>
          <div><b>Brand:</b> {result.brands || 'Unknown'}</div>
          <div><b>Barcode:</b> {result.code || 'N/A'}</div>
          <div><b>Ingredients:</b> {result.ingredients_text || 'Not available'}</div>
          <div className="mt-2"><b>AI Report:</b></div>
          {renderAIReport(result.openai_response)}
          <button className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => downloadReport(result)}>Download Report</button>
        </div>
      )}
      <div className="my-4 p-4 border rounded bg-gray-50">
        <div className="mb-2 font-semibold">Scan or Enter Barcode:</div>
        <div className="flex gap-2 mb-2">
          <input type="text" value={barcode} onChange={handleBarcodeChange} placeholder="Enter barcode..." className="border rounded px-2 py-1 w-44" />
          <button onClick={handleBarcodeLookup} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded" disabled={barcodeLoading}>
            {barcodeLoading ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
        {barcodeError && <div className="text-red-600 text-sm mb-1">{barcodeError}</div>}
        {barcodeResult && (
          <div className="bg-white p-3 rounded shadow text-sm">
            <div><b>Product:</b> {barcodeResult.product_name || 'Unknown'}</div>
            <div><b>Brand:</b> {barcodeResult.brands || 'Unknown'}</div>
            <div><b>Barcode:</b> {barcodeResult.code}</div>
            <div><b>Ingredients:</b> {barcodeResult.ingredients_text || 'Not available'}</div>
            <div className="mt-2"><b>AI Report:</b></div>
            {barcodeResult.openai_response ? renderAIReport(barcodeResult.openai_response) : <span className="text-gray-400">No AI report.</span>}
            <button className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => downloadReport(barcodeResult)}>Download Report</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPhotoAI;
