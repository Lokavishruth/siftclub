import React, { useState } from 'react';

const ScanPhotoAI: React.FC = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [result, setResult] = useState<null | { barcode: string; ingredients: string; openai_response: string }>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      setError('Please select a photo.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('photo', photo);
    try {
      const res = await fetch('http://localhost:5000/scan_photo', {
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
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded p-4 whitespace-pre-line">
          <div><strong>Barcode:</strong> {result.barcode}</div>
          <div className="mt-2"><strong>Ingredients:</strong><br />{result.ingredients}</div>
          <div className="mt-2"><strong>AI Analysis:</strong><br />{result.openai_response}</div>
        </div>
      )}
    </div>
  );
};

export default ScanPhotoAI;
