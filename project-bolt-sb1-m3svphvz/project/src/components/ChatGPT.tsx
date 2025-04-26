import React, { useState } from 'react';
import ScanPhotoAI from './ScanPhotoAI';

const ChatGPT: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.response) setResponse(data.response);
      else setError(data.error || 'No response from server.');
    } catch (err: any) {
      setError('Error connecting to backend.');
    }
    setLoading(false);
  };

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
        {response && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4 whitespace-pre-line">
            <strong>ChatGPT:</strong><br />{response}
          </div>
        )}
      </div>

      {/* Add Photo + AI Section */}
      <ScanPhotoAI />
    </div>
  );
};

export default ChatGPT;
