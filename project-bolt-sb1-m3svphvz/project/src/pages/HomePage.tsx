import React from 'react';
import { ArrowRight, Shield, Database, Award } from 'lucide-react';
import { Link } from '../components/Link';

const HomePage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-[#319795] to-[#48BB78] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Know what's really in your food
            </h1>
            <p className="text-xl mb-8">
              Sift instantly scans and analyzes ingredients for health-conscious Indians. Get clear 
              insights about additives, allergens, and other potentially harmful ingredients.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/scan" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#319795] bg-white hover:bg-gray-100 transition-colors"
              >
                Start scanning <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}></div>
      </div>

      {/* Features section */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#2D3748] mb-4">
              Why choose Sift?
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Sift combines regulatory data with your personal health profile to give you a clear picture of what's in your food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#EDF2F7] rounded-lg p-8 text-center transition-transform hover:scale-105 duration-300">
              <div className="bg-[#319795] inline-flex p-3 rounded-full text-white mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">India-Specific Protection</h3>
              <p className="text-gray-600">
                Our database is tailored to Indian regulations and ingredients commonly found in Indian products.
              </p>
            </div>

            <div className="bg-[#EDF2F7] rounded-lg p-8 text-center transition-transform hover:scale-105 duration-300">
              <div className="bg-[#48BB78] inline-flex p-3 rounded-full text-white mb-4">
                <Database className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Comprehensive Analysis</h3>
              <p className="text-gray-600">
                We check for banned items, harmful additives, allergens, and "bad" oils that might impact your health.
              </p>
            </div>

            <div className="bg-[#EDF2F7] rounded-lg p-8 text-center transition-transform hover:scale-105 duration-300">
              <div className="bg-[#F6E05E] inline-flex p-3 rounded-full text-[#2D3748] mb-4">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-[#2D3748] mb-2">Personalized Results</h3>
              <p className="text-gray-600">
                Get insights tailored to your specific health profile, dietary restrictions, and wellness goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-[#319795] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to make healthier choices?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start scanning your food products today and discover what's really inside.
          </p>
          <Link
            to="/scan"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#319795] bg-white hover:bg-gray-100 transition-colors"
          >
            Try Sift now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;