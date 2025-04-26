import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ChatGPTPage from './pages/ChatGPTPage';
import IngredientReport from './pages/IngredientReport';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/chatgpt" element={<ChatGPTPage />} />
          <Route path="/ingredient-report" element={<IngredientReport />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;