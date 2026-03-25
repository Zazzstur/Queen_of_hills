import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import ToyTrain from './components/ToyTrain';
import PopularRoutes from './components/PopularRoutes';
import Footer from './components/Footer';
import ExperiencesListing from './components/ExperiencesListing';
import AdminDashboard from './components/admin/AdminDashboard';
import ContactPage from './components/ContactPage';
import { AdminProvider } from './context/AdminContext';
import { BookingProvider } from './context/BookingContext';
import BookingLayout from './components/booking/BookingLayout';

import StayDetails from './components/StayDetails';
import RouteDetails from './components/RouteDetails';

// Wrapper for main layout to handle header transparency logic based on route
const Layout = ({ children }) => {
  const location = useLocation();
  // Header is transparent on pages with CompactHero (dark background)
  const isTransparent = ['/sight-seeing', '/direct-travel', '/experiences'].includes(location.pathname);

  return (
    <>
      <Header isTransparent={isTransparent} />
      {children}
      <Footer />
    </>
  );
};

const HomePage = () => (
  <main>
    <Hero />
    <PopularRoutes />
    <ToyTrain />
  </main>
);

function App() {
  return (
    <AdminProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen w-full overflow-x-hidden bg-snow">
            <Routes>
              {/* Admin Route - No Header/Footer */}
              <Route path="/admin" element={<AdminDashboard />} />

              {/* Public Routes with Header/Footer */}
              <Route path="/" element={<Layout><HomePage /></Layout>} />
              <Route path="/hotels-and-stays" element={<Navigate to="/" replace />} />
              <Route path="/sight-seeing" element={<Layout><ExperiencesListing initialCategory="routes" /></Layout>} />
              <Route path="/direct-travel" element={<Layout><ExperiencesListing initialCategory="direct" /></Layout>} />
              <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
              <Route path="/stay/:id" element={<Layout><StayDetails /></Layout>} />
              <Route path="/route/:id" element={<Layout><RouteDetails /></Layout>} />
              
              {/* Booking Flow */}
              <Route path="/book" element={<Layout><BookingLayout /></Layout>} />
            </Routes>
          </div>
        </Router>
      </BookingProvider>
    </AdminProvider>
  );
}

export default App;
