import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { HomePage } from './components/HomePage';
import { UploadPage } from './components/UploadPage';
import { ResultsPage } from './components/ResultsPage';
import { HistoryPage } from './components/HistoryPage';
import { ProfilePage } from './components/ProfilePage';
import { Toaster } from './components/ui/sonner';

type Page = 'landing' | 'login' | 'signup' | 'home' | 'upload' | 'results' | 'history' | 'profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [resultsData, setResultsData] = useState<any>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Redirect authenticated users from auth pages
    if (user && (currentPage === 'login' || currentPage === 'signup' || currentPage === 'landing')) {
      setCurrentPage('home');
    }
    // Redirect unauthenticated users from protected pages
    else if (!user && !loading && !['landing', 'login', 'signup'].includes(currentPage)) {
      setCurrentPage('landing');
    }
  }, [user, loading, currentPage]);

  const handleNavigation = (page: string, data?: any) => {
    if (page === 'results' && data) {
      setResultsData(data);
    }
    setCurrentPage(page as Page);
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('home');
    } else {
      setCurrentPage('signup');
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-red-500"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigation} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigation} />;
      case 'home':
        return <HomePage onNavigate={handleNavigation} />;
      case 'upload':
        return <UploadPage onNavigate={handleNavigation} />;
      case 'results':
        return resultsData ? (
          <ResultsPage data={resultsData} onNavigate={handleNavigation} />
        ) : (
          <HomePage onNavigate={handleNavigation} />
        );
      case 'history':
        return <HistoryPage onNavigate={handleNavigation} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigation} />;
      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={handleNavigation} />
      <main>
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}