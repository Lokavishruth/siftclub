import React from 'react';
import { Menu, X, Scan } from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Scan className="h-8 w-8 text-[#319795]" />
            <span className="ml-2 text-xl font-bold text-[#2D3748]">Sift</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-[#2D3748] hover:text-[#319795] transition-colors px-3 py-2 font-medium">
              Home
            </a>
            <a href="/scan" className="text-[#2D3748] hover:text-[#319795] transition-colors px-3 py-2 font-medium">
              Scan
            </a>
            <a href="/profile" className="text-[#2D3748] hover:text-[#319795] transition-colors px-3 py-2 font-medium">
              My Profile
            </a>
            <a href="/about" className="text-[#2D3748] hover:text-[#319795] transition-colors px-3 py-2 font-medium">
              About
            </a>
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#2D3748] hover:text-[#319795] focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2D3748] hover:text-[#319795] hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="/scan"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2D3748] hover:text-[#319795] hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Scan
            </a>
            <a
              href="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2D3748] hover:text-[#319795] hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              My Profile
            </a>
            <a
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-[#2D3748] hover:text-[#319795] hover:bg-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;