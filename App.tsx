import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TravelForm, { FilterState } from './components/TravelForm';
import DestinationCard from './components/DestinationCard';
import Footer from './components/Footer';
import { destinations, Destination } from './data/destinations';
import { AnimatePresence, motion } from 'framer-motion';

type ViewMode = 'initial' | 'recommendations' | 'all';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [filteredDestinations, setFilteredDestinations] = useState<Array<{ data: Destination; score: number }>>([]);

  const scrollToResults = () => {
     setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
           const y = resultsEl.getBoundingClientRect().top + window.scrollY - 100;
           window.scrollTo({ top: y, behavior: 'smooth' });
        }
     }, 100);
  };

  const handleSearch = (filters: FilterState) => {
    const scored = destinations.map(dest => {
      let score = 0;
      let maxScore = 0;

      // Budget scoring (30 pts)
      maxScore += 30;
      if (filters.budget === '' || filters.budget === 'Any') {
        score += 30;
      } else if (filters.budget === dest.budget) {
        score += 30;
      }

      // Month scoring (30 pts)
      maxScore += 30;
      if (filters.month === '') {
        score += 30;
      } else {
        const normalizedInput = filters.month.toLowerCase();
        const match = dest.bestMonths.some(m => m.toLowerCase().includes(normalizedInput));
        if (match) score += 30;
      }

      // Interest scoring (40 pts)
      maxScore += 40;
      if (filters.interests.length === 0) {
        score += 40;
      } else {
        const matchCount = dest.interests.filter(i => filters.interests.includes(i)).length;
        // Calculate percentage of matched interests vs selected interests
        const matchRatio = matchCount / filters.interests.length; 
        score += matchRatio * 40;
      }

      return { data: dest, score: Math.round((score / maxScore) * 100) };
    });

    // Filter out low scores and sort
    const results = scored
      .filter(item => item.score > 40)
      .sort((a, b) => b.score - a.score);

    setFilteredDestinations(results);
    setViewMode('recommendations');
    scrollToResults();
  };

  const handleShowAll = () => {
    const all = destinations.map(dest => ({ data: dest, score: 0 }));
    setFilteredDestinations(all);
    setViewMode('all');
    scrollToResults();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col antialiased bg-neutral-25">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <TravelForm onSearch={handleSearch} onShowAll={handleShowAll} />
        
        <div id="results-section" className="max-w-7xl mx-auto px-6 md:px-12 pb-24 scroll-mt-24" aria-live="polite">
          <AnimatePresence mode="wait">
            {viewMode === 'initial' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-block p-4 rounded-full bg-neutral-100 mb-4">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <p className="text-neutral-500 font-light">Select your preferences above to discover your next journey.</p>
              </motion.div>
            )}

            {viewMode !== 'initial' && (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-12 border-b border-neutral-200 pb-6 flex items-baseline justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold text-neutral-900 tracking-tight">
                        {viewMode === 'all' ? 'Full Archive' : 'Curated Selection'}
                    </h2>
                    <p className="text-neutral-500 mt-2 font-light">
                        {viewMode === 'all' 
                        ? 'Browsing all available destinations.' 
                        : `Found ${filteredDestinations.length} destinations perfectly matched to your criteria.`}
                    </p>
                  </div>
                </div>

                {filteredDestinations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredDestinations.map((item) => (
                      <DestinationCard 
                        key={item.data.id} 
                        destination={item.data} 
                        score={viewMode === 'recommendations' ? item.score : undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-white rounded-2xl border border-neutral-100 border-dashed shadow-sm">
                    <p className="text-neutral-500 mb-4">No exact matches found for these specific criteria.</p>
                    <button onClick={handleShowAll} className="text-neutral-900 font-medium border-b border-neutral-900 hover:text-neutral-600 hover:border-neutral-600 transition-colors">
                      View all destinations instead
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;