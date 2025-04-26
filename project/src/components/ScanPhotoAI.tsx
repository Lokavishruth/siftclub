import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Quagga from 'quagga';

const ScanPhotoAI: React.FC = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [barcode, setBarcode] = useState('');
  const [barcodeResult, setBarcodeResult] = useState<ProductResult | null>(null);
  const [barcodeError, setBarcodeError] = useState('');
  const [barcodeLoading, setBarcodeLoading] = useState(false);

  // Unified type for all result flows
  interface ProductResult {
    product_name: string;
    brands: string;
    code: string;
    ingredients_text: string;
    openai_response: string;
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  // Helper: Scan barcode from uploaded image using QuaggaJS
  function scanBarcodeFromImage(file: File): Promise<string | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new window.Image();
        img.onload = function () {
          Quagga.decodeSingle({
            src: img.src,
            numOfWorkers: 0,
            inputStream: {
              size: 800 // restrict input-size for performance
            },
            decoder: {
              readers: [
                'ean_reader',
                'ean_8_reader',
                'upc_reader',
                'upc_e_reader',
                'code_128_reader',
                'code_39_reader',
                'i2of5_reader'
              ]
            }
          }, function (result: any) {
            if (result && result.codeResult && result.codeResult.code) {
              resolve(result.codeResult.code);
            } else {
              resolve(null);
            }
          });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  // Modified photo upload handler to scan barcode before sending to backend
  const handlePhotoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    if (!photo) {
      setError('Please select a photo.');
      setLoading(false);
      return;
    }
    // Try to scan barcode from image on client
    const detectedBarcode = await scanBarcodeFromImage(photo);
    let res, data;
    if (detectedBarcode) {
      // If barcode found, use barcode lookup endpoint
      res = await fetch('/api/barcode-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: detectedBarcode })
      });
      data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      // Now get AI analysis for ingredients
      const aiRes = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.ingredients_text })
      });
      const aiData = await aiRes.json();
      setResult({
        product_name: data.product_name || '',
        brands: data.brands || '',
        code: data.code || detectedBarcode,
        ingredients_text: data.ingredients_text || '',
        openai_response: aiData.openai_response || aiData.response || ''
      });
      setLoading(false);
      return;
    }
    // If no barcode found, fallback to backend photo scan
    const formData = new FormData();
    formData.append('photo', photo);
    res = await fetch('/scan_photo', {
      method: 'POST',
      body: formData,
    });
    data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      // Normalize result structure regardless of backend response
      setResult({
        product_name: data.product_name || '',
        brands: data.brands || '',
        code: data.code || data.barcode || '',
        ingredients_text: data.ingredients_text || data.ingredients || '',
        openai_response: data.openai_response || data.response || ''
      });
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
        setBarcodeResult({
          product_name: data.product_name || '',
          brands: data.brands || '',
          code: data.code || barcode,
          ingredients_text: data.ingredients_text || '',
          openai_response: data.openai_response || data.response || ''
        });
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

  // Download report as PDF (mobile-friendly)
  function downloadReport(result: ProductResult) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 32;
    let y = margin + 8;
    doc.setFontSize(22);
    doc.text('Product Analysis Report', margin, y);
    doc.setFontSize(13);
    y += 28;
    doc.text(`Product: ${result.product_name || 'Unknown'}`, margin, y); y += 20;
    doc.text(`Brand: ${result.brands || 'Unknown'}`, margin, y); y += 20;
    doc.text(`Barcode: ${result.code || 'N/A'}`, margin, y); y += 20;
    doc.text(`Ingredients:`, margin, y); y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(doc.splitTextToSize(result.ingredients_text || 'Not available', 540), margin + 16, y); y += 24 + 10 * Math.ceil((result.ingredients_text || 'Not available').length / 80);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    try {
      const parsed = JSON.parse(result.openai_response);
      doc.text('Ingredient Risks:', margin, y); y += 18;
      doc.setFont('helvetica', 'normal');
      parsed.ingredient_risks?.forEach((r: any) => {
        doc.text(`${r.risk === 'safe' ? '🟢' : r.risk === 'moderate' ? '🟡' : '🔴'} ${r.ingredient}: ${r.risk} - ${r.reason}`, margin + 16, y, { maxWidth: 520 }); y += 18;
      });
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Healthy Alternatives:', margin, y); y += 18;
      doc.setFont('helvetica', 'normal');
      parsed.healthy_alternatives?.forEach((alt: any) => {
        doc.text(`💡 ${alt.suggestion}: ${alt.reason}`, margin + 16, y, { maxWidth: 520 }); y += 18;
      });
      y += 8;
      if(parsed.ailment_explanations) {
        doc.setFont('helvetica', 'bold');
        doc.text('Ailment Explanations:', margin, y); y += 18;
        doc.setFont('helvetica', 'normal');
        parsed.ailment_explanations.forEach((a: any) => {
          doc.text(`⚠️ ${a.ailment}: ${a.why_bad}`, margin + 16, y, { maxWidth: 520 }); y += 18;
        });
      }
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.text('AI Report:', margin, y); y += 18;
      doc.setFont('helvetica', 'normal');
      doc.text(doc.splitTextToSize(result.openai_response || '', 520), margin + 16, y);
    }
    doc.save('product_report.pdf');
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Scan Product Photo &amp; Analyze Ingredients</h2>
      <form onSubmit={handlePhotoUpload}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="mb-4 block w-full"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4 w-full"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Product'}
        </button>
      </form>
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
