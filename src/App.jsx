import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ===== Public =====
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';

// ===== Shared / UI =====
import Layout from './components/Layout/Layout';
import PageTransition from './components/PageTransition/PageTransition';
import PageLoader from './components/PageLoader/PageLoader';

// ===== Member =====
import MemberDashboard from './components/MemberDashboard/Dashboard';
import MemberMembership from './components/MemberMembership/Membership';
import MemberWorkoutPlans from './components/MemberWorkoutPlans/WorkoutPlans';
import MemberPayments from './components/MemberPayments/Payments';
import MemberClasses from './components/MemberClasses/Classes';
import MemberSettings from './components/MemberSettings/Settings';

// ===== Trainer =====
import TrainerDashboard from './components/TrainerDashboard/TrainerDashboard';
import TrainerMember from './components/TrainerMember/TrainerMember';
import TrainerWorkouts from './components/TrainerWorkouts/TrainerWorkouts';
import TrainerSchedule from './components/TrainerSchedule/TrainerSchedule';
import TrainerAttendance from './components/TrainerAttendance/TrainerAttendance';
import TrainerProfile from './components/TrainerProfile/TrainerProfile';

// ===== Admin =====
import AdminDashboard from './components/AdminDashboard/AdminDashboard';
import AdminMember from './components/AdminMember/AdminMember';
import AdminTrainers from './components/AdminTrainers/AdminTrainers';
import AdminClasses from './components/AdminClasses/AdminClasses';
import AdminPayments from './components/AdminPayments/AdminPayments';
import AdminPlans from './components/AdminPlans/AdminPlans';
import AdminAnalytics from './components/AdminAnalytics/AdminAnalytics';
import AdminSettings from './components/AdminSettings/AdminSettings';

import './App.css';

function AnimatedRoutes({ setIsLoading }) {
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

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
            <Signup />
          </PageTransition>
        } />

        <Route path="/forgot-password" element={
          <PageTransition>
            <ForgotPassword />
          </PageTransition>
        } />

        {/* ===== MEMBER ROUTES (With Sidebar) ===== */}
        <Route path="/dashboard" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberDashboard />
            </Layout>
          </PageTransition>
        } />

        <Route path="/membership" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberMembership />
            </Layout>
          </PageTransition>
        } />

        <Route path="/workout-plans" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberWorkoutPlans />
            </Layout>
          </PageTransition>
        } />

        <Route path="/payments" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberPayments />
            </Layout>
          </PageTransition>
        } />

        <Route path="/classes" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberClasses />
            </Layout>
          </PageTransition>
        } />

        <Route path="/settings" element={
          <PageTransition>
            <Layout userRole="member">
              <MemberSettings />
            </Layout>
          </PageTransition>
        } />

        {/* ===== TRAINER ROUTES (With Sidebar) ===== */}
        <Route path="/trainer/overview" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerDashboard />
            </Layout>
          </PageTransition>
        } />

        <Route path="/trainer/members" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerMember />
            </Layout>
          </PageTransition>
        } />

        <Route path="/trainer/workout-plans" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerWorkouts />
            </Layout>
          </PageTransition>
        } />

        <Route path="/trainer/schedule" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerSchedule />
            </Layout>
          </PageTransition>
        } />

        <Route path="/trainer/attendance" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerAttendance />
            </Layout>
          </PageTransition>
        } />

        <Route path="/trainer/profile" element={
          <PageTransition>
            <Layout userRole="trainer" userData={{ name: 'Marcus Vale', role: 'Trainer' }}>
              <TrainerProfile />
            </Layout>
          </PageTransition>
        } />

        {/* ===== ADMIN ROUTES (With Sidebar) ===== */}
        <Route path="/admin/overview" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminDashboard />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/members" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminMember />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/trainers" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminTrainers />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/classes" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminClasses />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/payments" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminPayments />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/plans" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminPlans />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/analytics" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminAnalytics />
            </Layout>
          </PageTransition>
        } />

        <Route path="/admin/settings" element={
          <PageTransition>
            <Layout userRole="admin" userData={{ name: 'Hana Adel', role: 'Admin' }}>
              <AdminSettings />
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

  useEffect(() => {
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