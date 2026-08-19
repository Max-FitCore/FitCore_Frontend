import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import PageTransition from './components/PageTransition/PageTransition';
import PageLoader from './components/PageLoader/PageLoader';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Membership from './components/Membership/Membership';
import './App.css';

function AnimatedRoutes({ setIsLoading }) {
  const location = useLocation();

  // Show loader when route changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600); // Adjust timing to match your transition duration

    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ===== PUBLIC ROUTES (No Sidebar) ===== */}
        <Route path="/" element={
          <PageTransition>
            <Home />
          </PageTransition>
        } />
        
        <Route path="/sign-in" element={
          <PageTransition>
            <Login />
          </PageTransition>
        } />
        
        <Route path="/sign-up" element={
          <PageTransition>
            <SignUp />
          </PageTransition>
        } />

        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />

        {/* ===== AUTHENTICATED ROUTES (With Sidebar) ===== */}
        <Route path="/dashboard" element={
          <PageTransition>
            <Layout>
              <Dashboard />
            </Layout>
          </PageTransition>
        } />

        <Route path="/membership" element={
          <PageTransition>
            <Layout>
              <Membership />
            </Layout>
          </PageTransition>
        } />

        {/* ===== 404 NOT FOUND ===== */}
        <Route path="*" element={
          <PageTransition>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100vh',
              backgroundColor: '#05070A',
              color: '#FFFFFF'
            }}>
              <h1 style={{ fontSize: '4rem', color: '#A6F13B' }}>404</h1>
              <h2>Page Not Found</h2>
              <a href="/" style={{ 
                marginTop: '1rem',
                color: '#A6F13B',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}>Go back home</a>
            </div>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Show loader on initial load
  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      {isLoading && <PageLoader />}
      <AnimatedRoutes setIsLoading={setIsLoading} />
    </Router>
  );
}

export default App;