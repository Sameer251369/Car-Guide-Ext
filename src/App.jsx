import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import api from './api/client';

// Pages
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import VehicleDetail from './pages/VehicleDetail';
import Blog from './pages/Blog';
import ArticleDetail from './pages/ArticleDetail';
import Calculator from './pages/Calculator';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminWorklist from './pages/AdminWorklist';

/* --- Shared style tokens: replace with your existing ones if you have them --- */
const display = { fontFamily: 'var(--font-display, inherit)' };
const slant = { clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)' };

function ProtectedAdminRoute({ children, isAdmin }) {
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const profile = await api.getAdminSession();
        setIsAdmin(Boolean(profile?.user?.is_staff));
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await api.adminLogout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setIsAdmin(false);
      navigate('/admin/login');
    }
  };

  if (authLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0d0e10] px-4 text-white"
      >
        {/* Diagonal speed panels */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-[420px] w-[420px] -skew-x-12 bg-gradient-to-br from-[#dc2626]/20 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 -skew-x-12 bg-[#dc2626]/5" />

        <div className="relative w-full max-w-sm border border-white/10 bg-[#1a1c20] p-6 sm:p-8">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#dc2626] via-[#dc2626]/70 to-[#f6c945]" />

          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="h-[3px] w-7 -skew-x-[30deg] bg-[#dc2626]" />
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#f6c945]">Admin</p>
          </div>

          <h1 className="mt-3 text-3xl font-extrabold italic leading-none tracking-tight text-white" style={display}>
            Checking access…
          </h1>

          {/* Slanted progress bar */}
          <div aria-hidden="true" className="mt-6 h-2 w-full overflow-hidden bg-white/10" style={slant}>
            <div className="h-full w-1/3 bg-[#dc2626] motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0e10] font-sans text-white selection:bg-[#dc2626] selection:text-white">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Portfolio />} />
          <Route path="/vehicles/:slug" element={<VehicleDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<ArticleDetail />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin onAuthenticated={() => setIsAdmin(true)} />} />
          <Route
            path="/admin/worklist"
            element={
              <ProtectedAdminRoute isAdmin={isAdmin}>
                <AdminWorklist onLogout={handleLogout} />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}