import React, { useState } from 'react';

const ScanPhotoAI: React.FC = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<null | { barcode: string; ingredients: string; openai_response: string }>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          <pre className="whitespace-pre-wrap text-sm mt-2">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ScanPhotoAI;
