import React from 'react';
import { Heart, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#EDF2F7] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-[#2D3748] text-sm">
              © {new Date().getFullYear()} Sift. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="#" 
              className="text-[#2D3748] hover:text-[#319795] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-[#2D3748] hover:text-[#319795] transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="#" 
              className="text-[#2D3748] hover:text-[#319795] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-300 text-center">
          <p className="text-[#2D3748] text-xs flex items-center justify-center">
            Made with <Heart className="h-3 w-3 mx-1 text-[#E53E3E]" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;