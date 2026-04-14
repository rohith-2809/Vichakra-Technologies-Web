import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

// Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import ClientsPage from './pages/admin/ClientsPage';
import ClientDetailPage from './pages/admin/ClientDetailPage';
import ProjectsPage from './pages/admin/ProjectsPage';
import ProjectDetailPage from './pages/admin/ProjectDetailPage';
import FilesPage from './pages/admin/FilesPage';
import StatusUpdatesPage from './pages/admin/StatusUpdatesPage';
import AdminFeedbackPage from './pages/admin/FeedbackPage';
import AdminSupportPage from './pages/admin/SupportPage';
import DocumentsPage from './pages/admin/DocumentsPage';

// Portal
import PortalLayout from './components/portal/PortalLayout';
import PortalDashboardPage from './pages/portal/PortalDashboardPage';
import RequirementsPage from './pages/portal/RequirementsPage';
import SupportPage from './pages/portal/SupportPage';
import FeedbackPage from './pages/portal/FeedbackPage';

// Public pages
import HomePage from './pages/HomePage';
import AboutUsPage from './pages/AboutUsPage';
import WhyUsPage from './pages/WhyUsPage';
import OurFlowPage from './pages/OurFlowPage';
import ContactUsPage from './pages/ContactUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// Public-site pages (with Navbar + Footer)
function PublicRoutes() {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-[72px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="flex-grow"
          >
            <Routes location={location}>
              <Route path="/"        element={<HomePage />} />
              <Route path="/about"   element={<AboutUsPage />} />
              <Route path="/why-us"  element={<WhyUsPage />} />
              <Route path="/our-flow" element={<OurFlowPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms"   element={<TermsConditionsPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Auth — no Navbar/Footer */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin — protected, role: admin */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index                   element={<AdminDashboardPage />} />
              <Route path="clients"          element={<ClientsPage />} />
              <Route path="clients/:id"      element={<ClientDetailPage />} />
              <Route path="projects"         element={<ProjectsPage />} />
              <Route path="projects/:id"     element={<ProjectDetailPage />} />
              <Route path="files"            element={<FilesPage />} />
              <Route path="status"           element={<StatusUpdatesPage />} />
              <Route path="feedback"         element={<AdminFeedbackPage />} />
              <Route path="support"          element={<AdminSupportPage />} />
              <Route path="documents"        element={<DocumentsPage />} />
            </Route>

            {/* Client Portal — protected, role: client */}
            <Route
              path="/portal/*"
              element={
                <ProtectedRoute role="client">
                  <PortalLayout />
                </ProtectedRoute>
              }
            >
              <Route index                       element={<PortalDashboardPage />} />
              <Route path="requirements"         element={<RequirementsPage />} />
              <Route path="support"              element={<SupportPage />} />
              <Route path="feedback"             element={<FeedbackPage />} />
            </Route>

            {/* Public site */}
            <Route path="/*" element={<PublicRoutes />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
