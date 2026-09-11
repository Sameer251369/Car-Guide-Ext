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
import AdminLogin from './pages/AdminLogin';
import AdminWorklist from './pages/AdminWorklist';

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-300">
        Checking admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-950 font-sans">
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
