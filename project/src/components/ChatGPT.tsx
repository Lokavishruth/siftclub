import React, { useState } from 'react';
import ScanPhotoAI from './ScanPhotoAI';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ChatGPT: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [manualResult, setManualResult] = useState<null | { product_name: string; brands: string; code: string; ingredients_text: string; openai_response: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setManualResult(null);
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.error) setError(data.error || 'No response from server.');
      else {
        // If backend returns unified structure, use it. Otherwise, wrap response.
        if (data.product_name !== undefined) {
          setManualResult(data);
        } else {
          setManualResult({
            product_name: '',
            brands: '',
            code: '',
            ingredients_text: prompt,
            openai_response: data.response || ''
          });
        }
      }
    } catch (err: any) {
      setError('Error connecting to backend.');
    }
    setLoading(false);
  };

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
    <div>
      {/* ChatGPT prompt UI */}
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">ChatGPT (OpenAI API)</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <textarea
            className="w-full p-2 border border-gray-300 rounded mb-2"
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask ChatGPT anything..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        {manualResult && (
          <div className="bg-white p-3 rounded shadow text-sm mt-4">
            <div><b>Product:</b> {manualResult.product_name || 'Unknown'}</div>
            <div><b>Brand:</b> {manualResult.brands || 'Unknown'}</div>
            <div><b>Barcode:</b> {manualResult.code || 'N/A'}</div>
            <div><b>Ingredients:</b> {manualResult.ingredients_text || 'Not available'}</div>
            <div className="mt-2"><b>AI Report:</b></div>
            {renderAIReport(manualResult.openai_response)}
            <button className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800" onClick={() => downloadReport(manualResult)}>Download Report</button>
          </div>
        )}
      </div>

      {/* Add Photo + AI Section */}
      <ScanPhotoAI />
    </div>
  );
};

export default ChatGPT;
