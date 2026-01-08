import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import ToyTrain from './components/ToyTrain';
import Packages from './components/Packages';
import Footer from './components/Footer';
import ExperiencesListing from './components/ExperiencesListing';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('stays');

  const handleNavigate = (page, category = 'stays') => {
    setCurrentPage(page);
    if (category) {
      setSelectedCategory(category);
    }
    window.scrollTo(0, 0);
  };

  // Simple manual routing for demo purposes
  const renderPage = () => {
    if (currentPage === 'experiences') {
      return <ExperiencesListing initialCategory={selectedCategory} />;
    }
    return (
      <main>
        <Hero />
        <Services onNavigate={handleNavigate} />
        <ToyTrain />
        <Packages onNavigate={handleNavigate} />
      </main>
    );
  };

  const isTransparent = currentPage === 'experiences';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-snow">
      <Header onNavigate={handleNavigate} isTransparent={isTransparent} />
      {renderPage()}
      <Footer />
    </div>
  );
}

export default App;
