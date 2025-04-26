import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import Quagga from 'quagga';

const PhotoScanAISection: React.FC = () => {
  const [result, setResult] = useState<null | { barcode: string; ingredients: string; openai_response: string }>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Helper function to get user profile from localStorage
  function getUserProfile() {
    try {
      const profile = localStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  }

  // Live barcode scanning logic
  const startScanner = () => {
    setCameraError('');
    setScanning(true);
    setResult(null);
    setError('');
    setTimeout(() => {
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
          },
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader'],
        },
      }, (err: any) => {
        if (err) {
          setCameraError('Camera error: ' + err.message);
          setScanning(false);
          return;
        }
        Quagga.start();
      });
      Quagga.onDetected(onDetected);
    }, 200);
  };

  const stopScanner = () => {
    Quagga.offDetected(onDetected);
    Quagga.stop();
    setScanning(false);
  };

  const onDetected = (data: any) => {
    if (data && data.codeResult && data.codeResult.code) {
      stopScanner();
      handleBarcodeDetected(data.codeResult.code);
    }
  };

  const handleBarcodeDetected = async (barcode: string) => {
    const userProfile = getUserProfile();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('barcode', barcode);
      if (userProfile) formData.append('profile', JSON.stringify(userProfile));
      const res = await fetch('/scan_photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Robust JSON extraction from AI response
        let report = null;
        try {
          // Try direct parse first
          report = JSON.parse(data.openai_response);
        } catch {
          // Try to extract JSON object from text/code block
          const match = data.openai_response.match(/\{[\s\S]*\}/);
          if (match) {
            try {
              report = JSON.parse(match[0]);
            } catch {
              setError('Failed to parse AI report.');
              setLoading(false);
              return;
            }
          } else {
            setError('Failed to parse AI report.');
            setLoading(false);
            return;
          }
        }
        // Also pass user profile for display
        navigate('/ingredient-report', { state: { report, userProfile } });
      }
    } catch (err) {
      setError('Failed to connect to backend.');
    }
    setLoading(false);
  };

  return (
    <div className="mb-4">
      {/* Barcode Scanner Button and Modal */}
      <button
        type="button"
        className="bg-[#319795] text-white px-4 py-2 rounded font-semibold hover:bg-[#24706e] mb-4"
        onClick={startScanner}
        disabled={scanning || loading}
      >
        {scanning ? 'Scanning...' : loading ? 'Analysing...' : 'Scan Barcode from Camera'}
      </button>
      {scanning && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg relative w-full max-w-md">
            <div ref={videoRef} className="w-full h-64 bg-black rounded mb-2"></div>
            {cameraError && <div className="text-red-600 mb-2">{cameraError}</div>}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
              onClick={stopScanner}
            >
              Close
            </button>
            <div className="text-center text-gray-700 mt-2">Point your camera at the barcode</div>
          </div>
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center mt-4">
          <button
            type="button"
            className="flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold cursor-not-allowed"
            disabled
          >
            <svg className="animate-spin mr-2 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Analysing...
          </button>
        </div>
      )}
      {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
      {/* Results are now shown in a dedicated report page */}
    </div>
  );
};

export default PhotoScanAISection;
