import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import ToyTrain from './components/ToyTrain';
import PopularRoutes from './components/PopularRoutes';
import Packages from './components/Packages';
import Footer from './components/Footer';
import ExperiencesListing from './components/ExperiencesListing';
import AdminDashboard from './components/admin/AdminDashboard';
import { AdminProvider } from './context/AdminContext';
import { BookingProvider } from './context/BookingContext';
import BookingLayout from './components/booking/BookingLayout';

import StayDetails from './components/StayDetails';
import RouteDetails from './components/RouteDetails';

// Wrapper for main layout to handle header transparency logic based on route
const Layout = ({ children }) => {
  const location = useLocation();
  // Header is transparent only on Experiences page as per original logic, 
  // or maybe Home if Hero is there? Original code: isTransparent = currentPage === 'experiences'
  const isTransparent = location.pathname === '/experiences';

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
              <Route path="/experiences" element={<Layout><ExperiencesListing /></Layout>} />
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
