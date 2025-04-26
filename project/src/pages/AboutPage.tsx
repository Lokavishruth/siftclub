import React from 'react';
import { Shield, Heart, AlertTriangle } from 'lucide-react';
import { Link } from '../components/Link';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-[#2D3748] mb-4">About Sift</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Helping health-conscious Indians make informed food choices.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold text-[#2D3748] mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-6">
          Sift was founded with a simple mission: to make it easy for Indians to understand what's really 
          in their food and personal care products. We believe that everyone has the right to know exactly 
          what they're consuming and how it might affect their health.
        </p>
        <p className="text-gray-700 mb-6">
          In a world where ingredient lists are often confusing and filled with complex chemical names, 
          we want to be your trusted translator and guide. By combining regulatory data with your personal 
          health profile, Sift helps you make confident, informed choices about the products you use every day.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <div className="bg-[#319795] inline-flex p-4 rounded-full text-white mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-[#2D3748] mb-2">Protection</h3>
            <p className="text-gray-600">
              We help you avoid harmful ingredients that could negatively impact your health.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-[#48BB78] inline-flex p-4 rounded-full text-white mb-4">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-[#2D3748] mb-2">Personalization</h3>
            <p className="text-gray-600">
              Insights tailored to your specific health profile and dietary needs.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-[#F6E05E] inline-flex p-4 rounded-full text-[#2D3748] mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-[#2D3748] mb-2">Awareness</h3>
            <p className="text-gray-600">
              Empowering you with knowledge about what you're putting in and on your body.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8 mb-12">
        <h2 className="text-2xl font-bold text-[#2D3748] mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ol className="relative border-l border-gray-200 ml-3">
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-[#319795] rounded-full -left-4 text-white">
                  1
                </span>
                <h3 className="flex items-center text-lg font-semibold text-[#2D3748]">Input</h3>
                <p className="mb-4 text-base font-normal text-gray-600">
                  Paste an ingredient list, upload a photo of a label, or share a product URL with Sift.
                </p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-[#319795] rounded-full -left-4 text-white">
                  2
                </span>
                <h3 className="flex items-center text-lg font-semibold text-[#2D3748]">Analysis</h3>
                <p className="mb-4 text-base font-normal text-gray-600">
                  Our system intelligently parses the ingredients and matches them against our comprehensive database.
                </p>
              </li>
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-[#319795] rounded-full -left-4 text-white">
                  3
                </span>
                <h3 className="flex items-center text-lg font-semibold text-[#2D3748]">Personalization</h3>
                <p className="mb-4 text-base font-normal text-gray-600">
                  We cross-reference ingredients with your health profile, including allergies and conditions.
                </p>
              </li>
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-[#319795] rounded-full -left-4 text-white">
                  4
                </span>
                <h3 className="flex items-center text-lg font-semibold text-[#2D3748]">Results</h3>
                <p className="mb-4 text-base font-normal text-gray-600">
                  Receive clear, actionable insights about each ingredient and an overall assessment.
                </p>
              </li>
            </ol>
          </div>
          <div className="bg-[#EDF2F7] p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-[#2D3748] mb-4">Our Database</h3>
            <p className="text-gray-700 mb-4">
              Sift's intelligent system is powered by a comprehensive database that includes:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-[#319795]">•</span>
                <span className="ml-2">India-specific food regulations and standards (FSSAI)</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-[#319795]">•</span>
                <span className="ml-2">Common allergens and their alternative names</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-[#319795]">•</span>
                <span className="ml-2">Additives and preservatives with their E-codes</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-[#319795]">•</span>
                <span className="ml-2">Oils and fats classified by health impact</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-[#319795]">•</span>
                <span className="ml-2">Health impact research from verified medical sources</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#319795] text-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Ready to make healthier choices?</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Start using Sift today and discover what's really in your food.
          </p>
        </div>
        <div className="flex justify-center">
          <Link
            to="/scan"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#319795] bg-white hover:bg-gray-100 transition-colors"
          >
            Try Sift Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;