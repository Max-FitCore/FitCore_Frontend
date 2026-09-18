import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// ===== Public =====
import Home from './components/Home/Home';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import NotFound from './components/NotFound/NotFound';

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

/* ============================================================
   Auth helpers
   ============================================================ */

const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const r = String(rawRole).toLowerCase().trim();
  if (r.includes('admin') || r.includes('administrator')) return 'admin';
  if (r.includes('trainer') || r.includes('coach')) return 'trainer';
  if (r.includes('member') || r.includes('user') || r.includes('client')) return 'member';
  return null;
};

/**
 * Read the logged-in user from storage.
 * Tries both `user` and `fitcore_user` keys, then falls back to decoding the JWT.
 * Returns `{ role, user }` or `null` if not authenticated.
 */
const readAuth = () => {
  try {
    const raw =
      localStorage.getItem('fitcore_user') || localStorage.getItem('user');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const u = parsed?.data ? parsed.data : parsed;
        const role = normalizeRole(u?.role || u?.userRole || u?.type);
        if (role) {
          return {
            role,
            user: {
              ...u,
              name: u.name || u.fullName || u.username || u.email || 'User',
            },
          };
        }
      } catch {
        /* fall through to JWT */
      }
    }

    const token = localStorage.getItem('token');
    if (token && token.split('.').length === 3) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Reject expired tokens
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return null;
        }

        const role = normalizeRole(payload.role || payload.userRole || payload.type);
        if (role) {
          return {
            role,
            user: {
              ...payload,
              name:
                payload.name ||
                payload.fullName ||
                payload.username ||
                payload.email ||
                'User',
            },
          };
        }
      } catch {
        /* malformed token */
      }
    }
  } catch {
    /* localStorage disabled */
  }
  return null;
};

const ROLE_HOME = {
  member: '/dashboard',
  trainer: '/trainer/overview',
  admin: '/admin/overview',
};

/* ============================================================
   ProtectedRoute
   - `allowedRoles`: array of roles that may access the route
   - Redirects:
     * Not authenticated   → /sign-in (with `from` so Login can bounce back)
     * Wrong role          → user's own dashboard
   - Otherwise renders children
   ============================================================ */
function ProtectedRoute({ allowedRoles = [], children }) {
  const location = useLocation();
  const auth = readAuth();

  if (!auth) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    // User is signed in but visiting a section they can't see
    const target = ROLE_HOME[auth.role] || '/';
    return <Navigate to={target} replace />;
  }

  return children;
}

/* ============================================================
   AnimatedRoutes — now with protected wrappers
   ============================================================ */
function AnimatedRoutes({ setIsLoading }) {
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [location.pathname, setIsLoading]);

  // Live user for Layout props (re-read every render so login/logout updates)
  const auth = readAuth();
  const userData = auth
    ? {
        name: auth.user.name,
        role:
          auth.role === 'admin'
            ? 'Admin'
            : auth.role === 'trainer'
            ? 'Trainer'
            : 'Member',
      }
    : undefined;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ================= PUBLIC (No Sidebar) ================= */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/sign-in"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />
        <Route
          path="/sign-up"
          element={
            <PageTransition>
              <Signup />
            </PageTransition>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          }
        />

        {/* ================= MEMBER ================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberDashboard />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/membership"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberMembership />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout-plans"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberWorkoutPlans />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberPayments />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberClasses />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <PageTransition>
                <Layout userRole="member" userData={userData}>
                  <MemberSettings />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* ================= TRAINER ================= */}
        <Route
          path="/trainer/overview"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <PageTransition>
                <Layout userRole="trainer" userData={userData}>
                  <TrainerDashboard />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/members"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <PageTransition>
                <Layout userRole="trainer" userData={userData}>
                  <TrainerMember />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/workout-plans"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <PageTransition>
                <Layout userRole="trainer" userData={userData}>
                  <TrainerWorkouts />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/schedule"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <PageTransition>
                <Layout userRole="trainer" userData={userData}>
                  <TrainerSchedule />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/profile"
          element={
            <ProtectedRoute allowedRoles={['trainer']}>
              <PageTransition>
                <Layout userRole="trainer" userData={userData}>
                  <TrainerProfile />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin/overview"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminDashboard />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/members"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminMember />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/trainers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminTrainers />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminClasses />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminPayments />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/plans"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminPlans />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminAnalytics />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PageTransition>
                <Layout userRole="admin" userData={userData}>
                  <AdminSettings />
                </Layout>
              </PageTransition>
            </ProtectedRoute>
          }
        />

        {/* ================= 404 ================= */}
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
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