import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    allergies: {
      dairy: false,
      gluten: false,
      nuts: false,
      shellfish: false,
      soy: false,
      egg: false,
    },
    conditions: {
      diabetes: false,
      hypertension: false,
      cholesterol: false,
      heart_disease: false,
      ibs: false,
      lactose_intolerance: false,
    },
    diet: {
      vegetarian: false,
      vegan: false,
      keto: false,
      paleo: false,
      low_sodium: false,
      low_sugar: false,
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category: 'allergies' | 'conditions' | 'diet', name: string) => {
    setProfile(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [name]: !prev[category][name as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('user_profile', JSON.stringify(profile));
    alert('Profile saved!');
  };

  // On mount, load profile from localStorage if exists
  useEffect(() => {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      setProfile(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#2D3748] mb-4">My Health Profile</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Personalize your ingredient scanning results by telling us about your health profile, allergies, 
          and dietary preferences.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#2D3748] mb-4 pb-2 border-b">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#319795] focus:border-[#319795]"
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#319795] focus:border-[#319795]"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#319795] focus:border-[#319795]"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#2D3748] mb-4 pb-2 border-b">Allergies</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dairy"
                  checked={profile.allergies.dairy}
                  onChange={() => handleCheckboxChange('allergies', 'dairy')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="dairy" className="ml-2 block text-sm text-gray-700">
                  Dairy
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gluten"
                  checked={profile.allergies.gluten}
                  onChange={() => handleCheckboxChange('allergies', 'gluten')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="gluten" className="ml-2 block text-sm text-gray-700">
                  Gluten
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="nuts"
                  checked={profile.allergies.nuts}
                  onChange={() => handleCheckboxChange('allergies', 'nuts')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="nuts" className="ml-2 block text-sm text-gray-700">
                  Nuts
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shellfish"
                  checked={profile.allergies.shellfish}
                  onChange={() => handleCheckboxChange('allergies', 'shellfish')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="shellfish" className="ml-2 block text-sm text-gray-700">
                  Shellfish
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="soy"
                  checked={profile.allergies.soy}
                  onChange={() => handleCheckboxChange('allergies', 'soy')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="soy" className="ml-2 block text-sm text-gray-700">
                  Soy
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="egg"
                  checked={profile.allergies.egg}
                  onChange={() => handleCheckboxChange('allergies', 'egg')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="egg" className="ml-2 block text-sm text-gray-700">
                  Egg
                </label>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#2D3748] mb-4 pb-2 border-b">Health Conditions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="diabetes"
                  checked={profile.conditions.diabetes}
                  onChange={() => handleCheckboxChange('conditions', 'diabetes')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="diabetes" className="ml-2 block text-sm text-gray-700">
                  Diabetes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hypertension"
                  checked={profile.conditions.hypertension}
                  onChange={() => handleCheckboxChange('conditions', 'hypertension')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="hypertension" className="ml-2 block text-sm text-gray-700">
                  Hypertension
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="cholesterol"
                  checked={profile.conditions.cholesterol}
                  onChange={() => handleCheckboxChange('conditions', 'cholesterol')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="cholesterol" className="ml-2 block text-sm text-gray-700">
                  High Cholesterol
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="heart_disease"
                  checked={profile.conditions.heart_disease}
                  onChange={() => handleCheckboxChange('conditions', 'heart_disease')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="heart_disease" className="ml-2 block text-sm text-gray-700">
                  Heart Disease
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ibs"
                  checked={profile.conditions.ibs}
                  onChange={() => handleCheckboxChange('conditions', 'ibs')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="ibs" className="ml-2 block text-sm text-gray-700">
                  IBS
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lactose_intolerance"
                  checked={profile.conditions.lactose_intolerance}
                  onChange={() => handleCheckboxChange('conditions', 'lactose_intolerance')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="lactose_intolerance" className="ml-2 block text-sm text-gray-700">
                  Lactose Intolerance
                </label>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-[#2D3748] mb-4 pb-2 border-b">Dietary Preferences</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegetarian"
                  checked={profile.diet.vegetarian}
                  onChange={() => handleCheckboxChange('diet', 'vegetarian')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-700">
                  Vegetarian
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vegan"
                  checked={profile.diet.vegan}
                  onChange={() => handleCheckboxChange('diet', 'vegan')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="vegan" className="ml-2 block text-sm text-gray-700">
                  Vegan
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keto"
                  checked={profile.diet.keto}
                  onChange={() => handleCheckboxChange('diet', 'keto')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="keto" className="ml-2 block text-sm text-gray-700">
                  Keto
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paleo"
                  checked={profile.diet.paleo}
                  onChange={() => handleCheckboxChange('diet', 'paleo')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="paleo" className="ml-2 block text-sm text-gray-700">
                  Paleo
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="low_sodium"
                  checked={profile.diet.low_sodium}
                  onChange={() => handleCheckboxChange('diet', 'low_sodium')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="low_sodium" className="ml-2 block text-sm text-gray-700">
                  Low Sodium
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="low_sugar"
                  checked={profile.diet.low_sugar}
                  onChange={() => handleCheckboxChange('diet', 'low_sugar')}
                  className="h-4 w-4 text-[#319795] focus:ring-[#319795] border-gray-300 rounded"
                />
                <label htmlFor="low_sugar" className="ml-2 block text-sm text-gray-700">
                  Low Sugar
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Your data is stored locally and never shared
            </p>
            <button
              type="submit"
              className="px-6 py-2 bg-[#319795] text-white rounded-md hover:bg-[#2A8385] transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;