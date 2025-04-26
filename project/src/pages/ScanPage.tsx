import React, { useState } from 'react';
import { Scan, Link, Upload, AlertCircle, Info } from 'lucide-react';
import PhotoScanAISection from './PhotoScanAISection'; // Import the new component
import { useNavigate } from 'react-router-dom';

type InputMethod = 'text' | 'photo' | 'link';
type ScanStatus = 'idle' | 'scanning' | 'results';

const ScanPage: React.FC = () => {
  const [inputMethod, setInputMethod] = useState<InputMethod>('text');
  const [ingredientText, setIngredientText] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanResults, setScanResults] = useState<any>(null);
  const navigate = useNavigate();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientText.trim()) return;
    setScanStatus('scanning');
    setScanResults(null);
    try {
      // Optionally get user profile
      const userProfile = localStorage.getItem('user_profile');
      const res = await fetch('/scan_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredientText,
          profile: userProfile
        })
      });
      const data = await res.json();
      if (data.error) {
        setScanStatus('idle');
        setScanResults({ error: data.error });
        return;
      }
      // Parse OpenAI response
      let report = null;
      try {
        report = JSON.parse(data.openai_response);
      } catch {
        // Try to extract JSON object from text/code block
        const match = data.openai_response.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            report = JSON.parse(match[0]);
          } catch {
            setScanStatus('idle');
            setScanResults({ error: 'Failed to parse AI report.' });
            return;
          }
        } else {
          setScanStatus('idle');
          setScanResults({ error: 'Failed to parse AI report.' });
          return;
        }
      }
      // Navigate to report page
      navigate('/ingredient-report', { state: { report, userProfile: userProfile ? JSON.parse(userProfile) : null } });
    } catch (err) {
      setScanStatus('idle');
      setScanResults({ error: 'Failed to connect to backend.' });
    }
  };

  const resetScan = () => {
    setIngredientText('');
    setScanStatus('idle');
    setScanResults(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2D3748] mb-4">Ingredient Scanner</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Paste ingredients from food labels, upload a photo, or enter a product URL to discover what's really in your food.
        </p>
      </div>

      {scanStatus !== 'results' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex border-b mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  inputMethod === 'text'
                    ? 'text-[#319795] border-b-2 border-[#319795]'
                    : 'text-gray-500 hover:text-[#319795]'
                }`}
                onClick={() => setInputMethod('text')}
              >
                <div className="flex items-center">
                  <Scan className="h-4 w-4 mr-2" />
                  <span>Text</span>
                </div>
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  inputMethod === 'photo'
                    ? 'text-[#319795] border-b-2 border-[#319795]'
                    : 'text-gray-500 hover:text-[#319795]'
                }`}
                onClick={() => setInputMethod('photo')}
              >
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Photo</span>
                </div>
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  inputMethod === 'link'
                    ? 'text-[#319795] border-b-2 border-[#319795]'
                    : 'text-gray-500 hover:text-[#319795]'
                }`}
                onClick={() => setInputMethod('link')}
              >
                <div className="flex items-center">
                  <Link className="h-4 w-4 mr-2" />
                  <span>URL</span>
                </div>
              </button>
            </div>

            <form onSubmit={handleScan}>
              {inputMethod === 'text' && (
                <div className="mb-4">
                  <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                    Paste ingredients list
                  </label>
                  <textarea
                    id="ingredients"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#319795] focus:border-[#319795]"
                    placeholder="E.g., Sugar, Wheat Flour, Vegetable Oil (Palm), Salt, Emulsifier (E471), Raising Agent (E500), etc."
                    value={ingredientText}
                    onChange={(e) => setIngredientText(e.target.value)}
                  />
                </div>
              )}

              {inputMethod === 'photo' && (
                <PhotoScanAISection />
              )}

              {inputMethod === 'link' && (
                <div className="mb-4">
                  <label htmlFor="productUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter product URL
                  </label>
                  <input
                    type="url"
                    id="productUrl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#319795] focus:border-[#319795]"
                    placeholder="https://example.com/product"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">(Coming soon)</p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!ingredientText.trim() || inputMethod !== 'text' || scanStatus === 'scanning'}
                  className={`px-6 py-2 rounded-md font-medium ${
                    !ingredientText.trim() || inputMethod !== 'text' || scanStatus === 'scanning'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#319795] text-white hover:bg-[#2A8385] transition-colors'
                  }`}
                >
                  {scanStatus === 'scanning' ? (
                    <div className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Ingredients'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Your data is processed securely and never shared with third parties
            </p>
          </div>
        </>
      )}

      {scanStatus === 'results' && scanResults && (
        <div className="animate-fadeIn">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#2D3748] mb-2">Results</h2>
              <p className="text-gray-600">
                We analyzed {scanResults.totalIngredients} ingredients and found {scanResults.flaggedCount} potentially concerning items.
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium text-[#2D3748] mb-4">Ingredient Analysis</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingredient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Concerns
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scanResults.ingredients.map((ingredient: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ingredient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ingredient.safe
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ingredient.safe ? 'Safe' : 'Caution'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-start">
                            <span>{ingredient.concerns || 'No known issues'}</span>
                            {!ingredient.safe && (
                              <button className="ml-1 text-[#319795]" title="More info">
                                <Info className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#EDF2F7] p-4 rounded-md mb-6">
              <h3 className="text-lg font-medium text-[#2D3748] mb-2">Summary</h3>
              <p className="text-gray-700 mb-3">{scanResults.summary}</p>
              <div className="flex space-x-2">
                {scanResults.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-[#319795] bg-opacity-10 text-[#319795] text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={resetScan}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Scan Another
              </button>
              <button
                className="px-4 py-2 bg-[#319795] text-white rounded-md hover:bg-[#2A8385] transition-colors"
              >
                Save Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanPage;